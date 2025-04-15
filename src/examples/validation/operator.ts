import { Operator } from "@core/operator";
import { type Result } from "@core/result";
import { type InputCreatePerson, type Person, type OutputCreatePerson } from "./serializer";

export class CreatePersonOperator extends Operator<InputCreatePerson, OutputCreatePerson> {
  protected async run(input: Person): Promise<OutputCreatePerson> {
    console.debug(input);
    throw new Error("Operator not implemented yet.");
  }
}
