import z from "zod";
import { Err, Ok, type Result } from "@core/result";
import {
  isNestedValidationConstraint,
  type NestedValidationConstraint,
  type ValidationConstraint,
  type ValidationError,
  type Validator,
} from "@core/validator";

export interface ZodErrorMapper {
  toValidationConstraints(issues: z.ZodIssue[]): ValidationConstraint[];
}

export class ZodValidator<T extends Record<string, any>> implements Validator<T> {
  private readonly schema: z.ZodType<T>;
  private readonly mapper: ZodErrorMapper;

  constructor(schema: z.ZodType<T>, mapper?: ZodErrorMapper) {
    this.schema = schema;
    this.mapper = mapper ?? new DefaultZodErrorMapper();
  }

  validate(value: unknown): Result<T, ValidationError> {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return new Ok(result.data);
    }

    const constraints = this.mapper.toValidationConstraints(result.error.errors);
    return new Err({ constraints });
  }
}

class DefaultZodErrorMapper implements ZodErrorMapper {
  toValidationConstraints(issues: z.ZodIssue[]): ValidationConstraint[] {
    const constraints: ValidationConstraint[] = [];

    for (const issue of issues) {
      if (issue.path.length === 0) {
        constraints.push({ field: "", message: issue.message });
        continue;
      }

      if (issue.path.length === 1) {
        const field = issue.path[0].toString();
        const message = this.getIssueMessage(issue);
        constraints.push({ field, message });
        continue;
      }

      const path = issue.path.slice(0, -1).map((p) => p.toString());
      const field = issue.path[issue.path.length - 1]!.toString();
      const constraint = this.getOrInsertNestedConstraint(constraints, path);
      const message = this.getIssueMessage(issue);
      constraint.constraints.push({ field, message });
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

  private getIssueMessage(issue: z.ZodIssue): string {
    if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
      const options = issue.options.map((opt) => `'${String(opt)}'`).join(", ");
      return `Discriminator should be one of: ${options}`;
    }

    return issue.message;
  }
}
