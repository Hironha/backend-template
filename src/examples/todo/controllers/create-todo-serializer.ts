import z from "zod";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { type Either } from "@core/either";
import { type ValidationConstraint } from "@core/validator";
import { ZodValidator } from "@core/zod-validator";
import { ValidatedInput } from "@core/input";
import { ClassValidator } from "@core/class-validator";
import { type TodoEntity } from "../entities/todo-entity";
import { type TodoError } from "../errors/todo";
import { type InputCreateTodoDto } from "../dtos/create-todo-dto";

export interface InputCreateTodo extends InputCreateTodoDto {}

export type OutputCreateTodo = Either<TodoError, TodoEntity>;

const TodoSchema = z.object({
  description: z
    .string({
      required_error: "Property 'description' is required",
      invalid_type_error: "Property 'description' should be a string",
    })
    .trim()
    .max(256, { message: "Property 'description' cannot have more than 128 characters" }),
});

export class InputCreateTodoZodValidator extends ValidatedInput<InputCreateTodo> {
  constructor(private src: unknown) {
    super(new ZodValidator(TodoSchema));
  }

  validated(): Either<ValidationConstraint[], InputCreateTodoDto> {
    return this.validator.validate(this.src);
  }
}

class Todo {
  @IsNotEmpty({ message: "Property 'description' is required" })
  @IsString({ message: "Property 'description' should be a string" })
  @MaxLength(256, { message: "Property 'description' cannot have more than 256 characters" })
  description: string;

  constructor(props: any) {
    this.description = props?.description;
  }
}

export class InputCreateTodoClassValidator extends ValidatedInput<InputCreateTodo> {
  constructor(private src: unknown) {
    super(new ClassValidator(Todo));
  }

  validated(): Either<ValidationConstraint[], InputCreateTodo> {
    return this.validator.validate(this.src);
  }
}
