export type EitherLegacy<L, A> = LeftLegacy<L, A> | RightLegacy<L, A>;

export class LeftLegacy<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is LeftLegacy<L, A> {
    return true;
  }

  isRight(): this is RightLegacy<L, A> {
    return false;
  }
}

export class RightLegacy<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is LeftLegacy<L, A> {
    return false;
  }

  isRight(): this is RightLegacy<L, A> {
    return true;
  }
}
