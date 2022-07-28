import ScopeMap from '../scope-map'

describe("scope maps", () => {
  const scope = new ScopeMap<string, string>()
  scope.set('hello', 'world')
  scope.set('goodbye', 'friend')

  it("stores entries", () => {
    expect([...scope.entries()]).toEqual([
      ['hello', 'world'],
      ['goodbye', 'friend'],
    ])
    expect(scope.lookup('hello')).toBe('world')
    expect(scope.lookup('goodbye')).toBe('friend')
  })

  const child = new ScopeMap(scope)
  child.set('hello', 'child world')
  child.set('farewell', 'child')

  it("looks up entries heirarchically", () => {
    expect(child.lookup('hello')).toBe('child world')
    expect(child.lookup('farewell')).toBe('child')
    expect(child.lookup('goodbye')).toBe('friend')
  })

  it('can examine the full lookup chain', () => {
    expect([...child.visible()]).toEqual([
      ['hello', 'child world'],
      ['farewell', 'child'],
      ['goodbye', 'friend'],
    ])
  })
})
