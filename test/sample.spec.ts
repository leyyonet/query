import { assert, beforeAll, describe, it } from "vitest";
import { CausedError } from "@leyyo/common";

beforeAll(() => {
  global.leyyo_testing;
});
describe("http", () => {
  it("not symbol", () => {
    assert.throws(() => {
      throw new CausedError("invalid");
    });
  });
});
