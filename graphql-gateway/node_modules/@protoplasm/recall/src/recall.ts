import { Fn, Result, report, execute } from './report'
import Trie from './weakish-trie'

export type Recall<F extends Fn> = F & {
  getResult(this: ThisParameterType<F>, ...args: Parameters<F>): Result<ReturnType<F>>
  getExisting(this: ThisParameterType<F>, ...args: Parameters<F>): Result<ReturnType<F>> | undefined
}

export type StrongRecall<F extends Fn> = F & {
  getResult(this: ThisParameterType<F>, ...args: Parameters<F>): Result<ReturnType<F>>
  getExisting(this: ThisParameterType<F>, ...args: Parameters<F>): Result<ReturnType<F>> | undefined
  eachExisting(this: ThisParameterType<F>, ...args: Prefix<Parameters<F>>): Iterable<[[ThisParameterType<F>, ...Parameters<F>], Result<ReturnType<F>>]>
}

type Prefix<A extends any[]> =
  | []
  | [A[0]]
  | [A[0], A[1]]
  | [A[0], A[1], A[2]]
  | [A[0], A[1], A[3], A[4]]
  | [A[0], A[1], A[3], A[4], A[5]]
  | [A[0], A[1], A[3], A[4], A[5], A[6]]
  | [A[0], A[1], A[3], A[4], A[5], A[6], A[7]]
  | [A[0], A[1], A[3], A[4], A[5], A[6], A[7], A[8]]

type Cache<F extends Fn>
  = Trie<[ThisParameterType<F>, ...Parameters<F>], Result<ReturnType<F>>>

function createRecall<F extends Fn>(fn: F, cache: Cache<F> = Trie.weakish()): Recall<F> | StrongRecall<F> {
  type This = ThisParameterType<F>
  type Args = Parameters<F>
  type Key = [This, ...Args]
  type Return = ReturnType<F>
  function call(this: This, ...args: Args): Return {
    const result = getResult.apply(this, args)
    report(result.log)
    return result.unwrap()
  }

  function getResult(this: This, ...args: Args): Result<Return> {
    const entry = cache.entry(this, ...args)
    const result = entry.value ? entry.value : entry.set(execute(fn, this, args))
    return result
  }

  function getExisting(this: This, ...args: Args): Result<Return> | undefined {
    return cache.entry(this, ...args).value
  }

  function *eachExisting(this: This, ...args: Args): Iterable<[Key, Result<Return>]> {
    const entry = cache.entry(this, ...args)
    yield *entry.entries() as Iterable<[Key, Result<Return>]>
  }

  call.getResult = getResult
  call.getExisting = getExisting
  call.eachExisting = eachExisting
  return call as any as Recall<F>
}

type RecallFn = <F extends Fn>(fn: F) => Recall<F>

export const recall: RecallFn = createRecall as RecallFn
export default recall
