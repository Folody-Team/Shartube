# @apollo/core-schema

*typescript library for processing core schemas*

to install via npm:

```sh
npm install @apollo/core-schema
```

to build from source:

```sh
npm install
npm test
```

# quickly

## parse a schema

```typescript
import { Schema, gql } from '@apollo/core-schema'

const schema = Schema.basic(gql`${"example.graphql"}
  @link(url: "https://specs.apollo.dev/federation/v1.0")
  @link(url: "https://specs.apollo.dev/inaccessible/v0.1")

  type User @inaccessible {
    id: ID!
  }
`);

expect([...schema]).toMatchInlineSnapshot(`
  Array [
    <>[GraphQL request] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
    <#User>[GraphQL request] 👉type User @inaccessible {,
  ]
`);

expect([...schema.scope]).toMatchInlineSnapshot()

expect([...schema.refs]).toMatchInlineSnapshot(`
  Array [
    <>[example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
    <https://specs.apollo.dev/link/v1.0#@>[example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
    <https://specs.apollo.dev/link/v1.0#@>[example.graphql] 👉@link(url: "https://specs.apollo.dev/inaccessible/v0.1"),
    <#User>[example.graphql] 👉type User @inaccessible {,
    <https://specs.apollo.dev/inaccessible/v0.1#@>[example.graphql] type User 👉@inaccessible {,
    <#ID>[example.graphql] id: 👉ID!,
  ]
`);
```


## look for directives by their global graph position

```typescript
import {Schema, Defs, GRef, directives} from '@apollo/core-schema'

const schema = Schema.basic(gql `
  extend schema
    @link(url: "https://spec.example.io/hidden/v1.0", as: "private")

  type Product
  type Admin @private
  type User
`)

const HIDDEN = GRef.rootDirective('https://spec.example.io/hidden/v1.0')
function *hiddenDefs(defs: Defs) {
  for (const def of defs) {
    for (const directive of directives(def)) {
      if (directive.gref === HIDDEN) {
        yield def
        break
      }
    }
  }
}

expect([...hiddenDefs(schema)].map(def => def.name))
  .toEqual(['Admin'])
```

## lookup names in a core schema

get a `Schema` from a document with `Schema.from` and then
look up document names via `schema.scope`:

```typescript
import {Schema, GRef, ref} from '@apollo/core-schema'

const doc = Schema.from(gql `
  extend schema
    @link(url: "https://specs.apollo.dev/link/v1.0")
    @link(url: "https://example.com/someSpec/v1.0")
    @link(url: "https://spec.example.io/another/v1.0", as: "renamed")
`)
expect(doc.scope.lookup('@link')).toBe(
  GRef.rootDirective('https://specs.apollo.dev/link/v1.0')
)
expect(doc.scope.lookup('renamed__Type'))).toBe(
  GRef.named('Type', "https://spec.example.io/another/v1.0")
)
```

## build a document with implicit scope

it's often useful to interpret a document with a set of builtin
links already in scope.

`Scope.from` takes a second argument—the so-called `frame`—to
enable this:

```typescript
const SUBGRAPH_BUILTINS = Schema.from(gql `
  extend schema
    @link(url: "https://specs.apollo.dev/link/v1.0")
    @link(url: "https://specs.apollo.dev/federation/v1.0",
          import: "@key @requires @provides @external")
`)

function subgraph(document: DocumentNode) {
  return Schema.from(document, SUBGRAPH_BUILTINS)
}

subgraph(gql `
  # @key in the next line will be linked to:
  #
  #   https://specs.apollo.dev/federation/v1.0#@key
  type User @key(field: "id") {
    id: ID!
  }
`)

subgraph(gql `
  # this will shadow the built-in link to @key:
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
    import: "@key")

  # @key in the next line will be linked to:
  #
  #   https://specs.apollo.dev/federation/v2.0#@key
  type User @key(field: "id") {
    id: ID!
  }`)
```

## iterate over links from a document
```typescript
function linksFed2(doc: Schema) {
  for (const link of doc.scope) {
    if (link.gref.graph.satisfies(LinkUrl.from("https://specs.apollo.dev/federation/v2.0"))) {
      // child links federation 2.0
      return true
    }  
  }
  return false
}

expect(
  linksFed2(Schema.basicFrom(gql `
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0")
  `))
).toBe(true)

expect(
  linksFed2(Schema.basicFrom(gql `
    extend schema @link(url: "https://specs.apollo.dev/federation/v1.9")
  `))
).toBe(false)

expect(
  linksFed2(Schema.basicFrom(gql ``))
).toBe(false)
```

## standardize names within a document

perhaps you want to scan directives in a document without having to worry about whether the user has renamed them.

the `schema.standardize(...urls)` method can help:

```typescript
const subgraph = Schema.basic(gql `
  @link(url: "https://specs.apollo.dev/federation/v2.0",
        # what weird naming choices!
        import: """
          @key      (as @fkey)
          @requires (as @frequires)
          @provides (as @fprovides)
          @tag      (as @ftag)
        """)

  type User @fkey(fields: "id") {
    id: ID! @ftag(name: "hi") @tag(name: "my tag")
  }

  # note: this is our *own* @tag directive, which looks
  # just like but means something different than
  # federation's @tag:
  directive @tag(name: string) on FIELD_DEFINITION
`);

expect(
  raw(
    // standardize takes LinkUrls and ensures that all references to that schema
    // are prefixed with its standard name
    subgraph.standardize("https://specs.apollo.dev/federation/v2.0").print()
  )
).toMatchInlineSnapshot(`
  extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/id/v1.0") @link(url: "https://specs.apollo.dev/federation/v2.0")

  type User @federation__key(fields: "id") {
    id: ID! @federation__tag(name: "hi") @tag(name: "my tag")
  }

  directive @tag(name: string) on FIELD_DEFINITION
`);
```

# motivation

this library exists to help you read and manipulate core schemas.
## background

[core schemas](https://specs.apollo.dev/core/v0.2) can reference elements from one another.

for example, this schema references federation 2.0 and uses the `@key` directive from it:

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0")

type User @federation__key(fields: "id") {
  id: ID!
}
```

here, we link the `federation` spec by its url. this links the name `federation` to the url `https://specs.apollo.dev/federation/v2.0`, instructing core-aware processors that identifiers like `federation__FieldSet` and `@federation__key` are defined by https://specs.apollo.dev/federation/v2.0.

`@link` inferred the name `federation` (and also the version `2.0`) from the url. you can also set the name explicitly:

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0", as: fedv2)

type User @fedv2__key(fields: "id") {
  id: ID!
}
```

these namespaced names can get annoying, so `@link` also provides an `import` argument, which links unprefixed names to remote definitions:

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: "@key")

type User @key(fields: "id") {
  id: ID!
}
```

the lets us fix name conflicts. for example, say i have this schema:

```graphql
type User @key(column: "id") {
  id: ID!
}

directive @key(column: string) on OBJECT
```

now say i want to make this schema a federation subgraph. federation already defines a `@key` directive; it will conflict with my own `@key` directive, which is unrelated.

with `@link`, i can give federation's `@key` directive any name i want, avoiding the conflict:

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: "@fedKey: @key")

type User @fedKey(fields: "id") @key(column: "id") {
  id: ID!
}

directive @key(column: string) on OBJECT
```

note that this also works for the `@link` directive itself:

```graphql
extend schema
  @coreLink(url: "https://specs.apollo.dev/link/v1.0", as: coreLink)
  @coreLink(url: "https://specs.apollo.dev/federation/v2.0",
        import: "@fedKey: @key")
```


## compilation

the examples above are not valid GraphQL schemas because they do not contain definitions of all the elements they name. specifically, they don't contain definitions of the federation directives, nor of `@link` itself. if you feed them to a tool which expects a valid GraphQL schema, that tool will break.

it seems like we should be able to fix this. `@link` strongly resembles an `import` statement—its existence seems to imply some compilation process which can somehow look up the relevant definitions and insert them into the document.

this library provides such a mechanism. along the way, it provides a framework for working with *global graph* definitions—constructing schemas out of them, copying them from one document to another, and so on.

### the compiler's problem

take this schema again:

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: "@fedKey: @key")

type User @fedKey(fields: "id") {
  id: ID!
}
```

the compiler has to look at this schema and insert definitions for any elements which are referenced but not defined in the document. say we have an atlas with one schema in it:

```graphql
extend schema
  # @id is @link's sister, specifying this schema's
  # position within the global graph
  @id(url: "https://specs.apollo.dev/federation/v2.0")

directive @key(fields: FieldSet!) on OBJECT
scalar FieldSet
```

the compiler needs to copy the definition for `@key` into the document. and then it also needs to copy the definition for `FieldSet`, since `@key` references `FieldSet`. and when it inserts these definitions into the document, it needs to change their names to fit the namespace of the document. core schemas can transitively `@link` other core schemas, so this may involve adding `@link`s to other schemas as well.

this library exposes an editing model designed to make this tricky task—and others like it—much easier.

# editing model

the basic approach is:
1. read a schema and construct its scope by examining its `@link` directives. the scope manages the namespace—it is able to look at any definition or reference in the document and associate it with a global graph position (a url, essentially). the scope is completely unconcerned with whether a given element has a definition within the document—its only job is to associate names with urls.
2. when copying nodes out of a document, annotate those nodes and their descendants with their global graph positions. we call this process *detachment* or *denormalization* (because the metadata carried by the `@link` directives has been denormalized into the entire tree).
3. move definitions around as needed without worrying about namespaces
4. before emitting a finished document, collect all its references, generate appropriate `@link` headers, and *renormalize* all its nodes, setting their names as appropriate.

the process of denormalizing and renormalizing nodes is mostly transparent.

## in practice

you can construct a `Schema` from a GraphQL document like so:

```typescript
import {Schema, gql} from '@apollo/core-schema'

const schema = Schema.from(gql `
  extend schema
    @id(url: "https://my/schema")
    @link(url: "https://specs.apollo.dev/link/v1.0")
    @link(url: "https://specs.apollo.dev/federation", import: "@key")
    @link(url: "https://myorg.internal/future")

  type User @key(fields: "id") @future
`)
```

`Schema`s are iterable, yielding each of the definitions in the document:

```typescript
const defs = [...schema]
```

`Schema`s always yield detached subtrees. definitions and references in a detached subtree have a `.gref` property, which locates the node within the global graph:

```typescript
import {GRef} from '@apollo/core-schema'

expect(defs[defs.length - 1].gref).toBe(
  GRef.named('User', 'https://my/schema')
)
```

(an "gref" is an "href" for the "g"raph).

you can insert detached nodes into the document using whatever mechanism:

```typescript
// helper to create a detached @tag directive
function $tag(name: string) {
  return {
    kind: Kind.DIRECTIVE,
    name: "tag",
    arguments: [{
      name: { kind: Kind.NAME, value: "name" },
      value: { kind: Kind.STRING, value: name }
    }],
    gref: GRef.rootDirective("https://specs.apollo.dev/tag/v0.1")
  }
])

// replace @future with @tag(name: "future")
const newSchema = schema.mapDoc(schema =>
  visit(schema.document, {
    Directive(node) {
      if (!hasRef(node)) return
      if (node.gref === GRef.rootDirective("https://myorg.internal/future")) {
        // replace @future with @tag(name: "future")
        return $tag("future")
      }
    }
  }))
```

finally, we can call `compile` to renormalize everything and ensure the appropriate `@link` headers are present:

```typescript
return newSchema.compile()
```

`schema.compile()` takes an optional argument, an `atlas` from which it will try to fill any definitions which are referenced but not present in the document. `atlas` can be any iterable over detached definitions. for example, it can be another `Schema`:

```typescript
const tagSchema = Schema.basic(gql`
  @id(url: "https://specs.apollo.dev/tag/v0.1")
  directive @tag(name: string) repeatable on OBJECT
`)
return newSchema.compile(tagSchema)
```

you can use the `Atlas` class to join multiple schemas together into an atlas.

## design principles

### AST-focused

this library takes an AST-focused approach to working with schemas.

this is nice because the AST can represent many situations which cannot be represented with a `GraphQLSchema`. for example, schemas which do not contain all their definitions (a principle motivation for this library!) cannot be represented in the `GraphQL*` class structure. thus, we just don't try: this library never calls `buildSchema`, nor do we touch execution-focused classes like `GraphQLSchema`.

additionally, working with the AST gives us the ability to make *small* changes to the document without radically changing the structure. by default, operations implemented here try to make minimal changes to the document, preserving its structure as well as possible. alas, limitations in the graphql parser mean that we cannot currently preserve comments.

finally, AST nodes are given a source position by the parser and retain that position even across complex transforms. this helps with error reporting, and would also make it relatively easy to generate sourcemaps, though we do not currently do this.

### pure and immutable

essentially this whole library is implemented as pure functions on immutable data structures, starting with ASTNodes (which we treat as immutable). expensive operations are memoized.

### lazy

a consequence of the pure/immutable/memoized design is that we generally do not compute anything until we need it. for example, `Schema.from` does not even scan the document's `@link`s and construct a scope until `schema.scope` is actually used. similarly, nodes are not denormalized until they are accessed.

### canonized value types

a few types—notably `GRef`, `LinkUrl`, and `Version`—are *canonized*. that is, they can only be created via a memoized function, which ensures that two equivalent instances will always be the same instance:

```typescript
expect(LinkUrl.from('https://specs/example/?extraneous&stuff&ignored'))
  .toBe(LinkUrl.from('https://specs/example'))
```

these are effectively value types, and they can be (and are) used e.g. as keys in `Map`s.