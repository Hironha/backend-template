import { CreatePersonOperator } from "./operator";
import { InputCreatePerson } from "./serializer";

export async function handler(): Promise<void> {
  const src = {};
  const operator = new CreatePersonOperator();
  const input = new InputCreatePerson(src);
  const result = await operator.exec(input);
  if (result.isErr()) {
    console.error(result.value);
  } else {
    console.info(result.value);
  }
}
