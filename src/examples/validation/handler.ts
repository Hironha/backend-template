import { CreatePersonOperator } from "./operator";
import { InputCreatePerson } from "./serializer";

export async function handler(): Promise<void> {
  const input = {};
  const operator = new CreatePersonOperator();
  const result = await operator.exec(new InputCreatePerson(input));
  if (result.isErr()) {
    console.error(result.value);
  } else {
    console.info(result.value);
  }
}
