import { type ApiError } from "@core/error";
import { Err, type Result, type InferOk } from "@core/result";
import { Validator, type ValidationError } from "@core/validator";

export abstract class Input<T> {
  protected constructor(protected validator: Validator<T>) {}

  abstract validated(): Result<T, ValidationError>;
}

export abstract class Operator<I, O extends Result<any, ApiError>> {
  protected abstract run(input: I): Promise<O>;

  async exec(input: Input<I>): Promise<Result<InferOk<O>, ApiError>> {
    const dto = input.validated();
    if (dto.isErr()) {
      return new Err({
        code: "validation_error",
        message: "Failed validation error",
        shortMessage: "validation_error",
        details: dto.value.constraints,
      });
    }

    return this.run(dto.value);
  }
}
