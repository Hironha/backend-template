import { ApiValidationError, type ApiError } from "./error";
import { Err, type Result, type InferOk, type InferErr } from "@core/result";
import { type ValidatedInput } from "./input";

export abstract class Operator<I, O extends Result<any, any>> {
  protected abstract run(input: I): Promise<O>;

  async exec(
    input: ValidatedInput<I>,
  ): Promise<Result<InferOk<O>, InferErr<O> | ApiValidationError>> {
    const dto = input.validated();
    if (dto.isErr()) {
      const error = new ApiValidationError(dto.value);
      return new Err(error);
    }

    return this.run(dto.value);
  }
}
