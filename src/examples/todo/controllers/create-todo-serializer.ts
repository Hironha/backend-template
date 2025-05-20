import z from "zod/v4";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { type Either } from "@core/either";
import { type ValidationConstraint } from "@core/validator";
import { ZodValidator } from "@core/zod-validator";
import { ValidatedInput } from "@core/input";
import { ClassValidator } from "@core/class-validator";
import { type TodoEntity } from "../entities/todo-entity";
import { type TodoAlreadyExistsError, type TodoError } from "../errors/todo";
import { type InputCreateTodoDto } from "../dtos/create-todo-dto";

export interface InputCreateTodo extends InputCreateTodoDto {}

export type OutputCreateTodo = Either<
  TodoError | TodoAlreadyExistsError,
  TodoEntity
>;

const TodoSchema = z.object({
  description: z
    .string({
      error: (iss) =>
        iss.input == null
          ? "Property 'description' is required"
          : "Propert 'description' should be a string",
    })
    .trim()
    .max(256, {
      error: "Property 'description' cannot have more than 256 characters",
    }),
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
  @MaxLength(256, {
    message: "Property 'description' cannot have more than 256 characters",
  })
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
