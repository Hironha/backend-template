import { ApiError } from "@core/error";

export class TodoError extends ApiError<"TodoError"> {
  constructor(message: string) {
    super("TodoError", message);
  }
}
