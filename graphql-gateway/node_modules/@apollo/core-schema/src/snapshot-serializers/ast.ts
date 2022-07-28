import { type ASTNode, print as printNode, Location, TokenKind } from 'graphql'
import { hasRef } from '../de'

/**
 * Serialize AST nodes as a snippet of the source.
 * 
 * This keeps snapshots more readable, as AST nodes typically have a whole
 * subtree attached to them.
 */
export const test = (val: any) => typeof val?.kind === 'string'
export const print = (val: ASTNode) => {
  const gref = hasRef(val)
    ? `<${val.gref?.toString() ?? ''}>`
    : ''
  if (!val.loc) return `${gref}[+] ${printNode(val)}`
  const loc = skipDescription(val.loc)
  const {line} = loc
  let start = loc
  let end = loc
  while (start.prev && start.prev.line === line)
    start = start.prev
  while (end.next && end.next.line === line)
    end = end.next
  const text = val.loc.source.body.substring(start.start, end.end)  
  const col = loc.start - start.start
  const head = text.substring(0, col)
  const tail = text.substring(col)
  return `${gref}[${val.loc.source.name}] ${head}👉${tail}`
}

function skipDescription(loc: Location) {
  if (loc.startToken.kind === TokenKind.BLOCK_STRING) return loc.startToken.next!
  return loc.startToken
}