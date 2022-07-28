export interface IResult<D=any> {
  isReturn(): this is Return<D>
  isThrow(): this is Throw  
  unwrap(printReportedError?: (err: Error) => void): D

  readonly log: Log
  errors(): Iterable<Error>
}

export interface Log extends Iterable<any> {
  readonly messages?: ReadonlyArray<any>
  filter<S = any>(pred?: (e: any) => e is S): Iterable<S>
}

export interface Return<D> extends IResult<D> {
  exit: 'return'
  data: D
}

export interface Throw extends IResult {
  exit: 'throw'
  error: any
}

export type Result<D> = Return<D> | Throw
export type Fn = (...args: any[]) => any

export class Exit<D=any> implements IResult<D> {
  isThrow(): this is Throw {
    return this.exit === 'throw'
  }

  isReturn(): this is Return<D> {
    return this.exit === 'return'
  }

  unwrap(printReportedError?: (err: Error) => void): D {
    if (printReportedError)
      for (const error of this.log.filter(isError))
        printReportedError(error)
    if (this.isReturn()) return this.data
    throw this.data
  }

  get error() { return this.data }

  *errors(): Iterable<Error> {
    for (const error of this.log.filter(isError))
      yield error
    if (this.isThrow() && this.error instanceof Error)
      yield this.error
  }
  
  constructor (
    public readonly exit: 'return' | 'throw',
    public readonly log: Log,
    public readonly data: any) { }
}

function isError(m: any): m is Error {
  return m instanceof Error
}

const YES = () => true
export class Report implements Log {
  messages?: any[]

  *[Symbol.iterator](): Iterator<any> {
    if (!this.messages) return
    for (const m of this.messages) {
      if (m instanceof Report) yield *m
      else yield m
    }
  }

  *filter<S>(pred: (e: any) => e is S = YES as any): Iterable<S> {
    for (const m of this) if (pred(m)) yield m
  }

  report(msg: any) {
    if (!this.messages) this.messages = []
    this.messages.push(msg)
  }  
}

let currentLog: Report | null = null

export function report<T>(msg: T): T {
  currentLog?.report(msg)
  return msg
}

export function execute<F extends Fn, T extends ThisParameterType<F>, A extends Parameters<F>>(fn: F, self: T, args: A): Result<ReturnType<F>> {
  const lastLog = currentLog
  const log = new Report
  let exit: 'return' | 'throw' = 'return'
  let data: any = null
  try {
    currentLog = log
    data = fn.apply(self, args)
  } catch (error) {
    exit = 'throw'
    data = error as Error
  } finally {
    currentLog = lastLog
  }
  return new Exit(exit, log, data)
}

export function getResult<F extends (this: undefined) => any>(fn: F): Result<ReturnType<F>> {
  return execute(fn, undefined as ThisParameterType<F>, NO_ARGS as Parameters<F>)
}

const NO_ARGS: [] = []