import { CreateTodoOperator } from "../controllers/create-todo-operator";
import { InputCreateTodoZodValidator } from "../controllers/create-todo-serializer";
import { CreateTodoUseCase } from "../usecases/create-todo-usecase";

export async function handler(): Promise<void> {
  const src = {};

  const usecase = new CreateTodoUseCase();
  const operator = new CreateTodoOperator(usecase);

  const input = new InputCreateTodoZodValidator(src);
  const result = await operator.exec(input);
  if (result.isErr()) {
    if (result.value.code === "ValidationError") {
      console.error({ status: 400, body: result.value });
    } else {
      console.error({ status: 500, body: result.value });
    }
  } else {
    console.info(result.value);
  }
}
