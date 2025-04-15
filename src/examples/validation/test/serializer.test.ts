import { describe, it, expect } from "@jest/globals";
import { InputCreatePerson } from "../serializer";

describe("InputCreatePerson", () => {
  it("should be able to perse into validated person", () => {
    const src = { name: "hironha", age: 24 };
    const input = new InputCreatePerson(src);
    const validated = input.validated();

    expect(validated.isOk()).toBeTruthy();
    expect(validated.ok()).toMatchObject(src);
  });

  it("should fail validating person", () => {
    const src = {};
    const input = new InputCreatePerson(src);
    const validated = input.validated();

    expect(validated.isErr()).toBeTruthy();
    console.error(validated.err());
  });
});
