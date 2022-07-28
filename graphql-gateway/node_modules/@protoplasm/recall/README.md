# recall

```
npm i @protoplasm/recall
```

this package lets you memoize functions and generators.

main entry points:
  - [`recall`](#recall-memoizes-functions) memoizes functions
  - [`replay`](#replay-memoizes-generators) memoizes generators
  - [`report`](#reporting-errors-and-other-things) reports non-fatal errors and messages which will also be memoized by `recall` and `replay`

## `recall` memoizes functions

`recall` takes a function and returns a memoized version:

```typescript
import recall from '@protoplasm/recall'

let calls = 0;
const hi = recall((data?: any) => {
  ++calls
  return { hello: 'world', data }
})

expect(hi()).toBe(hi())
expect(calls).toBe(1)

expect(hi(42)).toBe(hi(42))
expect(calls).toBe(2)
```

`recall`ed functions cache both normal and exceptional return paths. if the underlying function throws the first time it's called for a set of arguments, it will always throw the same error when invoked again.

arguments are shallowly compared by `===`. there is no way to change this.

### *fn*.`getResult` returns the stored result

`recall`ed functions also make `Result`s available via a `.getResult` method. `getResult` has the same signature as the underlying function, but returns `Result<T>` rather than `T`:

```typescript
const evenSquare = recall((n: number) => {
  if (n % 2 !== 0) throw new Error('odd numbers unsupported')
  return n ** 2
})

evenSquare.getResult(2).isReturn() // -> true
evenSquare.getResult(2).data       // -> 4
evenSquare.getResult(2).unwrap()   // -> 4

evenSquare.getResult(3).isReturn() // -> false
evenSquare.getResult(3).isThrow()  // -> true
evenSquare.getResult(3).error      // -> Error: odd numbers unsupported
evenSquare.getResult(3).unwrap()   // !! throws Error: odd numbers unsupported
```

### *fn.*`getExisting` soft queries the cache

the `.getExisting` method works just like `.getResult`, only it will return `undefined` rather than calling the underlying if no entry for the arguments exists in the cache.


## `replay` memoizes generators

if you try to use `recall` on a generator, you're gonna have a bad time:

```typescript
const gen = recall(function *() {
  yield 1
  yield 2
  yield 3
})
gen() === gen() // -> true
[...gen()]      // -> [1, 2, 3]
[...gen()]      // -> []  (shit.)
```

this happens because generators return iterators, which are consumed as you iterate over them.

`replay` fixes this:

```typescript
const gen = replay(function *() {
  yield 1
  yield 2
  yield 3
})
gen() === gen() // -> true
[...gen()]      // -> [1, 2, 3]
[...gen()]      // -> [1, 2, 3]
```

`replay` wraps the generator in an `Iterable` which lazily stores each value the generator emits.

## `report`ing errors

`report` lets functions report messages independent of how they return. for example, you can `report` errors while still returning data:

```typescript
import { report } from '@protoplasm/recall'

function errorsAndData() {
  report(new Error('something bad happened'))
  report(new Error('something else bad happened'))
  return "but it's still ok"
}
```

`getResult` collects all messages `report`ed from a block. it returns these as part of a `Result`:

```typescript
import { Result, getResult } from '@protoplasm/recall'

const result: Result<string> = getResult(() => errorsAndData())
for (const error of result.errors()) {
  console.log(error) // -> 'something bad happened'
                     // -> 'something else bad happened'
}
result.unwrap()   // -> 'but it's still ok'
```
### `report`s bubble up

`report` works no matter how deep you are in the call tree:

```typescript
function a() {
  report(new Error("error from a"))
  b()
}

function b() {
  report(new Error("error from b"));
  threeThingsFail();
}

function threeThingsFail() {
  report(new Error("a"));
  report(new Error("b"));
  report(new Error("c"));
}

const result = getResult(() => {
  a()
  report(new Error('one last problem'))
})
result.errors()
  // -> error from a
  // -> error from b
  // -> a
  // -> b
  // -> c
  // -> one last problem
```

## recipes

### `recall` memoizes pure functions

the simplest case:

```typescript
const sum = recall((ary: number[]) => ary.reduce((a, b) => a + b))
const a = [1, 2, 3, 4]
sum(a)
sum(a) // cache hit
```

### `recall` composite keys

you can use `recall` as a composite key map:

```typescript
const song = recall((artist: string, title: string) => new Song(artist, title))
const coversOf = recall((song: Song) => [])
coversOf(song("Cher", "Believe")).push(song("Okay Kaya", "Believe"))
coversOf(song("Cher", "Believe")).find(song("Okay Kaya", "Believe"))
```

### `recall` a cache

recall can accept async functions. it simply caches the promise result:

```typescript
const textOf = recall(async (url: string) => await (await fetch(url)).response.text)
const result = await textOf("https://...)
```

### `report` multiple errors while returning data

```typescript
const doStuff = recall(things => {
  let goodThings = []
  for (const thing of things) {
    if (isBad(thing)) {
      report(new BadThingError("this thing is bad:", thing))
    } else {
      goodThings.push(thing)   
    }
  }
  if (!goodThings.length)
    throw new Error("no good things")
  return processKnownGoodThings(goodThings)
})

const output = doStuff
  .getResult(someThings)
  // prints non-fatal errors to console.log and unwraps:
  .unwrap(console.log)
```

### `report` errors while yielding data

```typescript
const processedThings = replay(function *(things) {
  for (const thing of things) {
    if (isBad(thing)) {
      report(new BadThingError("this thing is bad:", thing))
    } else {
      yield processGoodThing(thing)
      goodThings.push(thing)   
    }
  }
})

const output = getResult(() =>
    // iterate over all processedThings to collect
    // errors on all of them    
    [...processedThings(someThings)]
  ).unwrap(console.log)
```


### using `getResult` as a reporting boundary

`getResult` and *fn.*`getResult` do not bubble `report`s up, so you can use them as error boundaries:

```typescript
function importantStuff() {
  report(new Error('error in importantStuff'))
}

function optionalSetup() {
  report(new Error('error in optionalStuff'))
}

getResult(() => {
  importantStuff()
  optionalStuff()
}).errors()
  // -> [Error: error in importantStuff]
  // -> [Error: error in optionalStuff]

getResult(() => {
  importantStuff()
  getResult(() => optionalStuff())
    // swallowing the result swallows the error
}).errors()
  // -> [Error: error in importantStuff]
```
#### manually bubbling

you can `report(someResult.log)` to explicitly bubble up messages from `someResult`.

this is useful if you want to use `getResult` (for example, to inspect the errors) but still want bubbling to happen:

```typescript
getResult(() => {
  importantStuff()
  const result = getResult(() => optionalStuff())
  for (const error in result.errors()) doSomethingElseWith(error)  
  report(result.log)
}).errors()
  // -> [Error: error in importantStuff]
  // -> [Error: error in optionalStuff]
```