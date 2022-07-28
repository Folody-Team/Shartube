import {use, recall} from "..";

describe("@use", () => {
  it("lets you apply recall to methods", () => {
    let calls = 0;
    class Hello {
      @use(recall)
      static world() {
        ++calls;
        return {};
      }

      @use(recall)
      static get singleton() {
        return {}
      }
    };
    expect(Hello.world()).toBe(Hello.world());
    expect(calls).toBe(1);
    expect(Hello.singleton).toBe(Hello.singleton);
  })
})