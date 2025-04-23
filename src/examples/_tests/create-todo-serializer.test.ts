import { describe, it, expect } from "@jest/globals";
import { InputCreateTodoZodValidator } from "../controllers/create-todo-serializer";

describe("InputCreatePerson", () => {
  it("should be able to parse into create todo dto", () => {
    const src = { description: "test" };
    const input = new InputCreateTodoZodValidator(src);
    const validated = input.validated();

    expect(validated.isOk()).toBeTruthy();
    expect(validated.ok()).toMatchObject(src);
  });

  it("should fail validating into create todo dto", () => {
    const src = {};
    const input = new InputCreateTodoZodValidator(src);
    const validated = input.validated();

    expect(validated.isErr()).toBeTruthy();
    expect(validated.unwrapErr().constraints).toMatchObject([
      {
        field: "description",
        message: expect.any(String),
      },
    ]);
  });
});
