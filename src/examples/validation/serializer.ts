import z from "zod";
import { Input } from "@core/operator";
import { type Result } from "@core/result";
import { type ApiError } from "@core/error";
import { type ValidationError } from "@core/validator";
import { ZodValidator } from "@core/zod-validator";

const PersonSchema = z.object({
  name: z
    .string({ message: "Property 'name' is a required string" })
    .trim()
    .max(128, { message: "Property 'name' cannot have more than 128 characters" }),
  age: z
    .number({ message: "Property 'age' is a required number" })
    .int({ message: "Property 'age' should be an integer" })
    .min(0, { message: "Property 'age' cannot be equal or less than 0" }),
});

export interface Person extends z.infer<typeof PersonSchema> {}

export type OutputCreatePerson = Result<Person, ApiError>;

export class InputCreatePerson extends Input<Person> {
  constructor(private src: unknown) {
    super(new ZodValidator(PersonSchema));
  }

  validated(): Result<Person, ValidationError> {
    return this.validator.validate(this.src);
  }
}
