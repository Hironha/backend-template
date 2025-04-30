import { Left, Right } from "@core/either";
import { TodoEntity } from "../entities/todo-entity";
import { TodoError } from "../errors/todo";
import { type InputCreateTodoDto, type OutputCreateTodoDto } from "../dtos/create-todo-dto";

export class CreateTodoUseCase {
  async exec(input: InputCreateTodoDto): Promise<OutputCreateTodoDto> {
    try {
      const entity = TodoEntity.new(input.description);
      return new Right(entity);
    } catch (e) {
      console.error(e);
      return new Left(new TodoError("Failed creating todo entity."));
    }
  }
}
