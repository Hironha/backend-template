import { v7 as uuidv7 } from "uuid";

export interface Todo {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TodoEntity {
  readonly id: string;
  description: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(todo: Todo) {
    this.id = todo.id;
    this.description = todo.description;
    this.createdAt = todo.createdAt;
    this.updatedAt = todo.updatedAt;
  }

  static new(description: string): TodoEntity {
    return new TodoEntity({
      id: uuidv7(),
      description: description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
