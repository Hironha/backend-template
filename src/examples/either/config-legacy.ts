import { LeftLegacy, RightLegacy, type EitherLegacy } from "@core/either-legacy";

export interface Config {
  name: string;
  times: number;
}

export function parseConfigName(value: unknown): EitherLegacy<Error, string> {
  if (typeof value !== "string") {
    return new LeftLegacy(new Error("Config 'name' should be a string"));
  }

  if (value.length > 256) {
    return new LeftLegacy(new Error("Config 'name' cannot have more than 256 characters"));
  }

  return new RightLegacy(value);
}

export function parseConfigTimes(value: unknown): EitherLegacy<Error, number> {
  if (typeof value !== "number") {
    return new LeftLegacy(new Error("Config 'times' should be a number"));
  }

  if (!Number.isInteger(value)) {
    return new LeftLegacy(new Error("Config 'times' should be an integer"));
  }

  if (value <= 0) {
    return new LeftLegacy(new Error("Config 'times' should be greater than 0"));
  }

  return new RightLegacy(value);
}

export function parseConfig(src: unknown): EitherLegacy<Error, Config> {
  if (src === null) {
    return new LeftLegacy(new Error("Expected config object but received null"));
  }

  if (typeof src !== "object") {
    const type = typeof src;
    return new LeftLegacy(new Error(`Expected config object but received ${type}`));
  }

  if (!("name" in src)) {
    return new LeftLegacy(new Error("Missing property 'name' in config object"));
  }

  const name = parseConfigName(src.name);
  if (name.isLeft()) {
    // with new `Either` definition, we would not need to rewrap name value
    // into a new `Left` variant
    return new LeftLegacy(name.value);
  }

  if (!("times" in src)) {
    return new LeftLegacy(new Error("Missing property 'times' in config object"));
  }

  const times = parseConfigTimes(src.times);
  if (times.isLeft()) {
    // with new `Either` definition, we would not need to rewrap name value
    // into a new `Left` variant
    return new LeftLegacy(times.value);
  }

  return new RightLegacy({
    name: name.value,
    times: times.value,
  });
}
