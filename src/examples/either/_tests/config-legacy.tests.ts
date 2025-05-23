import { describe, it, expect } from "@jest/globals";
import { LeftLegacy, type EitherLegacy } from "@core/either-legacy";
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

  it("cannot differ left from right when using the same type", () => {
    // make a function just so typescript cannot infer as Left right away
    const makeEither = (): EitherLegacy<string, string> => new LeftLegacy("test");
    const result = makeEither();
    if (result.isLeft()) {
      expect(result.value).toEqual("test");
    } else {
      // notice that we cannot use `result.value` here since typescript infers `result`
      // as being `never`
      expect(result).toEqual("test");
    }
  });
});
