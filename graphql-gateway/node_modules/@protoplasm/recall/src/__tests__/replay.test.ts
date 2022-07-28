import { getResult, report } from "../report";
import { replay } from "../replay";

describe("replay", () => {
  it("recalls functions which return iterators", () => {
    let calls = 0;
    const items = replay(function* items() {
      ++calls;
      yield 1;
      yield 2;
      yield 3;
    });
    expect(items()).toBe(items());
    expect([...items()]).toEqual([1, 2, 3]);
    expect([...items()]).toEqual([...items()]);
    expect(calls).toBe(1);
  });

  it("lazily evaluates underlying iterator", () => {
    const log: string[] = [];
    const script = replay(function* script() {
      log.push("hello");
      yield 1;
      log.push("world");
      yield 2;
      log.push("goodbye");
      yield 3;
    });

    const A = script();
    const B = script();
    expect(A).toBe(B);
    const a = A[Symbol.iterator]();
    const b = B[Symbol.iterator]();
    expect(log.length).toBe(0);
    a.next();
    b.next();
    expect(log).toMatchInlineSnapshot(`
      Array [
        "hello",
      ]
    `);
    a.next();
    b.next();
    expect(log).toMatchInlineSnapshot(`
      Array [
        "hello",
        "world",
      ]
    `);
    a.next();
    a.next();
    b.next();
    b.next();
    expect(log).toMatchInlineSnapshot(`
      Array [
        "hello",
        "world",
        "goodbye",
      ]
    `);
  });

  it("reports", () => {
    const process = replay(function* () {
      report("hello");
      yield 1;
      report("world");
      yield 2;
    });
    expect(process()).toBe(process())
    expect(getResult(() => [...process()]).log).toMatchInlineSnapshot(`
      Report [
        Report <empty>,
        Report [
          "hello",
        ],
        Report [
          "world",
        ],
        Report <empty>,
      ]
    `);

    expect(getResult(() => [...process()]).log).toMatchInlineSnapshot(`
      Report [
        Report <empty>,
        Report [
          "hello",
        ],
        Report [
          "world",
        ],
        Report <empty>,
      ]
    `);

    expect([...process()]).toEqual([1, 2]);
    expect(getResult(() => process()[Symbol.iterator]().next()).log)
      .toMatchInlineSnapshot(`
      Report [
        Report <empty>,
        Report [
          "hello",
        ],
      ]
    `);
  });
});
