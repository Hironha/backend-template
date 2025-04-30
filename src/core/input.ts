import { type Result } from "./result";
import { type Validator, type ValidationConstraint } from "./validator";

export abstract class ValidatedInput<T extends Record<string, any>> {
  protected constructor(protected validator: Validator<T>) {}

  abstract validated(): Result<T, ValidationConstraint[]>;
}
