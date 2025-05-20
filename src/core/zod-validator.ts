import z from "zod/v4";
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
  toValidationConstraints(error: z.ZodError<any>): ValidationConstraint[];
}

export class ZodValidator<T extends z.ZodType<Record<string, any>>>
  implements Validator<z.infer<T>>
{
  private readonly schema: T;
  private readonly mapper: ZodErrorMapper;

  constructor(schema: T, mapper?: ZodErrorMapper) {
    this.schema = schema;
    this.mapper = mapper ?? new DefaultZodErrorMapper();
  }

  validate(value: unknown): Either<ValidationConstraint[], z.infer<T>> {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return new Right(result.data);
    }

    const constraints = this.mapper.toValidationConstraints(result.error);
    return new Left(constraints);
  }
}

class DefaultZodErrorMapper implements ZodErrorMapper {
  toValidationConstraints(error: z.ZodError<any>): ValidationConstraint[] {
    const constraints: ValidationConstraint[] = [];
    for (const issue of error.issues) {
      if (issue.path.length === 0) {
        constraints.push({ field: "", message: issue.message });
        continue;
      }

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

    // `target` is always defined since `path` is never an empty array
    return target as NestedValidationConstraint;
  }
}
