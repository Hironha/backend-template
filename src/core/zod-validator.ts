import z from "zod";
import { Err, Ok, type Result } from "@core/result";
import {
  isNestedValidationConstraint,
  type NestedValidationConstraint,
  type ValidationConstraint,
  type ValidationError,
  type Validator,
} from "@core/validator";

export class ZodValidator<T> implements Validator<T> {
  private readonly schema: z.ZodType<T>;

  constructor(schema: z.ZodType<T>) {
    this.schema = schema;
  }

  validate(value: unknown): Result<T, ValidationError> {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return new Ok(result.data);
    }

    const mapper = new ZodErrorMapper();
    const constraints = mapper.mapToValidationConstraints(result.error.errors);
    return new Err({ constraints });
  }
}

class ZodErrorMapper {
  mapToValidationConstraints(issues: z.ZodIssue[]): ValidationConstraint[] {
    const constraints: ValidationConstraint[] = [];

    console.dir(issues, { depth: Infinity });

    for (const issue of issues) {
      if (issue.path.length === 0) continue;
      if (issue.path.length === 1) {
        const field = issue.path[0].toString();
        constraints.push({ field, message: issue.message });
        continue;
      }

      const path = issue.path.slice(0, -1).map((p) => p.toString());
      const field = issue.path[issue.path.length - 1]!.toString();
      const constraint = this.getOrInsertNestedConstraint(constraints, path);
      constraint.constraints.push({ field, message: issue.message });
    }

    return constraints;
  }

  private getOrInsertNestedConstraint(
    constraints: ValidationConstraint[],
    path: string[],
  ): NestedValidationConstraint {
    let target: NestedValidationConstraint | undefined;
    for (const field of path) {
      const current = constraints.find((c) => {
        return isNestedValidationConstraint(c) && c.field === field;
      }) as NestedValidationConstraint | undefined;

      if (current) {
        target = current;
        constraints = target.constraints;
      } else {
        target = { field, constraints: [] };
        constraints.push(target);
        constraints = target.constraints;
      }
    }

    // guaranteed to not be undefined here but still necessary check to please the typescript compiler
    if (target == null) {
      throw new Error("Expected target constraint to exist");
    }

    return target;
  }
}
