import { describe, it, expect } from "@jest/globals";
import { Left, type Either } from "@core/either";
import { parseConfigName } from "../config";

describe("config with Either", () => {
  it("parse config name works", () => {
    let result = parseConfigName("test");
    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual("test");

    result = parseConfigName(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()?.message).toBeDefined();
  });

  it("can differ left from right when using the same type", () => {
    // make a function just so typescript cannot infer as Left right away
    const makeEither = (): Either<string, string> => new Left("test");
    const result = makeEither();
    if (result.isLeft()) {
      expect(result.value).toEqual("test");
    } else {
      // here typescript infers `result` as `Right<string>` as it should be
      expect(result.value).toEqual("test");
    }
  });
});
