import { Version } from "../version";

describe("version", () => {
  describe(".parse", () => {
    it(".parse parses valid version tags", () => {
      expect(Version.parse("v1.0")).toEqual(Version.canon(1, 0));
      expect(Version.parse("v0.1")).toEqual(Version.canon(0, 1));
      expect(Version.parse("v987.65432")).toEqual(Version.canon(987, 65432));
    });

    it("returns null for invalid versions", () => {
      expect(Version.parse("bloop")).toBeNull()
      expect(Version.parse("v1")).toBeNull()
      expect(Version.parse("v1.")).toBeNull()
      expect(Version.parse("1.2")).toBeNull()
      expect(Version.parse("v0.9-tags-are-not-supported")).toBeNull()
    });
  });
  describe(".satisfies", () => {
    it("returns true if this version satisfies the requested version", () => {
      expect(Version.canon(1, 0).satisfies(Version.canon(1, 0))).toBe(true);
      expect(Version.canon(1, 2).satisfies(Version.canon(1, 0))).toBe(true);
    });

    it("returns false if this version cannot satisfy the requested version", () => {
      expect(Version.canon(2, 0).satisfies(Version.canon(1, 9))).toBe(false);
      expect(Version.canon(0, 9).satisfies(Version.canon(0, 8))).toBe(false);
    });
  });
  it(".equals returns true iff the versions are exactly equal", () => {
    expect(Version.canon(2, 9).equals(Version.canon(2, 9))).toBe(true);
    expect(Version.canon(2, 9).equals(Version.canon(2, 8))).toBe(false);
  });
});
