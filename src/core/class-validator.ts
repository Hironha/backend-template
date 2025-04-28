import {
  validateSync,
  type ValidationError as ClassValidatorValidationError,
} from "class-validator";
import { type ValidatedInput } from "./input";
import { Err, Ok, type Result } from "./result";
import { type ValidationConstraint, type ValidationError, type Validator } from "./validator";

export type ClassSchema<T> = new (props: any) => T;

export class ClassValidator<S extends ClassSchema<any>> implements Validator<S> {
  private schema: S;

  constructor(schema: S) {
    this.schema = schema;
  }

  validate(value: unknown): Result<InstanceType<S>, ValidationError> {
    const target = new this.schema(value);
    const errors = validateSync(target, { whitelist: true });
    if (errors.length > 0) {
      const mapper = new ClassValidatorErrorMapper();
      const constraints = mapper.mapToValidationConstraints(errors);
      return new Err({ constraints });
    }

    return new Ok(target);
  }
}

class ClassValidatorErrorMapper {
  mapToValidationConstraints(errors: ClassValidatorValidationError[]): ValidationConstraint[] {
    const constraints: ValidationConstraint[] = [];

    for (const error of errors) {
      if (error.children != null && error.children.length > 0) {
        const nestedConstraints = this.mapToValidationConstraints(error.children);
        if (nestedConstraints.length > 0) {
          constraints.push({ field: error.property, constraints: nestedConstraints });
        }
        continue;
      }

      if (error.constraints == null) continue;

      // although class-validator returns all constraints errors, our internal `ValidationConstraint` only supports
      // one error message per property, so we take the last, since class-validator sorts the decorators constraints
      // errors from bottom to top
      const messages = Object.values(error.constraints).reverse();
      if (messages.length === 0) continue;

      constraints.push({ field: error.property, message: messages[0] });
    }

    return constraints;
  }
}
