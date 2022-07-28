import { Kind, parse, Source, print } from "graphql";
import { Locatable, refNodesIn } from "../de";
import gql from "../gql";
import { GRef } from "../gref";
import LinkUrl from "../link-url";
import Schema from "../schema";
import { Atlas } from "../atlas";
import raw from "../snapshot-serializers/raw";
import { getResult } from "@protoplasm/recall";

const base = Schema.from(
  parse(
    new Source(
      `
  extend schema
    @link(url: "https://specs.apollo.dev/link/v1.0")
    @link(url: "https://specs.apollo.dev/id/v1.0")  
    
  directive @link(url: link__Url!, as: link__Schema, import: link__Import)
    repeatable on SCHEMA
  directive @id(url: link__Url!, as: link__Schema) on SCHEMA
`,
      "builtins.graphql"
    )
  )
);

describe("Schema", () => {
  it("a basic schema", () => {
    const schema = Schema.basic(gql`${"example.graphql"}
      @link(url: "https://specs.apollo.dev/federation/v1.0")
      @link(url: "https://specs.apollo.dev/inaccessible/v0.1")
    
      type User @inaccessible {
        id: ID!
      }
    `);

    expect(schema).toMatchInlineSnapshot(`
      Schema [
        <>[example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
        <#User>[example.graphql] 👉type User @inaccessible {,
      ]
    `);

    expect(schema.scope).toMatchInlineSnapshot(`
      Scope [
        Object {
          "gref": GRef <https://specs.apollo.dev/federation/v1.0>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "federation",
          "via": [example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
        },
        Object {
          "gref": GRef <https://specs.apollo.dev/federation/v1.0#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@federation",
          "via": [example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
        },
        Object {
          "gref": GRef <https://specs.apollo.dev/inaccessible/v0.1>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "inaccessible",
          "via": [example.graphql] 👉@link(url: "https://specs.apollo.dev/inaccessible/v0.1"),
        },
        Object {
          "gref": GRef <https://specs.apollo.dev/inaccessible/v0.1#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@inaccessible",
          "via": [example.graphql] 👉@link(url: "https://specs.apollo.dev/inaccessible/v0.1"),
        },
      ]
    `);

    expect(schema.refs).toMatchInlineSnapshot(`
      Record [
        <>[example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
        <https://specs.apollo.dev/link/v1.0#@>[example.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v1.0"),
        <https://specs.apollo.dev/link/v1.0#@>[example.graphql] 👉@link(url: "https://specs.apollo.dev/inaccessible/v0.1"),
        <#User>[example.graphql] 👉type User @inaccessible {,
        <https://specs.apollo.dev/inaccessible/v0.1#@>[example.graphql] type User 👉@inaccessible {,
        <https://specs.graphql.org/#ID>[example.graphql] id: 👉ID!,
      ]
    `);
  });

  it("can be created from a doc", () => {
    const schema = Schema.from(
      parse(
        new Source(
          `extend schema
      @id(url: "https://my.org/mySchema")
      @link(url: "https://specs.apollo.dev/link/v1.0")
      @link(url: "https://specs.apollo.dev/id/v1.0")
      @link(url: "https://example.com/foo")
      @link(url: "https://specs.company.org/someSpec/v1.2", as: spec)
    `,
          "example.graphql"
        )
      )
    );
    expect(schema.url).toBe(LinkUrl.from("https://my.org/mySchema"));
    expect(schema.scope.own("link")?.gref).toBe(
      GRef.schema("https://specs.apollo.dev/link/v1.0")
    );
    expect(schema.scope.own("spec")?.gref).toBe(
      GRef.schema("https://specs.company.org/someSpec/v1.2")
    );
    expect(schema.scope.own("@foo")?.gref).toBe(
      GRef.rootDirective("https://example.com/foo")
    );
    expect(schema.locate(ref("@spec__dir"))).toBe(
      GRef.directive("dir", "https://specs.company.org/someSpec/v1.2")
    );
  });

  it("locates nodes", () => {
    const schema = Schema.from(
      parse(`
      extend schema
        @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: "@requires @key @prov: @provides")      
    `),
      base.scope
    );

    // note: .toBe checks are intentional, equal grefs
    // are meant to be identical (the same object) via
    // caching. this allows them to be treated as
    // values (e.g. used as keys in maps)
    expect(schema.locate(ref("@requires"))).toBe(
      GRef.directive("requires", "https://specs.apollo.dev/federation/v2.0")
    );
    expect(schema.locate(ref("@provides"))).toBe(GRef.directive("provides"));
    expect(schema.locate(ref("@federation"))).toBe(
      GRef.directive("", "https://specs.apollo.dev/federation/v2.0")
    );
    expect(schema.locate(ref("@prov"))).toBe(
      GRef.directive("provides", "https://specs.apollo.dev/federation/v2.0")
    );
    expect(schema.locate(ref("link__Schema"))).toBe(
      GRef.named("Schema", "https://specs.apollo.dev/link/v1.0")
    );

    // all nodes have locations
    expect(schema.locate(ref("link__Schema"))).toBe(
      GRef.named("Schema", "https://specs.apollo.dev/link/v1.0")
    );
  });

  it("understands @id", () => {
    const schema = Schema.basic(gql`${"schema-with-id.graphql"}
      @id(url: "https://specs/me")
      @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: "@requires @key @prov: @provides")
      directive @me repeatable on SCHEMA
      scalar Something @key   
    `);
    expect(schema.url).toBe(LinkUrl.from("https://specs/me"));
    expect(schema.locate(ref("@id"))).toBe(
      GRef.rootDirective("https://specs.apollo.dev/id/v1.0")
    );
    expect(schema.locate(ref("@requires"))).toBe(
      GRef.directive("requires", "https://specs.apollo.dev/federation/v2.0")
    );
    expect(schema.locate(ref("SomeLocalType"))).toBe(
      GRef.named("SomeLocalType", "https://specs/me")
    );
    expect(schema.locate(ref("@myDirective"))).toBe(
      GRef.directive("myDirective", "https://specs/me")
    );
    expect(schema).toMatchInlineSnapshot(`
      Schema [
        GRef <https://specs/me#@requires> => GRef <https://specs.apollo.dev/federation/v2.0#@requires> (via [schema-with-id.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v2.0"),
        GRef <https://specs/me#@key> => GRef <https://specs.apollo.dev/federation/v2.0#@key> (via [schema-with-id.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v2.0"),
        GRef <https://specs/me#@prov> => GRef <https://specs.apollo.dev/federation/v2.0#@provides> (via [schema-with-id.graphql] 👉@link(url: "https://specs.apollo.dev/federation/v2.0"),
        <https://specs/me>[schema-with-id.graphql] 👉@id(url: "https://specs/me"),
        <https://specs/me#@>[schema-with-id.graphql] 👉directive @me repeatable on SCHEMA,
        <https://specs/me#Something>[schema-with-id.graphql] 👉scalar Something @key,
      ]
    `);

    // a self-link is added when the url has a name
    expect(schema.scope.own("")?.gref).toBe(GRef.schema("https://specs/me"));

    // directive terms with the same name as the current schema
    // are mapped to the root directive.
    expect(schema.locate(ref("@me"))).toBe(
      GRef.rootDirective("https://specs/me")
    );
  });

  it("gets definitions for nodes", () => {
    const schema = Schema.basic(gql`${"my-schema.graphql"}
      @id(url: "https://specs/me")
      @link(url: "https://specs.apollo.dev/federation/v2.0",
            import: "@requires @key @provides (as @prov)")
        
      type User @key(fields: "id") {
        id: ID!
      }
    `);

    const user = schema.locate(ref("User"));
    expect(schema.definitions(user)).toMatchInlineSnapshot(`
      Array [
        <https://specs/me#User>[my-schema.graphql] 👉type User @key(fields: "id") {,
      ]
    `);

    expect(schema.definitions(schema.locate(ref("@link")))).toEqual([]);
    const link = schema.locate(ref("@link"));
    expect(link).toBe(GRef.rootDirective("https://specs.apollo.dev/link/v1.0"));
  });

  it("compiles", () => {
    const builtins = Schema.basic(gql`${"builtins"}
      @link(url: "https://specs.apollo.dev/federation/v1.0", import: "@key")
    `);
    const atlas = Atlas.fromSchemas(
      Schema.basic(gql`${"link.graphql"}
        @id(url: "https://specs.apollo.dev/link/v1.0")
        
        directive @link(url: Url!, as: Name, import: Imports)
          repeatable on SCHEMA
        scalar Url
        scalar Name
        scalar Imports
      `),
      Schema.basic(gql`${"fed.graphql"}
        @id(url: "https://specs.apollo.dev/federation/v1.0")

        directive @key(fields: FieldSet!) on OBJECT
        scalar FieldSet
      `)
    );

    expect(atlas).toMatchInlineSnapshot(`
      Atlas [
        <https://specs.apollo.dev/link/v1.0>[link.graphql] 👉@id(url: "https://specs.apollo.dev/link/v1.0"),
        <https://specs.apollo.dev/link/v1.0#@>[link.graphql] 👉directive @link(url: Url!, as: Name, import: Imports),
        <https://specs.apollo.dev/link/v1.0#Url>[link.graphql] 👉scalar Url,
        <https://specs.apollo.dev/link/v1.0#Name>[link.graphql] 👉scalar Name,
        <https://specs.apollo.dev/link/v1.0#Imports>[link.graphql] 👉scalar Imports,
        <https://specs.apollo.dev/federation/v1.0>[fed.graphql] 👉@id(url: "https://specs.apollo.dev/federation/v1.0"),
        <https://specs.apollo.dev/federation/v1.0#@key>[fed.graphql] 👉directive @key(fields: FieldSet!) on OBJECT,
        <https://specs.apollo.dev/federation/v1.0#FieldSet>[fed.graphql] 👉scalar FieldSet,
      ]
    `);

    const subgraph = Schema.from(
      gql`
        ${"subgraph"}
        type User @key(fields: "x y z") {
          id: ID!
          field: SomeUnresolvedType
        }
      `,
      builtins
    );

    const result = getResult(() => subgraph.compile(atlas));
    expect([...result.errors()].map((e: any) => [e, e.nodes]))
      .toMatchInlineSnapshot(`
      Array [
        Array [
          [NoDefinition: no definitions found for reference: #SomeUnresolvedType],
          Array [
            <#SomeUnresolvedType>[subgraph] field: 👉SomeUnresolvedType,
          ],
        ],
      ]
    `);
    const compiled = result.unwrap();

    expect([...compiled]).toMatchInlineSnapshot(`
      Array [
        GRef <#@key> => GRef <https://specs.apollo.dev/federation/v1.0#@key> (via <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/federation/v1.0", import: ["@key"])),
        <>[+] extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/federation/v1.0", import: ["@key"]),
        <#User>[subgraph] 👉type User @key(fields: "x y z") {,
        <https://specs.apollo.dev/link/v1.0#@>[link.graphql] 👉directive @link(url: Url!, as: Name, import: Imports),
        <https://specs.apollo.dev/link/v1.0#Url>[link.graphql] 👉scalar Url,
        <https://specs.apollo.dev/link/v1.0#Name>[link.graphql] 👉scalar Name,
        <https://specs.apollo.dev/link/v1.0#Imports>[link.graphql] 👉scalar Imports,
        <https://specs.apollo.dev/federation/v1.0#@key>[fed.graphql] 👉directive @key(fields: FieldSet!) on OBJECT,
        <https://specs.apollo.dev/federation/v1.0#FieldSet>[fed.graphql] 👉scalar FieldSet,
      ]
    `);

    expect(raw(print(compiled.document))).toMatchInlineSnapshot(`
      extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/federation/v1.0", import: ["@key"])

      type User @key(fields: "x y z") {
        id: ID!
        field: SomeUnresolvedType
      }

      directive @link(url: link__Url!, as: link__Name, import: link__Imports) repeatable on SCHEMA

      scalar link__Url

      scalar link__Name

      scalar link__Imports

      directive @key(fields: federation__FieldSet!) on OBJECT

      scalar federation__FieldSet
    `);
  });

  describe("compiles -", () => {
    const atlas = Schema.basic(gql`${"zoo.graphql"}
      @id(url: "https://example.dev/zoo")
      @link(url: "https://example.dev/aardvark", import: "@ (as @aardvark)")
      @link(url: "https://example.dev/animals", import: "@zebra")
  
      directive @aardvark on OBJECT
      directive @zebra on OBJECT
      directive @link repeatable on SCHEMA
    `);

    it("transitive @links", () => {
      expect(atlas).toMatchInlineSnapshot(`
        Schema [
          GRef <https://example.dev/zoo#@aardvark> => GRef <https://example.dev/aardvark#@> (via [zoo.graphql] 👉@link(url: "https://example.dev/aardvark", import: "@ (as @aardvark)")),
          GRef <https://example.dev/zoo#@zebra> => GRef <https://example.dev/animals#@zebra> (via [zoo.graphql] 👉@link(url: "https://example.dev/animals", import: "@zebra")),
          <https://example.dev/zoo>[zoo.graphql] 👉@id(url: "https://example.dev/zoo"),
          <https://example.dev/aardvark#@>[zoo.graphql] 👉directive @aardvark on OBJECT,
          <https://example.dev/animals#@zebra>[zoo.graphql] 👉directive @zebra on OBJECT,
          <https://specs.apollo.dev/link/v1.0#@>[zoo.graphql] 👉directive @link repeatable on SCHEMA,
        ]
      `);

      const schema = Schema.basic(gql`${"input.graphql"}
        @link(url: "https://example.dev/zoo", import: "@aardvark @zebra")
      `);

      const result = getResult(() => schema.compile(atlas));
      expect([...result.errors()]).toEqual([]);
      const output = result.unwrap();

      expect(output).toMatchInlineSnapshot(`
        Schema [
          GRef <#@zebra> => GRef <https://example.dev/animals#@zebra> (via <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/animals", import: ["@zebra"])),
          <>[+] extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://example.dev/aardvark") @link(url: "https://example.dev/animals", import: ["@zebra"]),
          <https://specs.apollo.dev/link/v1.0#@>[zoo.graphql] 👉directive @link repeatable on SCHEMA,
          <https://example.dev/aardvark#@>[zoo.graphql] 👉directive @aardvark on OBJECT,
          <https://example.dev/animals#@zebra>[zoo.graphql] 👉directive @zebra on OBJECT,
        ]
      `);

      expect(output.scope).toMatchInlineSnapshot(`
        Scope [
          Object {
            "gref": GRef <https://specs.apollo.dev/link/v1.0>,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "link",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
          },
          Object {
            "gref": GRef <https://specs.apollo.dev/link/v1.0#@>,
            "implicit": true,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "@link",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
          },
          Object {
            "gref": GRef <https://example.dev/aardvark>,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "aardvark",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/aardvark"),
          },
          Object {
            "gref": GRef <https://example.dev/aardvark#@>,
            "implicit": true,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "@aardvark",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/aardvark"),
          },
          Object {
            "gref": GRef <https://example.dev/animals>,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "animals",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/animals", import: ["@zebra"]),
          },
          Object {
            "gref": GRef <https://example.dev/animals#@>,
            "implicit": true,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "@animals",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/animals", import: ["@zebra"]),
          },
          Object {
            "gref": GRef <https://example.dev/animals#@zebra>,
            "linker": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://specs.apollo.dev/link/v1.0"),
            "name": "@zebra",
            "via": <https://specs.apollo.dev/link/v1.0#@>[+] @link(url: "https://example.dev/animals", import: ["@zebra"]),
          },
        ]
      `);

      expect(raw(output.print())).toMatchInlineSnapshot(`
        extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://example.dev/aardvark") @link(url: "https://example.dev/animals", import: ["@zebra"])

        directive @link repeatable on SCHEMA

        directive @aardvark on OBJECT

        directive @zebra on OBJECT
      `);
    });
  });

  it("returns standardized versions", () => {
    const subgraph = Schema.basic(gql`${"subgraph"}
      @link(url: "https://specs.apollo.dev/federation/v2.0",
            import: """
              @fkey: @key
              @frequires: @requires
              @fprovides: @provides
              @ftag: @tag
            """)

      type User @fkey(fields: "id") {
        id: ID! @ftag(name: "hi") @tag(name: "my tag")
      }

      directive @tag(name: string) on FIELD_DEFINITION
    `);

    expect(
      raw(
        subgraph.standardize("https://specs.apollo.dev/federation/v2.0").print()
      )
    ).toMatchInlineSnapshot(`
      extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/id/v1.0") @link(url: "https://specs.apollo.dev/federation/v2.0")

      type User @federation__key(fields: "id") {
        id: ID! @federation__tag(name: "hi") @tag(name: "my tag")
      }

      directive @tag(name: string) on FIELD_DEFINITION
    `);
  });

  it("omits links and namespacing for graphql builtins", () => {
    const tag = Schema.basic(gql`${"tag/v0.1"}
      @id(url: "https://specs.apollo.dev/tag/v0.1")
      directive @tag(name: String!)
        repeatable on FIELD_DEFINITION | INTERFACE | OBJECT | UNION
      `);
    expect(
      refNodesIn(
        tag.definitions(GRef.rootDirective("https://specs.apollo.dev/tag/v0.1"))
      )
    ).toMatchInlineSnapshot(`
        Iterable [
          <https://specs.apollo.dev/tag/v0.1#@>[tag/v0.1] 👉directive @tag(name: String!),
          <https://specs.graphql.org/#String>[tag/v0.1] directive @tag(name: 👉String!),
        ]
      `);

    const schema = Schema.basic(gql`${"user-schema"}
      @link(url: "https://specs.apollo.dev/tag/v0.1")
      extend type User @tag(name: "tagged")
    `);
    expect(raw(schema.compile(tag).print())).toMatchInlineSnapshot(`
      extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/tag/v0.1")

      extend type User @tag(name: "tagged")

      directive @tag(name: String!) repeatable on FIELD_DEFINITION | INTERFACE | OBJECT | UNION
    `);
  });

  it("handles @link import string with list of objects", () => {
    const schema = Schema.basic(gql`@link(url: "https://example",
      import: ["@foo", {name: "@bar", as: "@barAlias"}, {name: "Type", as: "TypeAlias"}])`);
    expect(schema.scope).toMatchInlineSnapshot(`
      Scope [
        Object {
          "gref": GRef <https://example/>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": undefined,
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@undefined",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@foo>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@foo",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@bar>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@barAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#Type>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "TypeAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
      ]
    `);
  });

  it("handles @link import string with ':' aliases", () => {
    const schema = Schema.basic(gql`@link(url: "https://example",
      import: "@foo @barAlias: @bar TypeAlias: Type")`);
    expect(schema.scope).toMatchInlineSnapshot(`
      Scope [
        Object {
          "gref": GRef <https://example/>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": undefined,
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@undefined",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@foo>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@foo",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@bar>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@barAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#Type>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "TypeAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
      ]
    `);
  });

  it("handles @link import string with (as) aliases", () => {
    const schema = Schema.basic(gql`@link(url: "https://example",
      import: "@foo @bar (as @barAlias) Type (as TypeAlias)")`);
    expect(schema.scope).toMatchInlineSnapshot(`
      Scope [
        Object {
          "gref": GRef <https://example/>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": undefined,
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@undefined",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@foo>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@foo",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#@bar>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@barAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
        Object {
          "gref": GRef <https://example/#Type>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "TypeAlias",
          "via": [GraphQL request] 👉@link(url: "https://example",
        },
      ]
    `);
  });

  it("does not get confused", () => {
    const schema = Schema.basic(gql`
      @link(url: "https://example/one")
      @one(url: "https://example/one")
      @one(url: "https://example/two")
      @two(urlxx: "https://zya")
    `);
    expect(schema.scope).toMatchInlineSnapshot(`
      Scope [
        Object {
          "gref": GRef <https://example/one>,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "one",
          "via": [GraphQL request] 👉@link(url: "https://example/one"),
        },
        Object {
          "gref": GRef <https://example/one#@>,
          "implicit": true,
          "linker": [builtin:schema/basic] 👉@link(url: "https://specs.apollo.dev/link/v1.0"),
          "name": "@one",
          "via": [GraphQL request] 👉@link(url: "https://example/one"),
        },
      ]
    `);
  });

  it("dangerously removes headers", () => {
    const schema = Schema.basic(gql`
      @link(url: "https://some-link/spec")
      @link(url: "https://another-link/otherSpec")

      type User @otherSpec {
        id: ID!
        field: Foo
      }
    `);
    expect(schema.dangerousRemoveHeaders().print()).toMatchInlineSnapshot(`
      "type User @otherSpec {
        id: ID!
        field: Foo
      }"
    `);
  });
});

function ref(name: string): Locatable {
  if (name.startsWith("@"))
    return {
      kind: Kind.DIRECTIVE,
      name: { kind: Kind.NAME, value: name.slice(1) },
    };
  return {
    kind: Kind.NAMED_TYPE,
    name: { kind: Kind.NAME, value: name },
  };
}
