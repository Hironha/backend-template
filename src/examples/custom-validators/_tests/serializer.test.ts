import { describe, test, expect } from "@jest/globals";
import { PersonClassValidator, PersonZodValidator } from "../serializer";

describe("serializer", () => {
  test("person zod validator works", () => {
    const validInput = {
      name: "test",
      cpf: "620.807.700-12",
    };
    const valid = new PersonZodValidator(validInput).validated();
    expect(valid.isRight()).toBeTruthy();

    const invalidInput = {
      name: "test",
      cpf: "620.807.700-13",
    };
    const invalid = new PersonZodValidator(invalidInput).validated();
    expect(invalid.isLeft()).toBeTruthy();
  });

  test("person class validator works", () => {
    const validInput = {
      name: "test",
      cpf: "620.807.700-12",
    };
    const valid = new PersonClassValidator(validInput).validated();
    expect(valid.isRight()).toBeTruthy();

    const invalidInput = {
      name: "test",
      cpf: "620.807.700-13",
    };
    const invalid = new PersonClassValidator(invalidInput).validated();
    expect(invalid.isLeft()).toBeTruthy();
  });
});
