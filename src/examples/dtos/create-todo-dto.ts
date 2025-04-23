import { type Result } from "@core/result";
import { type TodoEntity } from "../entities/todo-entity";
import { type TodoError } from "../errors/todo";

export interface InputCreateTodoDto {
  description: string;
}

export type OutputCreateTodoDto = Result<TodoEntity, TodoError>;
