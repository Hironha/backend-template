import { Operator } from "@core/operator";
import { type CreateTodoUseCase } from "../usecases/create-todo-usecase";
import { type InputCreateTodo, type OutputCreateTodo } from "./create-todo-serializer";

export class CreateTodoOperator extends Operator<InputCreateTodo, OutputCreateTodo> {
  constructor(private readonly createTodoUseCase: CreateTodoUseCase) {
    super();
  }

  protected async run(input: InputCreateTodo): Promise<OutputCreateTodo> {
    return await this.createTodoUseCase.exec(input);
  }
}
