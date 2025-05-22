import z from "zod/v4";
import { IsNotEmpty, IsString } from "class-validator";
import { type Either } from "@core/either";
import { type ValidationConstraint } from "@core/validator";
import { ZodValidator } from "@core/zod-validator";
import { ValidatedInput } from "@core/input";
import { ClassValidator } from "@core/class-validator";
import { isValidCPF, CPF } from "./cpf";

export interface Person {
  name: string;
  cpf: string;
}

const PersonSchema = z.object({
  name: z.string({
    error: (iss) =>
      iss.input == null ? "Property 'name' is required" : "Property 'name' should be a string",
  }),
  cpf: z
    .string({
      error: (iss) =>
        iss.input == null ? "Property 'cpf' is required" : "Property 'cpf' should be a string",
    })
    .refine(isValidCPF, { message: "Property 'cpf' must be a valid CPF" }),
});

export class PersonZodValidator extends ValidatedInput<Person> {
  constructor(private src: unknown) {
    super(new ZodValidator(PersonSchema));
  }

  validated(): Either<ValidationConstraint[], Person> {
    return this.validator.validate(this.src);
  }
}

class PersonClass {
  @IsNotEmpty({ message: "Property 'name' is required" })
  @IsString({ message: "Property 'name' should be a string" })
  name: string;

  @IsNotEmpty()
  @IsString()
  @CPF({ message: "Property 'cpf' must be a valid CPF" })
  cpf: string;

  constructor(props: any) {
    this.name = props?.description;
    this.cpf = props?.cpf;
  }
}

export class PersonClassValidator extends ValidatedInput<Person> {
  constructor(private src: unknown) {
    super(new ClassValidator(PersonClass));
  }

  validated(): Either<ValidationConstraint[], Person> {
    return this.validator.validate(this.src);
  }
}
