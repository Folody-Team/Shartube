# CHANGELOG

## vNEXT

> The changes noted within this `vNEXT` section have not been released yet.  New PRs and commits which introduce changes should include an entry in this `vNEXT` section as part of their development.  When a release is being prepared, a new header will be (manually) created below and the appropriate changes within that release will be moved into the new section.

## v0.3

- Significant API changes (see [README](./README.md))
- Support for `@link(url:, import:)`. Reading schemas with legacy `@core` directives is still supported.
- Compile definitions into schemas. Use `schema.compile(atlas?)` to copy necessary definitions from `atlas` into `schema`
- Report non-fatal errors with `report`, get them with `getResult`. Example: `getResult(() => runMyValidations(schema.compile(atlas))).errors()` will yield all errors which occurred during compilation or validation.
- Add support for Node 17 [PR #41](https://github.com/apollographql/core-schema-js/pull/41)

## v0.2.2
- Don't call `GraphQLError.toString()` recursively [PR #36](https://github.com/apollographql/core-schema-js/pull/36)

## v0.2.1

- Add support for graphql@16 [PR #19](https://github.com/apollographql/core-schema-js/pull/19)

## v0.2.0

- __BREAKING__: Update graphql dev and peerDependency and fix `GraphQLError` usage. Update name assignment and remove name getter method [#20](https://github.com/apollographql/core-schema-js/pull/20)

## v0.1.1

- Remove unnecessary `engines` specification for `npm` which limited it to only working on `npm@7`.  The spirit of that specificity was to provide a hint to _maintainers_ as to what version of `npm` should be used to generate the `package-lock.json` file and reduce churn on that file which happened between npm@6 and npm@7.  Of course, while this was effective and harmless in the `federation` monorepo (from which this was copied and pasted from), it obviously has implications on consumers in published packages.  Fixed via [`ee1a330e`](https://github.com/apollographql/core-schema-js/commit/ee1a330e2f2c3f8b45a4526caf3bf4b3a4de4f7a).

## v0.1.0

- Initial Release 🎉