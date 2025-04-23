import z from "zod";
import { describe, it, expect } from "@jest/globals";
import { ZodValidator } from "@core/zod-validator";
import { type ValidationError } from "@core/validator";

describe("ZodValidator", () => {
  it("should be able to validate with zod schemas", () => {
    const Schema = z.object({ name: z.string() });
    const validator = new ZodValidator(Schema);

    const src = { name: "test" };
    const validated = validator.validate(src);

    expect(validated.isOk()).toBeTruthy();
    expect(validated.ok()).toMatchObject(src);
  });

  it.only("should be able to convert simple zod error into internal validation constraints", () => {
    const message = "Property 'name' should be a string";
    const Schema = z.object({ name: z.string({ message }) });
    const validator = new ZodValidator(Schema);

    const src = { name: 12 };
    const validated = validator.validate(src);

    const error = {
      constraints: [{ field: "name", message }],
    } satisfies ValidationError;
    expect(validated.isErr()).toBeTruthy();
    expect(validated.err()).toMatchObject(error);
  });

  it("should be able to convert complex object zod error into internal validation constraints", () => {
    const Schema = z.object({
      name: z.string({ message: "expected string" }),
      config: z.object(
        {
          quantity: z.number({ message: "expected number" }).int({ message: "expected integer" }),
          nested: z.object({
            time: z.string({ message: "expected string" }),
          }),
        },
        { message: "expected object" },
      ),
    });
    const validator = new ZodValidator(Schema);

    const src = {
      name: 12,
      config: {
        nested: {},
      },
    };
    const validated = validator.validate(src);

    const error = {
      constraints: [
        { field: "name", message: "expected string" },
        {
          field: "config",
          constraints: [
            { field: "quantity", message: "expected number" },
            { field: "nested", constraints: [{ field: "time", message: "expected string" }] },
          ],
        },
      ],
    } satisfies ValidationError;
    expect(validated.isErr()).toBeTruthy();
    expect(validated.err()).toMatchObject(error);
  });
});
