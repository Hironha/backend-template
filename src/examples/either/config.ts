import { Left, Right, type Either } from "@core/either";

export interface Config {
  name: string;
  times: number;
}

export function parseConfigName(value: unknown): Either<Error, string> {
  if (typeof value !== "string") {
    return new Left(new Error("Config 'name' should be a string"));
  }

  if (value.length > 256) {
    return new Left(new Error("Config 'name' cannot have more than 256 characters"));
  }

  return new Right(value);
}

export function parseConfigTimes(value: unknown): Either<Error, number> {
  if (typeof value !== "number") {
    return new Left(new Error("Config 'times' should be a number"));
  }

  if (!Number.isInteger(value)) {
    return new Left(new Error("Config 'times' should be an integer"));
  }

  if (value <= 0) {
    return new Left(new Error("Config 'times' should be greater than 0"));
  }

  return new Right(value);
}

export function parseConfig(src: unknown): Either<Error, Config> {
  if (src === null) {
    return new Left(new Error("Expected config object but received null"));
  }

  if (typeof src !== "object") {
    const type = typeof src;
    return new Left(new Error(`Expected config object but received ${type}`));
  }

  if (!("name" in src)) {
    return new Left(new Error("Missing property 'name' in config object"));
  }

  const name = parseConfigName(src.name);
  if (name.isLeft()) {
    return name;
  }

  if (!("times" in src)) {
    return new Left(new Error("Missing property 'times' in config object"));
  }

  const times = parseConfigTimes(src.times);
  if (times.isLeft()) {
    return times;
  }

  return new Right({
    name: name.value,
    times: times.value,
  });
}
