import recall, { Recall, replay } from "@protoplasm/recall"
import err from "./error"

type ItemType<G extends (item: any) => any> = Parameters<G>[0]
type ElementType<I extends Iterable<any>> = I extends Iterable<infer T> ? T : never

export const ErrEmpty = (iterable?: Iterable<any>) =>
  err('Empty', {
    message: 'expected at least one value, found zero',
    iterable
  })

export const ErrTooMany = (iterable: Iterable<any>) =>
  err('TooMany', {
    message: 'expected at most one value, found more',
    iterable
  })

export function first<I extends Iterable<any>>(iter?: I): ElementType<I> {  
  if (!iter) throw ErrEmpty(iter)
  const it = iter[Symbol.iterator]()
  const r = it.next()
  if (r.done) throw ErrEmpty(iter)
  return r.value
}

export function only<I extends Iterable<any>>(iter?: I): ElementType<I> {  
  if (!iter) throw ErrEmpty(iter)
  const it = iter[Symbol.iterator]()
  const r = it.next()
  if (r.done) throw ErrEmpty(iter)
  try {
    return r.value
  } finally {
    if (!it.next().done)
      throw ErrTooMany(iter)
  }
}

export function maybe<I extends Iterable<any>>(iter?: I): ElementType<I> | undefined {
  if (!iter) return undefined
  const it = iter[Symbol.iterator]()
  const r = it.next()  
  return r.value
}

export function maybeOne<I extends Iterable<any>>(iter?: I): ElementType<I> | undefined {  
  if (!iter) return
  const it = iter[Symbol.iterator]()
  const r = it.next()
  if (r.done) return
  try {
    return r.value
  } finally {
    if (!it.next().done)
      throw ErrTooMany(iter)
  }
}

export const groupBy: Recall<<G extends (item: any) => any>(grouper: G) => <T extends ItemType<G>>(...sources: Iterable<T>[]) => Readonly<Map<ReturnType<G>, Iterable<T>>>> = recall (
  <G extends (item: any) => any>(grouper: G): <T extends ItemType<G>>(...sources: Iterable<T>[]) => Readonly<Map<ReturnType<G>, Iterable<T>>> => {
    const groupSources = recall(
      <T extends ItemType<G>>(...sources: Iterable<T>[]): Readonly<Map<ReturnType<G>, Iterable<T>>> => {
        if (sources.length === 0) return Object.freeze(new Map)

        type Key = ReturnType<G>
        
        if (sources.length > 1) {
          const defs = new Map<Key, readonly T[]>()
          for (const src of sources) for (const ent of groupSources(src))
            defs.set(ent[0],
              Object.freeze((defs.get(ent[0]) ?? []).concat(ent[1] as T[])))
          return Object.freeze(defs)
        }

        const [source] = sources
        const defs = new Map<Key, T[]>()
        for (const def of source) {
          const key = grouper(def)
          const existing = defs.get(key)
          if (existing) existing.push(def)
          else defs.set(key, [def])
        }
        for (const ary of defs.values()) { Object.freeze(ary) }
        return Object.freeze(defs)
      })
    return groupSources
  }
)

export const flat = replay(
  function *flat<I extends Iterable<Iterable<any>>>(iters: I): Iterator<ElementType<ElementType<I>>> {
    for (const iter of iters)
      yield *iter
  }
)

export const concat = <I>(...iters: Iterable<I>[]): Iterable<I> =>
  flat(iters)
