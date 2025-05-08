import { type Either } from "@core/either";
import { type TodoEntity } from "../entities/todo-entity";
import { type TodoError, type TodoAlreadyExistsError } from "../errors/todo";

export interface InputCreateTodoDto {
  description: string;
}

export type OutputCreateTodoDto = Either<TodoError | TodoAlreadyExistsError, TodoEntity>;
