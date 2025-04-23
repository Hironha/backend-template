import { v7 as uuidv7 } from "uuid";

export interface Todo {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TodoEntity {
  private id: string;
  private description: string;
  private createdAt: Date;
  private updatedAt: Date;

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

  getId(): string {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}
