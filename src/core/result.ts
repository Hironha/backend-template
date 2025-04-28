export type Result<T, E> = Ok<T> | Err<E>;

export type InferOk<R extends Result<any, any>> = ReturnType<R["unwrap"]>;

export type InferErr<R extends Result<any, any>> = ReturnType<R["unwrapErr"]>;

export interface ResultVariant<T, E> {
  /**
   * If `Result<T, E>` is `Right<T>` variant returns `T`, otherwise returns `undefiend`.
   */
  ok(): T | undefined;
  /**
   * If `Result<T, E>` is `Err<E>` variant returns `E`, otherwise returns `undefined`.
   */
  err(): E | undefined;
  /**
   * Checks if the `Result<T, E>` is the variant `Ok<T>`.
   */
  isOk(): this is Ok<T>;
  /**
   * Checks if the `Result<T, E>` is the variant `Err<E>`.
   */
  isErr(): this is Err<E>;
  /**
   * Transforms from `T` to `U` using param `fn` and returns a new `Result<U, E>` object.
   */
  map<U>(fn: (val: T) => U): Result<U, E>;
  /**
   * Transforms from `E` to `U` using param `fn` and returns a new `Result<T, U>` object.
   */
  mapErr<U>(fn: (val: E) => U): Result<T, U>;
  /**
   * Unwrap the `T` value from `Result<T, E>` and returns it.
   * @throws {Error} May throw an `Error` if trying to unwrap an `Err<E>` variant.
   */
  unwrap(): T;
  /**
   * Unwrap the `E` value from `Result<T, E>` and returns it.
   * @throws {Error} May throw an `Error` if trying to unwrap error an `Ok<T>` variant.
   */
  unwrapErr(): E;
  /**
   * Unwrap the `T` value from `Result<T, E` with a custom error message and returns it.
   * @throws {Error} May throw an `Error` if trying to expect an `Err<E>` variant.
   */
  expect(message: string): T;
  /**
   * Unwrap the `E` value from `Result<T, E>` with a custom error message and returns it.
   * @throws {Error} May throw an `Error` if trying to expect error an `Ok<T>` variant.
   */
  expectErr(message: string): E;
}

const OK = "ok" as const;
export class Ok<T> implements ResultVariant<T, never> {
  public readonly kind = OK;
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  ok(): T {
    return this.value;
  }

  err(): undefined {
    return undefined;
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  map<U>(fn: (val: T) => U): Result<U, never> {
    return new Ok(fn(this.value));
  }

  mapErr(): Result<T, never> {
    return this;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error("Invalid unwrap error of result 'Ok' variant");
  }

  expect(): T {
    return this.value;
  }

  expectErr(message: string): never {
    throw new Error(message);
  }
}

const ERR = "err" as const;
export class Err<E> implements ResultVariant<never, E> {
  public readonly kind = ERR;
  public readonly value: E;

  constructor(value: E) {
    this.value = value;
  }

  ok(): undefined {
    return undefined;
  }

  err(): E {
    return this.value;
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  map(): Result<never, E> {
    return this;
  }

  mapErr<U>(fn: (val: E) => U): Result<never, U> {
    return new Err(fn(this.value));
  }

  unwrap(): never {
    throw new Error("Invalid unwrap of result 'Err' variant");
  }

  unwrapErr(): E {
    return this.value;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  expectErr(): E {
    return this.value;
  }
}
