import { ParseOptions, Source, DefinitionNode, Kind, TokenKind } from 'graphql'
import { Parser as BaseParser } from 'graphql/language/parser'

export interface Options extends ParseOptions {
  name?: string
}

export function gql(body: TemplateStringsArray, opts?: string | Options) {
  const name = typeof opts === 'string' ? opts : opts?.name
  const source = new Source(String.raw(body), name)
  const parser = new Parser(source, typeof opts === 'object' ? opts : {})
  return parser.parseDocument()
}

export default gql

export class Parser extends BaseParser {
  parseDefinition(): DefinitionNode {
    if (this.peek(TokenKind.AT)) {
      return this.node<DefinitionNode>(this._lexer.token, {
        kind: Kind.SCHEMA_EXTENSION,
        directives: this.parseDirectives(true)
      })
    }
    return super.parseDefinition()
  }
}
