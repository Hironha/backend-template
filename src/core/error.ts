import { type ValidationError } from "./validator";

export interface ApiErrorJson<T> {
  code: string;
  message: string;
  timestamp: string;
  details?: T;
}

export abstract class ApiError<C extends string = string, T extends Record<string, any> = never> {
  readonly code: C;
  readonly message: string;
  readonly timestamp: Date;
  readonly details?: T;

  constructor(code: C, message: string, details?: T) {
    this.code = code;
    this.message = message;
    this.timestamp = new Date();
    this.details = details;
  }

  /**
   * Custom JSON serialization for `ApiError<T>` class into `ApiErrorJson<T>`.
   */
  toJSON(): ApiErrorJson<T> {
    const json: ApiErrorJson<T> = {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.details !== undefined) json.details = this.details;

    return json;
  }
}

export class ApiValidationError extends ApiError<"ValidationError", ValidationError> {
  override readonly details: ValidationError;

  constructor(details: ValidationError) {
    super("ValidationError", "Failed constrainst validation");
    this.details = details;
  }
}
