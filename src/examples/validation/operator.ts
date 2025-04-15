import { Operator } from "@core/operator";
import { type Result } from "@core/result";
import { type ApiError } from "@core/error";
import { InputCreatePerson, type Person } from "./serializer";

export class CreatePersonOperator extends Operator<InputCreatePerson, Person> {
  protected async run(input: Person): Promise<Result<Person, ApiError>> {
    console.debug(input);
    throw new Error("Operator not implemented yet.");
  }
}
