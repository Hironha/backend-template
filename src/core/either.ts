export type Either<L, R> = Left<L> | Right<R>;

export type InferRight<E extends Either<any, any>> = ReturnType<E["unwrapRight"]>;

export type InferLeft<E extends Either<any, any>> = ReturnType<E["unwrapLeft"]>;

export interface EitherVariant<L, R> {
  /**
   * If `Either<L, R>` is `Right<R>`, return R, otherwise returns `undefined`.
   */
  right(): R | undefined;
  /**
   * If `Either<L, R>` is `Left<L>`, return L, otherwise returns `undefined`.
   */
  left(): L | undefined;
  /**
   * Checks if the `Either<L, R>` is the variant `Right<R>`.
   */
  isRight(): this is Right<R>;
  /**
   * Checks if the `Either<L, R>` is the variant `Left<L>`.
   */
  isLeft(): this is Left<L>;
  /**
   * Transforms from `R` to `U` using param `fn` and returns a new `Either<L, U>` object.
   */
  mapRight<U>(fn: (val: R) => U): Either<L, U>;
  /**
   * Transforms from `L` to `U` using param `fn` and returns a new `Either<U, R>` object.
   */
  mapLeft<U>(fn: (val: L) => U): Either<U, R>;
  /**
   * Unwrap the `R` value from `Either<L, R>` and returns it.
   * @throws {Error} May throw an `Error` if trying to unwrap right a `Left<L>` variant.
   */
  unwrapRight(): R;
  /**
   * Unwrap the `L` value from `Either<L, R>` and returns it.
   * @throws {Error} May throw an `Error` if trying to unwrap left a `Right<R>` variant.
   */
  unwrapLeft(): L;
  /**
   * Unwrap the `R` value from `Either<L, R>` with a custom error message and returns it.
   * @throws {Error} May throw an `Error` if trying to expect right a `Left<L>` variant.
   */
  expectRight(message: string): R;
  /**
   * Unwrap the `L` value from `Either<L, R>` with a custom error message and returns it.
   * @throws {Error} May throw an `Error` if trying to expect left a `Right<R>` variant.
   */
  expectLeft(message: string): L;
}

const RIGHT = "right" as const;
export class Right<R> implements EitherVariant<never, R> {
  public readonly kind = RIGHT;
  public readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  right(): R {
    return this.value;
  }

  left(): undefined {
    return undefined;
  }

  isRight(): this is Right<R> {
    return true;
  }

  isLeft(): this is Left<never> {
    return false;
  }

  mapRight<U>(fn: (val: R) => U): Either<never, U> {
    return new Right<U>(fn(this.value));
  }

  mapLeft(): Either<never, R> {
    return this;
  }

  unwrapRight(): R {
    return this.value;
  }

  unwrapLeft(): never {
    throw new Error("Invalid unwrap left of either 'Right' variant");
  }

  expectRight(): R {
    return this.value;
  }

  expectLeft(message: string): never {
    throw new Error(message);
  }
}

const LEFT = "left" as const;
export class Left<L> implements EitherVariant<L, never> {
  public readonly kind = LEFT;
  public readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  right(): undefined {
    return undefined;
  }

  left(): L {
    return this.value;
  }

  isRight(): this is Right<never> {
    return false;
  }

  isLeft(): this is Left<L> {
    return true;
  }

  mapRight(): Either<L, never> {
    return this;
  }

  mapLeft<U>(fn: (val: L) => U): Either<U, never> {
    return new Left(fn(this.value));
  }

  unwrapRight(): never {
    throw new Error("Invalid unwrap right of either 'Left' variant");
  }

  unwrapLeft(): L {
    return this.value;
  }

  expectRight(message: string): never {
    throw new Error(message);
  }

  expectLeft(): L {
    return this.value;
  }
}
