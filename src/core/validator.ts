import { type Result } from "@core/result";

export interface Validator<T> {
  validate(value: unknown): Result<T, ValidationError>;
}

export interface ValidationError {
  constraints: ValidationConstraint[];
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
