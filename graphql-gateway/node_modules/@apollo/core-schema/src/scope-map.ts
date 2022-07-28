/**
 * ScopeMap<K, V> provides a mutable, heirarchical mapping from K -> V.
 */
export class ScopeMap<K, V> {
  own(key: K): V | undefined {
    return this.#entries.get(key)
  }

  has(key: K): boolean {
    return this.hasOwn(key) || !!this.parent?.has(key)
  }

  hasOwn(key: K): boolean {
    return this.#entries.has(key)
  }

  lookup(key: K): V | undefined {
    return this.own(key) ?? this.parent?.lookup(key)
  }

  entries(): Iterable<[K, V]> {
    return this.#entries.entries()
  }

  *visible(): Iterable<[K, V]> {
    const seen = new Set<K>()
    for (const ent of this.entries()) {
      seen.add(ent[0])
      yield ent
    }
    if (this.parent) for (const ent of this.parent.visible()) {
      if (seen.has(ent[0])) continue
      seen.add(ent[0])
      yield ent
    }
  }

  readonly #entries: Map<K, V>

  set(key: K, value: V): void {
    this.#entries.set(key, value)
  }

  constructor(
    public readonly parent?: ScopeMap<K, V>,
    entries = new Map<K, V>()
  ) {
    this.#entries = entries
  }
}

export default ScopeMap