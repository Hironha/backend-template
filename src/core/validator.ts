import { type Either } from "./either";

export interface Validator<T extends Record<string, any> = any> {
  validate(value: unknown): Either<ValidationConstraint[], T>;
}

export type ValidationConstraint = FieldValidationConstraint | NestedValidationConstraint;

export interface FieldValidationConstraint {
  field: string;
  message: string;
}

export interface NestedValidationConstraint {
  field: string;
  constraints: ValidationConstraint[];
}

export function isNestedValidationConstraint(
  constraint: ValidationConstraint,
): constraint is NestedValidationConstraint {
  return "constraints" in constraint;
}
