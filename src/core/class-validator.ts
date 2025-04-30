import {
  validateSync,
  type ValidationError as ClassValidatorValidationError,
} from "class-validator";
import { Left, Right, type Either } from "@core/either";
import { type ValidationConstraint, type Validator } from "./validator";

export type ClassSchema<T> = new (props: any) => T;

export interface ClassValidatorErrorMapper {
  toValidationConstraints(errors: ClassValidatorValidationError[]): ValidationConstraint[];
}

export class ClassValidator<S extends ClassSchema<any>> implements Validator<S> {
  private schema: S;
  private mapper: ClassValidatorErrorMapper;

  constructor(schema: S, mapper?: ClassValidatorErrorMapper) {
    this.schema = schema;
    this.mapper = mapper ?? new DefaultClassValidatorErrorMapper();
  }

  validate(value: unknown): Either<ValidationConstraint[], InstanceType<S>> {
    const target = new this.schema(value);
    const errors = validateSync(target, { whitelist: true });
    if (errors.length > 0) {
      const constraints = this.mapper.toValidationConstraints(errors);
      return new Left(constraints);
    }

    return new Right(target);
  }
}

class DefaultClassValidatorErrorMapper implements ClassValidatorErrorMapper {
  toValidationConstraints(errors: ClassValidatorValidationError[]): ValidationConstraint[] {
    const constraints: ValidationConstraint[] = [];

    for (const error of errors) {
      if (error.children != null && error.children.length > 0) {
        const nestedConstraints = this.toValidationConstraints(error.children);
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
