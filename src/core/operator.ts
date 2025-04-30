import { ApiValidationError } from "./error";
import { Left, type Either, type InferLeft, type InferRight } from "./either";
import { type ValidatedInput } from "./input";

export abstract class Operator<I extends Record<string, any>, O extends Either<any, any>> {
  protected abstract run(input: I): Promise<O>;

  async exec(
    input: ValidatedInput<I>,
  ): Promise<Either<ApiValidationError, InferLeft<O> | InferRight<O>>> {
    const dto = input.validated();
    if (dto.isLeft()) {
      const error = new ApiValidationError(dto.value);
      return new Left(error);
    }

    return this.run(dto.value);
  }
}
