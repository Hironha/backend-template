import { type Either } from "@core/either";
import { type TodoEntity } from "../entities/todo-entity";
import { type TodoError } from "../errors/todo";

export interface InputCreateTodoDto {
  description: string;
}

export type OutputCreateTodoDto = Either<TodoError, TodoEntity>;
