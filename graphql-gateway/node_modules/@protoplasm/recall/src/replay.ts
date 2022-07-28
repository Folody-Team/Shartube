import recall from './recall'
import { execute, report, Result, Return } from './report'

export type ItemOf<I extends Iterator<any>> = I extends Iterator<infer T> ? T : never
export type IterFn = (...args: any) => Iterator<any>
export interface Replay<F extends IterFn> {
  (...args: Parameters<F>): ReplayIterable<ItemOf<ReturnType<F>>>
}

export interface ReplayIterable<T> extends Iterable<T> {
  results(): Iterable<Result<IteratorResult<T>>>
}

export function replay<F extends IterFn>(fn: F): Replay<F> { 
  return recall(call)

  type Return = ReplayIterable<ItemOf<ReturnType<F>>>

  function call(this: ThisParameterType<F>, ...args: Parameters<F>): Return {
    const result = execute(fn, this, args)
    if (result.isThrow()) throw result.error
    return new Record(result)
  }
}

export class Record<T> implements ReplayIterable<T> {
  constructor(base: Return<Iterator<T>>) {
    this.#iter = base.data
  }
  
  *[Symbol.iterator]() {
    for (const result of this.results()) {
      report(result.log)
      if (result.isThrow()) throw result.error
      const { done, value } = result.data
      if (!done) yield value
    }
  }

  *results() {
    const results = this.#results ?? this.#advance()
    let index = 0
    while (index < results.length) {
      yield results[index++]
      if (index >= results.length && !this.#done)
        this.#advance()
    }
  }

  #iter: Iterator<T>
  #results: [Result<IteratorResult<T>>, ...Result<IteratorResult<T>>[]] | null = null;

  get #done() {
    if (!this.#results) return false
    const last = this.#results[this.#results.length - 1]
    if (last.isThrow()) return true
    return last.data.done
  }

  #advance() {
    if (!this.#results)
      return this.#results = [execute(this.#iter.next, this.#iter, NO_ARGS)]
    this.#results.push(execute(this.#iter.next, this.#iter, NO_ARGS))
    return this.#results
  }
}

const NO_ARGS: [] = []

export default replay
