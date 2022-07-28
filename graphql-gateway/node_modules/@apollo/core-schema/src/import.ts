import { ConstDirectiveNode, DirectiveNode, Kind, Location, NamedTypeNode, NameNode, Source, TokenKind } from 'graphql'
import { Parser } from 'graphql/language/parser'

export type ImportTermNode = DirectiveNode | NamedTypeNode
export interface ImportNode<T extends ImportTermNode = ImportTermNode> {
  type: 'Import'
  element: T
  alias?: T
  loc?: Location
}

export class ImportsParser extends Parser {
  static fromString(source: string) {
    return new ImportsParser(new Source(source))
      .parseImports()
  }

  /**
   * Imports: Import+
   * 
   * @returns import nodes
   */
  parseImports(): ImportNode[] {
    return this.many(
      TokenKind.SOF,
      this.parseImport,
      TokenKind.EOF,
    )
  }

  /**
   * Import:
   *    ImportName
   *    ImportDirective
   * 
   * ImportName: Alias? Name
   * Alias: Name ":"
   * ImportDirective: DirectiveAlias? DirectiveName
   * DirectiveName: "@" Name
   * DirectiveAlias: DirectiveName ":"
   * 
   * @returns the import node
   */
  parseImport() {
    const start = this._lexer.token
    const first = this.parseImportElement()    
    if (this.peek(TokenKind.COLON)) {
      this.expectToken(TokenKind.COLON)
      const remote = this.parseImportElement()
      if (remote.kind !== first.kind)
        throw new Error('local and remote name must be same kind of reference')
      return this.node<ImportNode>(start, {
        type: 'Import',
        element: remote,
        alias: first
      })
    }
    if (this.peek(TokenKind.PAREN_L)) {
      this.expectToken(TokenKind.PAREN_L)
      this.expectKeyword('as')
      const local = this.parseImportElement()
      if (local.kind !== first.kind)
        throw new Error('local and remote name must be same kind of reference')
      this.expectToken(TokenKind.PAREN_R)
      return this.node<ImportNode>(start, {
        type: 'Import',
        element: first,
        alias: local
      })      
    }
    return this.node<ImportNode>(start, {
      type: 'Import',
      element: first
    })
  }

  parseImportElement() {
    if (this.peek(TokenKind.AT))
      return this.parseDirectiveName()
    return this.parseNamedType()
  }

  parseDirectiveName() {
    const start = this._lexer.token
    const at = this.expectToken(TokenKind.AT)
    if (this.peek(TokenKind.NAME)) {
      // accept immediately adjacent names only
      const tok = this._lexer.token
      if (tok.line === at.line && tok.column === at.column + 1)
        return this.node<ConstDirectiveNode>(start, {
          kind: Kind.DIRECTIVE,
          name: this.parseName()
        })
    }
    return this.node<ConstDirectiveNode>(start, {
      kind: Kind.DIRECTIVE,
      name: this.node<NameNode>(at, { kind: Kind.NAME, value: '' })
    })
  }
}
