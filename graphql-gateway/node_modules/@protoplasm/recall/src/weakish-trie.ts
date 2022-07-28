/**
 * A Trie map keys of some array type K to values V.
 * 
 */
export class Trie<K extends any[], V> {
  /**
   * Return a new, empty weakish trie, in which keys are
   * held as weakly as possible.
   * 
   * @returns a weakish trie
   */
  public static weakish<K extends any[], V>(): Trie<K, V> {
    return new Trie(WeakishNode.empty<V>())
  }

  public static strong<K extends any[], V>(): StrongTrie<K, V> {
    return new StrongTrie()
  }

  constructor(protected readonly root: Node<V>) {}

  entry(...key: K): Occupied<V> | Vacant<V> {
    let node = this.root
    const len = key.length
    for (let i = 0; i !== len; ++i) {
      const part = key[i]
      const next = node.child(part)
      if (!next) return new Vacant(node, key, i)
      node = next
    }
    if (node.isEmpty())
      return new Vacant(node, key, len)
    return new Occupied(node, key)
  }
}

export class StrongTrie<K extends any[], V> extends Trie<K, V> {
  entries() { return this.root.entries!() } 
  constructor() { super(StrongNode.empty<V>()) }
}

type RefType = 'strong' | 'weak'

interface INode<V> {
  data: V | Empty
  isEmpty(): this is EmptyNode
  hasData(): this is FullNode<V>
  child(keyPart: any): Node<V> | undefined
  findOrCreateChild(keyPart: any): Node<V>
  entries?(...keyPrefix: any[]): Iterable<[any[], V]>
}

interface FullNode<V> extends INode<V> {
  data: V
}

interface EmptyNode extends INode<any> {
  data: Empty
}

type Node<V> = FullNode<V> | EmptyNode

const EMPTY = Symbol('is empty')
type Empty = typeof EMPTY

class WeakishNode<V> implements INode<V> {
  static empty<V>(): EmptyNode {
    return new this<V>() as EmptyNode
  }

  data: V | Empty = EMPTY
  strong?: Map<any, Node<V>>
  weak?: WeakMap<any, Node<V>>

  child(keyPart: any): Node<V> | undefined {
    return this[this.getRefType(keyPart)]?.get(keyPart)
  }

  isEmpty(): this is EmptyNode {
    return this.data === EMPTY
  }

  hasData(): this is FullNode<V> {
    return this.data !== EMPTY
  }

  findOrCreateChild(keyPart: any): Node<V> {
    const type = this.getRefType(keyPart)
    const map = this.getOrCreateMap(type)
    const existing = map.get(keyPart)
    if (existing) return existing
    const created = WeakishNode.empty<V>()
    map.set(keyPart, created)
    return created
  }

  getOrCreateMap<T extends RefType>(type: T) {
    if (type === 'strong')
      return this.strong ? this.strong : (this.strong = new Map)
    else
      return this.weak ? this.weak : (this.weak = new WeakMap)
  }

  getRefType(o: any): RefType {
    if (o == null) return 'strong'
    if (typeof o === 'object') return 'weak'
    return 'strong'
  }

  *entries(...keyPrefix: any[]): Iterable<[any[], V]> {
    if (this.hasData()) yield [keyPrefix, this.data]
    if (!this.strong) return
    for (const [k, child] of this.strong.entries())
      if (child.entries) yield *child.entries(...keyPrefix, k)
  }
}

class StrongNode<V> extends WeakishNode<V> {
  getRefType(_: any): RefType { return 'strong' }
}

class Vacant<V> {
  constructor(
    private readonly node: Node<V>,
    public readonly key: any[],
    private readonly startIndex: number,
    ) { this.node = node }

  readonly exists = false
  get value(): undefined { return undefined }

  set(value: V): V {
    let node = this.node
    const {key, startIndex} = this
    const len = key.length
    for (let i = startIndex; i !== len; ++i) {
      const part = key[i]
      node = node.findOrCreateChild(part)
    }
    return node.data = value
  }

  orSet(value: V) {
    return this.set(value)
  }

  orSetWith(create: (key: any[]) => V) {
    return this.set(create(this.key))
  }

  *entries() {
    if (this.node.entries && this.startIndex === this.key.length) {
      yield *this.node.entries(...this.key)
    }
  }
}

class Occupied<V> {
  constructor(
    private readonly node: Node<V> & { data: V },
    public readonly key: any[]) {}

  readonly exists = true
  get value(): V { return this.node.data }
  
  set(value: V): V {
    return this.node.data = value
  }

  orSet(_: V) {
    return this.node.data
  }

  orSetWith(_: (key: any[]) => V) {
    return this.node.data
  }

  *entries() {
    if (this.node.entries)
      yield *this.node.entries(...this.key)
  }
}

export default Trie