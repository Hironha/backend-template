import z from "zod";
import { ValidatedInput } from "@core/operator";
import { type Result } from "@core/result";
import { type ValidationError } from "@core/validator";
import { ZodValidator } from "@core/zod-validator";
import { type TodoEntity } from "../entities/todo";
import { type TodoError } from "../errors/todo";
import { type InputCreateTodoDto } from "../dtos/create-todo-dto";

export interface InputCreateTodo extends InputCreateTodoDto {}

export type OutputCreateTodo = Result<TodoEntity, TodoError>;

const TodoSchema = z.object({
  description: z
    .string({ message: "Property 'description' is a required string" })
    .trim()
    .max(256, { message: "Property 'description' cannot have more than 128 characters" }),
});

export class InputCreateTodoZodValidator extends ValidatedInput<InputCreateTodo> {
  constructor(private src: unknown) {
    super(new ZodValidator(TodoSchema));
  }

  validated(): Result<InputCreateTodoDto, ValidationError> {
    return this.validator.validate(this.src);
  }
}
