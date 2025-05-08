import { CreateTodoOperator } from "../controllers/create-todo-operator";
import {
  InputCreateTodoZodValidator,
  InputCreateTodoClassValidator,
} from "../controllers/create-todo-serializer";
import { CreateTodoUseCase } from "../usecases/create-todo-usecase";

enum ValidatorKind {
  CLASS_VALIDATOR = "class-validator",
  ZOD = "zod",
}

const kind: ValidatorKind = ValidatorKind.CLASS_VALIDATOR;

export async function handler(): Promise<void> {
  const src = {};

  const usecase = new CreateTodoUseCase();
  const operator = new CreateTodoOperator(usecase);

  const input =
    kind === ValidatorKind.CLASS_VALIDATOR
      ? new InputCreateTodoClassValidator(src)
      : new InputCreateTodoZodValidator(src);

  const result = await operator.exec(input);
  if (result.isLeft()) {
    if (result.value.code === "ValidationError") {
      console.dir({ status: 400, body: result.value }, { depth: Infinity });
    } else if (result.value.code === "TodoAlreadyExists") {
      console.dir({ status: 409, body: result.value }, { depth: Infinity });
    } else {
      console.dir({ status: 500, body: result.value }, { depth: Infinity });
    }
  } else {
    console.info(result.value);
  }
}

handler();
