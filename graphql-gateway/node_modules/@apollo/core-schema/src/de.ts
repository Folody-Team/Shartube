import { replay, report } from '@protoplasm/recall'
import { ASTNode, DefinitionNode, DirectiveNode, Kind, NamedTypeNode } from 'graphql'
import { first } from './each'
import err from './error'
import GRef, { byGref, HasGref } from './gref'
import { isAst } from './is'
import LinkUrl from './link-url'

/**
 * A reference could not be matched to a definition.
 * 
 * @param gref 
 * @param nodes 
 * @returns ErrNoDefinition
 */
export const ErrNoDefinition = (gref: GRef, ...nodes: ASTNode[]) =>
  err('NoDefinition', {
    message: `no definitions found for reference: ${gref}`,
    gref,
    nodes
  })

/**
 * A detatched (or denormalized) AST node. Detached nodes have an `gref'
 * property which holds their location within the global graph. This makes them
 * easier to move them between documents, which may have different sets of `@link`
 * directives (and thus different namespaces).
 */
export type De<T> =
  T extends (infer E)[]
    ? De<E>[]
    :
  T extends Locatable
    ? {
      [K in keyof T]:
        K extends 'kind' | 'loc'
          ? T[K]
          :
        De<T[K]>
    } & HasGref
    :
  T extends object
    ? {
      [K in keyof T]: K extends 'kind' | 'loc'
        ? T[K]
        :
      De<T[K]>
    }
    :
  T

export type Def = De<DefinitionNode> | Redirect
export type Defs = Iterable<Def>

export interface Redirect {
  code: 'Redirect'
  gref: GRef
  toGref: GRef
  via: DirectiveNode
}

export const isRedirect = (o: any): o is Redirect => o?.code === 'Redirect'

export type Locatable =
  | DefinitionNode
  | DirectiveNode
  | NamedTypeNode

export type Located = Locatable & HasGref


/**
 * Complete `source` definitions with definitions from `atlas`.
 *
 * Emits the set of defs to be added along with *all* Redirects which were
 * followed to find them. Callers should use the redirects to update
 * redirected references to their final location.
 *
 * Reports ErrNoDefinition for any dangling references.
 *
 * @param source the source defs which need filling in
 * @param atlas  all the defs we could fill
 * @yields denormalized definition nodes and redirects
 */
export function *fill(source: Defs, atlas?: Defs): Defs {
  const notDefined = new Map<GRef, Locatable[]>()
  const seen = new Set<GRef>(byGref(onlyDefinitions(source)).keys())
  const atlasDefs = atlas ? byGref(atlas) : null

  ingest(source)

  while (notDefined.size) {
    const [ref, nodes] = first(notDefined.entries())
    notDefined.delete(ref)
    if (seen.has(ref)) continue
    seen.add(ref)
    const defs = atlasDefs?.get(ref)
    if (!defs) {
      report(ErrNoDefinition(ref, ...nodes))
      continue
    }
    ingest(defs)
    yield* defs
  }

  function ingest(defs: Defs) {
    for (const node of refNodesIn(defs))
      if (isRedirect(node))
        addGref(node.toGref, node.via)
      else 
        addGref(node.gref, node)
  }

  function addGref(gref: GRef, node: Locatable) {
    if (seen.has(gref) || gref.graph === LinkUrl.GRAPHQL_SPEC)
      return
    const existing = notDefined.get(gref)
    if (existing)
      existing.push(node)
    else
      notDefined.set(gref, [node])
  }
}

function *onlyDefinitions(defs: Defs): Iterable<De<DefinitionNode>> {
  for (const def of defs) if (!isRedirect(def)) yield def
}

export function *refNodesIn(defs: Defs | Iterable<ASTNode>): Iterable<Located | Redirect> {
  for (const def of defs) {
    if (isRedirect(def)) yield def
    else yield* deepRefs(def)
  }
}

export const deepRefs: (root: ASTNode | ASTNode[]) => Iterable<Located> = replay(
  function *(root: ASTNode | Iterable<ASTNode>) {
    if (isLocatable(root) && hasRef(root)) yield root
    for (const child of children(root)) {
      if (isAst(child)) yield *deepRefs(child)
    }
  }
)

type ChildOf<T> =
  T extends (infer E)[]
    ? E
    :
  T extends object
    ? {
      [k in keyof T]: T[k] extends (infer E)[]
        ? E
        : T[k]
    }[keyof T]
    :
  T

export function *children<T>(root: T): Iterable<ChildOf<T>> {
  if (Array.isArray(root)) return yield *root
  if (typeof root === 'object') {
    for (const child of Object.values(root)) {
      if (Array.isArray(child)) yield *child
      else yield child
    }
  }
}

export const hasRef = (o?: any): o is HasGref =>
  o?.gref instanceof GRef

const LOCATABLE_KINDS = new Set([
  ...Object.values(Kind)
    .filter(k => k.endsWith('Definition') || k.endsWith('Extension'))
    .filter(k => !k.startsWith('Field'))
    .filter(k => k !== 'OperationDefinition' && k !== 'FragmentDefinition'),
  Kind.DIRECTIVE,
  Kind.NAMED_TYPE,
])

export function isLocatable(o: any): o is Locatable {
  return LOCATABLE_KINDS.has(o?.kind)
}

export function isLocated(o: any): o is Located {
  return isLocatable(o) && hasRef(o)
}
