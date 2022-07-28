import { replay } from '@protoplasm/recall'
import { ASTNode, DefinitionNode, DirectiveNode, DocumentNode, Kind, SchemaDefinitionNode, SchemaExtensionNode } from 'graphql'
import { isAst } from './is'

export type HasDirectives = DocumentNode | ASTNode & { directives?: DirectiveNode[] }

export const schemaDefinitions = replay(
  function *nodes(defs: Iterable<DefinitionNode>): Iterator<SchemaDefinitionNode | SchemaExtensionNode> {
    for (const def of defs) {
      if (isAst(def, Kind.SCHEMA_DEFINITION, Kind.SCHEMA_EXTENSION)) yield def
    }
  }
)

export const directives = replay(
  function *directives(target: HasDirectives) {
    if (isAst(target, Kind.DOCUMENT)) {
      for (const def of schemaDefinitions(target.definitions)) {
        if (!def.directives) continue
        yield *def.directives
      }      
      return
    }
    if (target.directives) yield *target.directives
  }
)

export default directives