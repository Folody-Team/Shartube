import recall, { replay, report, use } from '@protoplasm/recall'
import { GraphQLDirective, DirectiveNode, DirectiveLocation, GraphQLScalarType, GraphQLNonNull, Kind, ConstDirectiveNode, ConstArgumentNode, ValueNode, ASTNode } from 'graphql'
import { getArgumentValues } from 'graphql/execution/values'
import { Maybe } from 'graphql/jsutils/Maybe'
import { ImportNode, ImportsParser } from './import'
import type { IScope } from './scope'
import {LinkUrl} from './link-url'
import { GRef, HasGref } from './gref'
import { scopeNameFor } from './names'
import { groupBy, maybeOne, only } from './each'
import { De } from './de'
import { byName, isAst } from './is'
import err from './error'
import gql from './gql'
import directives from './directives'

const LINK_SPECS = new Map([
  ['https://specs.apollo.dev/core/v0.1', 'feature'],
  ['https://specs.apollo.dev/core/v0.2', 'feature'],
  ['https://specs.apollo.dev/link/v0.3', 'url'],
  ['https://specs.apollo.dev/link/v1.0', 'url'],
])

export const LINK_DIRECTIVES = new Set(
  [...LINK_SPECS.keys()].map(url => GRef.rootDirective(url))
)

export const LINK_SPEC_URLS = new Set(
  [...LINK_DIRECTIVES].map(ref => ref.graph)
)

const Url = new GraphQLScalarType({
  name: 'Url',
  parseValue: val => val,  
  parseLiteral(node): Maybe<LinkUrl> {
    if (node.kind === 'StringValue')
      return LinkUrl.parse(node.value)
    return null
  }
})

const Name = new GraphQLScalarType({
  name: 'Name',
  parseValue: val => val,
  parseLiteral(node): Maybe<string> {
    if (node.kind === 'StringValue') return node.value
    if (node.kind === 'EnumValue') return node.value
    return
  }
})

export const ErrBadImport = (node: ASTNode, expectedKinds: ASTNode["kind"][]) =>
  err('BadImport', {
    message: `expected node of kind ${expectedKinds.join(' | ')}, got ${node.kind}`,    
    node, expectedKinds
  })

const Imports = new GraphQLScalarType({
  name: 'Imports',
  parseValue: val => val,
  parseLiteral(value: ValueNode): Maybe<ImportNode[]> {
    if (value.kind === Kind.LIST) {
      const text = value.values.map(value => {
        if (value.kind === Kind.STRING)
          return value.value
        if (value.kind === Kind.OBJECT) {
          const name = only(byName(value.fields).get('name')).value
          const alias = maybeOne(byName(value.fields).get('as'))?.value
          if (!isAst(name, Kind.STRING, Kind.ENUM)) {
            report(ErrBadImport(name, [Kind.STRING, Kind.ENUM]))
            return
          }
          if (alias && !isAst(alias, Kind.STRING, Kind.ENUM)) {
            report(ErrBadImport(alias, [Kind.STRING, Kind.ENUM]))
            return
          }
          if (alias && alias.value !== name.value)
            return `${alias.value} : ${name.value}`
          return name.value
        }
        return undefined
      }).filter(Boolean).join(' ')
      return ImportsParser.fromString(text)
    }
    if (value.kind !== Kind.STRING) return
    return ImportsParser.fromString(value.value)
  }
})

const $bootstrap = new GraphQLDirective({
  name: 'link',
  args: {
    url: { type: Url },
    feature: { type: Url },
    as: { type: Name },
  },
  locations: [ DirectiveLocation.SCHEMA ],
  isRepeatable: true,
})

export interface Link extends HasGref {
  name: string
  via?: DirectiveNode
  linker?: DirectiveNode
  implicit?: boolean
}

const $id = new GraphQLDirective({
  name: 'id',
  args: {
    url: { type: new GraphQLNonNull(Url) },
    as: { type: Name },
  },
  locations: [DirectiveLocation.SCHEMA],
  isRepeatable: true,
})

const ID_DIRECTIVE = GRef.rootDirective('https://specs.apollo.dev/id/v1.0')

export const id = recall(
  function id(scope: IScope, dir: DirectiveNode): Maybe<Link> {
    if (scope.locate(dir) === ID_DIRECTIVE) {
      const args = getArgumentValues($id, dir)
      const url = args.url as LinkUrl
      const name: string = (args.as ?? url.name) as string
      return {
        name,
        gref: GRef.schema(url),
        via: dir,
      }
    }
    return null
  }
)

export class Linker {
  static from(scope: IScope, dir: DirectiveNode): Linker | undefined {
    const self = this.bootstrap(dir)
    if (self) return self
    const other = scope.lookup('@' + dir.name.value)
    if (!other?.via) return
    return Linker.bootstrap(other.via)
  }

  @use(recall)
  static bootstrap(strap: DirectiveNode): Linker | undefined {
    const args = getArgumentValues($bootstrap, strap)
    const url: Maybe<LinkUrl> = (args.url ?? args.feature) as LinkUrl
    if (!url) return
    const urlArg = LINK_SPECS.get(url.href)
    if (!urlArg) return
    if (args[urlArg] !== url) return
    return new this(strap, url, urlArg)
  }

  static readonly DEFAULT = this.bootstrap(only(directives(gql
    `@link(url: "https://specs.apollo.dev/link/v1.0")`)))!

  protected constructor(public readonly strap: DirectiveNode,
    public readonly url: LinkUrl,
    private readonly urlParam: string) {}

  #link = new GraphQLDirective({
    name: this.strap.name.value,
    args: {
      [this.urlParam]: { type: new GraphQLNonNull(Url) },
      as: { type: Name },
      import: { type: Imports },
    },
    locations: [DirectiveLocation.SCHEMA],
    isRepeatable: true,
  })

  @use(replay)
  *links(directive: DirectiveNode): Iterable<Link> {
    const args = getArgumentValues(this.#link, directive)
    const url = args[this.urlParam] as LinkUrl
    const name: string = (args.as ?? url.name) as string
    if (name !== '') {
      yield {
        name,
        gref: GRef.schema(url),
        via: directive,
        linker: this.strap,
      }
      yield {
        name: '@' + name,
        gref: GRef.rootDirective(url),
        via: directive,
        linker: this.strap,
        implicit: true,
      }
    }
    for (const i of args.import as ImportNode[] ?? []) {
      const alias = scopeNameFor(i.alias ?? i.element)
      const name = scopeNameFor(i.element)
      yield {
        name: alias,
        gref: GRef.named(name, url),
        via: directive,
        linker: this.strap,
      }
    }    
  }

  *synthesize(links: Iterable<Link>): Iterable<De<ConstDirectiveNode>> {
    const linksByUrl = byUrl(links)
    const urls = [...linksByUrl.keys()].sort(
      (a, b) =>
        (LINK_SPEC_URLS.has(b) ? 1 : 0) -
        (LINK_SPEC_URLS.has(a) ? 1 : 0)
    )
    for (const url of urls) {
      if (!url) continue      
      if (url === LinkUrl.GRAPHQL_SPEC) continue
      const linksForUrl = linksByUrl.get(url)!
      let alias: string | null = null
      const imports: [string, string][] = []
      for (const link of linksForUrl) {
        if (!link.gref.name) {
          // a link to the schema tells us the alias,
          // if any
          alias = link.name
          continue
        }
        if (link.gref.name === '@')          
          continue // root directive is implict
        imports.push([link.name, link.gref.name])
      }

      const args: ConstArgumentNode[] = [{
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: this.urlParam
        },
        value: {
          kind: Kind.STRING,
          value: url.href,
        },
      }]

      if (alias === '') {
        yield {
          kind: Kind.DIRECTIVE,
          name: { kind: Kind.NAME, value: "id" },
          arguments:  [{
            kind: Kind.ARGUMENT,
            name: {
              kind: Kind.NAME,
              value: "url"
            },
            value: {
              kind: Kind.STRING,
              value: url.href,
            },
          }],
          gref: ID_DIRECTIVE,
        }
        continue
      }

      if (alias && alias !== url.name) {
        args.push({
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: 'as',
          },
          value: {
            kind: Kind.STRING,
            value: alias
          },
        })
      }

      if (imports.length) {
        args.push({
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: 'import',
          },
          value: {
            kind: Kind.LIST,
            values: imports.map(([alias, name]) =>
                alias === name
                  ? { kind: Kind.STRING, value: name }
                  : {
                    kind: Kind.OBJECT,
                    fields: [
                      {
                        kind: Kind.OBJECT_FIELD,
                        name: { kind: Kind.NAME, value: "name" },
                        value: { kind: Kind.STRING, value: name }
                      },
                      {
                        kind: Kind.OBJECT_FIELD,
                        name: { kind: Kind.NAME, value: "as" },
                        value: { kind: Kind.STRING, value: alias }
                      }
                    ]
                  }
              )
          },
        })
      }
        
      yield {
        kind: Kind.DIRECTIVE,
        name: this.strap.name,
        arguments: args,
        gref: GRef.rootDirective(this.url)
      }
    }
  }
}

const byUrl = groupBy((link: Link) => link.gref.graph)

