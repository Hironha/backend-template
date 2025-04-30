import z from "zod";
import { Left, Right, type Either } from "./either";
import {
  isNestedValidationConstraint,
  type NestedValidationConstraint,
  type ValidationConstraint,
  type Validator,
} from "@core/validator";

// TODO: maybe this interface should be only for the private method `getIssueMessage`
// because the mapping logic from `ZodIssue` to `ValidationConstraint` is always
// the same, except that the user may want to configure it's mapper for error messages
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

  validate(value: unknown): Either<ValidationConstraint[], T> {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return new Right(result.data);
    }

    const constraints = this.mapper.toValidationConstraints(result.error.errors);
    return new Left(constraints);
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

    // `target` is always defined since `path` is never an empty array
    return target as NestedValidationConstraint;
  }

  private getIssueMessage(issue: z.ZodIssue): string {
    if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
      const options = issue.options.map((opt) => `'${String(opt)}'`).join(", ");
      return `Discriminator should be one of: ${options}`;
    }

    if (issue.code === z.ZodIssueCode.invalid_enum_value) {
      const options = issue.options.map((opt) => `'${String(opt)}'`).join(", ");
      return `Should be one of the valid enum values: ${options}`;
    }

    return issue.message;
  }
}
