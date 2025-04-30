import { describe, it, expect } from "@jest/globals";
import { parseConfigName } from "../config-legacy";

describe("config with EitherLegacy", () => {
  it("parse config name works", () => {
    expect.assertions(4);

    let result = parseConfigName("test");
    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual("test");

    result = parseConfigName(2);
    expect(result.isLeft()).toBeTruthy();
    // here we would be able to just unwrap the left value using the new Either variant
    if (result.isLeft()) {
      expect(result.value.message).toBeDefined();
    }
  });
});
