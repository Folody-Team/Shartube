import { type ASTKindToNode, type ASTNode, Kind, type NameNode } from 'graphql'
import { groupBy } from './each'

export function isAst<K extends ASTNode["kind"] = ASTNode["kind"]>(obj: any, ...kinds: K[]): obj is ASTKindToNode[K] {
  if (!kinds.length)
    return typeof obj?.kind === 'string'
  return kinds.indexOf(obj?.kind) !== -1
}

export type ToDefinitionKind<T> =
  T extends `${infer _}Definition`
    ? T
    :
  T extends `${infer K}Extension` ?
    `${K}Definition`
    :
    undefined

export function toDefinitionKind<K extends string>(kind: K): ToDefinitionKind<K> {
  if (kind.endsWith('Definition')) return kind as ToDefinitionKind<K>
  if (kind.endsWith('Extension'))
    return kind.substring(0, kind.length - 'Extension'.length) + 'Definition' as ToDefinitionKind<K>
  return undefined as ToDefinitionKind<K>
}

export const hasName = <T>(o: T): o is T & { name: NameNode } =>
  o && isAst((o as any).name, Kind.NAME)

export const byName = groupBy(
  <T>(field: T): T extends { name: NameNode } ? string : undefined =>
    (field as any).name?.value
)

export const byKind = groupBy(
  <T>(node: T): T extends { kind: infer K } ? K : undefined =>
    (node as any).kind
)
