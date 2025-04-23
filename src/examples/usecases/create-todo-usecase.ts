import { Err, Ok } from "@core/result";
import { TodoEntity } from "../entities/todo";
import { TodoError } from "../errors/todo";
import { type InputCreateTodoDto, type OutputCreateTodoDto } from "../dtos/create-todo-dto";

export class CreateTodoUseCase {
  async exec(input: InputCreateTodoDto): Promise<OutputCreateTodoDto> {
    try {
      const entity = TodoEntity.new(input.description);
      return new Ok(entity);
    } catch (e) {
      console.error(e);
      return new Err(new TodoError("Failed creating todo entity."));
    }
  }
}
