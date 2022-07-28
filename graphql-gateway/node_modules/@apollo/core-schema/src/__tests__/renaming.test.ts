import { Kind } from "graphql";
import gql from "../gql";
import LinkUrl from "../link-url";
import Schema, { pruneLinks } from "../schema";
import Scope from "../scope";
import raw from "../snapshot-serializers/raw";

describe("view of a schema", () => {
  const federation = Schema.basic(gql`${"federation-frame"}
    @link(url: "https://specs.apollo.dev/federation/v2.0")
  `);

  it("creates a schema view with particular names", () => {
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

    const FED2 = LinkUrl.from("https://specs.apollo.dev/federation/v2.0");
    const newScope = Scope.create((scope) => {
      const flat = subgraph.scope.flat
      for (const link of flat) {
        if (link.gref.graph !== FED2) scope.add(link);
      }
      for (const link of federation.scope) scope.add(link);
    });
    const output = Schema.from({
      kind: Kind.DOCUMENT,
      definitions: [
        ...newScope.renormalizeDefs([...newScope.header(), ...pruneLinks(subgraph)]),
      ],
    });
    expect(raw(output.print())).toMatchInlineSnapshot(`
      extend schema @link(url: "https://specs.apollo.dev/link/v1.0") @link(url: "https://specs.apollo.dev/id/v1.0") @link(url: "https://specs.apollo.dev/federation/v2.0")

      type User @federation__key(fields: "id") {
        id: ID! @federation__tag(name: "hi") @tag(name: "my tag")
      }

      directive @tag(name: string) on FIELD_DEFINITION
    `);

    
  });
});
