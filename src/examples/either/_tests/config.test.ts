import { describe, it, expect } from "@jest/globals";
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
});
