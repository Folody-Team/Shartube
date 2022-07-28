import err, { GraphQLErrorExt } from '../error'

describe("GraphQLErrorExt", () => {
  it("sets a code, name, and message", () => {
    const error = err('SomethingWentWrong', 'it is very bad')
    expect(error.name).toEqual("SomethingWentWrong");
    expect(error.code).toEqual(error.name);
    expect(error.message).toEqual("it is very bad");
  });

  it("calling `toString` doesn't throw an error", () => {
    const error = new GraphQLErrorExt("CheckFailed", "Check failed");
    expect(() => error.toString()).not.toThrow();
  });

  it("calling `toString` prints the error", () => {
    const error = new GraphQLErrorExt("CheckFailed", "Check failed");
    expect(error.toString()).toMatchInlineSnapshot(
      `"[CheckFailed] Check failed"`
    );
  });
});
