import { ApiError } from "@core/error";

export class TodoError extends ApiError<"TodoError"> {
  constructor(message: string) {
    super("TodoError", message);
  }
}

export class TodoAlreadyExistsError extends ApiError<"TodoAlreadyExists"> {
  constructor(id: string) {
    super("TodoAlreadyExists", `Todo with id ${id} already exists`);
  }
}
