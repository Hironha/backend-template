import { ApiValidationError } from "@core/error";
import { CreatePersonOperator } from "./operator";
import { InputCreatePerson } from "./serializer";

export async function handler(): Promise<void> {
  const src = {};
  const operator = new CreatePersonOperator();
  const input = new InputCreatePerson(src);
  const result = await operator.exec(input);
  if (result.isErr()) {
    if (result.value instanceof ApiValidationError) {
      console.error({ status: 400, body: result.value });
    } else {
      console.error({ status: 500, body: result.value });
    }
  } else {
    console.info(result.value);
  }
}
