import { describe, it, expect } from "@jest/globals";
import { InputCreateTodoZodValidator } from "../controllers/create-todo-serializer";

describe("InputCreateTodoZodValidator", () => {
  it("should be able to parse into create todo dto", () => {
    const src = { description: "test" };
    const input = new InputCreateTodoZodValidator(src);
    const validated = input.validated();

    expect(validated.isRight()).toBeTruthy();
    expect(validated.right()).toMatchObject(src);
  });

  it("should fail validating into create todo dto", () => {
    const src = {};
    const input = new InputCreateTodoZodValidator(src);
    const validated = input.validated();

    expect(validated.isLeft()).toBeTruthy();
    expect(validated.left()).toMatchObject([
      {
        field: "description",
        message: expect.any(String),
      },
    ]);
  });
});
