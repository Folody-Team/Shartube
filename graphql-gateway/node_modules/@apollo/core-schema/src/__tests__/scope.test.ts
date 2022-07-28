import { EnumValueDefinitionNode, Kind } from 'graphql'
import Scope from '../scope'

describe('a scope', () => {
  it('does not treat enum value definitions as references', () => {
    const node: EnumValueDefinitionNode = {
      kind: Kind.ENUM_VALUE_DEFINITION,
      name: { kind: Kind.NAME, value: 'HELLO' }
    }
    expect(Scope.EMPTY.denormalize(node))
      .toBe(node)
  })
})