import recall, { report } from "..";

describe("recall", () => {
  it("caches success", () => {
    let calls = 0;
    const hi = recall(() => {
      ++calls;
      return {};
    });
    expect(hi()).toBe(hi());
    expect(calls).toBe(1);
  });

  it("caches failures", () => {
    let calls = 0;
    const eeek = recall(() => {
      ++calls;
      throw new Error("well that was expected");
    });
    expect(eeek).toThrowError("well that was expected");
    expect(eeek).toThrowError("well that was expected");
    expect(calls).toBe(1);
  });

  const list = recall(<T extends any[]>(...args: T) => args);

  it("memoizes objects by identity", () => {
    expect(list("a", "b", "c")).toBe(list("a", "b", "c"));
    expect(list(list("a", "b"), list("c"))).toBe(
      list(list("a", "b"), list("c"))
    );
  });

  it("collects many errors with report", () => {
    const anAttempt = recall(() => {
      report(new Error("already going badly"));
      report(new Error("we can still try"));
      report(new Error("to go on"));
      return "and we made it";
    });
    expect(anAttempt).not.toThrow();
    expect([...anAttempt.getResult().errors()]).toMatchInlineSnapshot(`
      Array [
        [Error: already going badly],
        [Error: we can still try],
        [Error: to go on],
      ]
    `);
  });

  it("can collect errors from a result", () => {
    const anAttempt = recall(() => {
      report("trying stuff...");
      report(new Error("oh no"));
      report(new Error("some problems happened"));
      return "but we made it";
    });
    expect(anAttempt).not.toThrow();

    const aFailure = recall(() => {
      report("trying stuff...");
      report(new Error("oh no"));
      report(new Error("some problems happened"));
      throw new Error("we blew up");
    });
    expect([...anAttempt.getResult().errors()]).toMatchInlineSnapshot(`
      Array [
        [Error: oh no],
        [Error: some problems happened],
      ]
    `);

    expect([...aFailure.getResult().errors()]).toMatchInlineSnapshot(`
      Array [
        [Error: oh no],
        [Error: some problems happened],
        [Error: we blew up],
      ]
    `);
  });

  it("parent calls embed their child call's logs", () => {
    const parent = recall(() => child());
    const child = recall(() => report("waaaaahhhh!"));
    expect([...parent.getResult().log]).toEqual(["waaaaahhhh!"]);
  });

  it("parent calls do not embed their child call's logs with getResult", () => {
    const parent = recall(() => child.getResult());
    const child = recall(() => report("waaaaahhhh!"));
    expect([...parent.getResult().log]).toEqual([]);
  });

  it("collects deep reported messages", () => {
    const someReports = recall(() => {
      report("a");
      report("b");
      report("c");
    });

    const f0 = recall(() => {
      report("f0");
      someReports();
    });
    const f1 = recall(() => {
      report("f1");
      someReports();
      f0()
    });

    expect([...f0.getResult().log]).toEqual(["f0", "a", "b", "c"]);
    expect([...f1.getResult().log]).toEqual(["f1", "a", "b", "c", "f0", "a", "b", "c"]);
  });

  it("caches results based on the arguments", () => {
    const a = "a";
    const b = "b";
    const c = "c";
    let calls = 0;
    const join = recall((...args: any[]) => {
      ++calls;
      return args.join(", ");
    });
    expect(join(a, b, c)).toBe("a, b, c");
    expect(join(a, b, c)).toBe("a, b, c");
    expect(join(b, a, c)).toBe("b, a, c");
    expect(join(a, c, a, b)).toBe("a, c, a, b");
    expect(join(a, c, a, b)).toBe("a, c, a, b");
    expect(calls).toBe(3);
  });

  it("caches results based on argument identity", () => {
    const getStatus = recall((world) => world.status);
    const world = { status: "good" };
    expect(getStatus(world)).toBe("good");
    world.status = "bad";
    // we're still living in the past
    expect(getStatus(world)).toBe("good");
  });
});
