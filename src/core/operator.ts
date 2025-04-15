import { type ApiError } from "@core/error";
import { Err, type Result, type InferOk, type InferErr } from "@core/result";
import { Validator, type ValidationError } from "@core/validator";

type InferInput<T extends Input<any>> = InferOk<ReturnType<T["validated"]>>;

export abstract class Input<T> {
  protected constructor(protected validator: Validator<T>) {}

  abstract validated(): Result<T, ValidationError>;
}

export abstract class Operator<I extends Input<any>, O extends Result<any, any>> {
  protected abstract run(input: InferInput<I>): Promise<O>;

  async exec(input: I): Promise<Result<InferOk<O>, InferErr<O> | ApiError>> {
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
