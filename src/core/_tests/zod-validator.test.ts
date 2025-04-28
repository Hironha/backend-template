import z from "zod";
import { describe, it, expect } from "@jest/globals";
import { ZodValidator } from "@core/zod-validator";

describe("ZodValidator", () => {
  it("validate with zod schemas", () => {
    const Schema = z.object({ name: z.string() });
    const validator = new ZodValidator(Schema);

    const src = { name: "test" };
    const validated = validator.validate(src);

    expect(validated.isOk()).toBeTruthy();
    expect(validated.ok()).toMatchObject(src);
  });

  it("validate non object returning empty field in validation constraint", () => {
    const message = "should be an object";
    const Schema = z.object({ value: z.number() }, { message });
    const validator = new ZodValidator(Schema);
    const result = validator.validate(true);
    expect(result.isErr()).toBeTruthy();
    expect(result.err()).toMatchObject({
      constraints: [{ field: "", message }],
    });
  });

  it("convert simple zod error into internal validation constraints", () => {
    const message = "Property 'name' should be a string";
    const Schema = z.object({ name: z.string({ message }) });
    const validator = new ZodValidator(Schema);

    const src = { name: 12 };
    const validated = validator.validate(src);

    expect(validated.isErr()).toBeTruthy();
    expect(validated.err()).toMatchObject({
      constraints: [{ field: "name", message }],
    });
  });

  it("convert complex object zod error into internal validation constraints", () => {
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

    expect(validated.isErr()).toBeTruthy();
    expect(validated.err()).toMatchObject({
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
    });
  });

  it("convert discriminated union zod error into internal validation constraints", () => {
    const Schema = z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("cat", { message: "cat" }) }),
      z.object({ kind: z.literal("dog", { message: "dog" }) }),
    ]);

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isErr()).toBeTruthy();
    expect(result.err()).toMatchObject({
      constraints: [{ field: "kind", message: "Discriminator should be one of: 'cat', 'dog'" }],
    });
  });

  it("convert nested discriminated union zod error into internal validation constraints", () => {
    const Schema = z.object({
      name: z.string({ required_error: "Property 'name' is required" }),
      traits: z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("cat", { message: "cat" }) }),
        z.object({ kind: z.literal("dog", { message: "dog" }) }),
      ]),
    });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({ traits: {} });
    expect(result.isErr()).toBeTruthy();
    expect(result.err()).toMatchObject({
      constraints: [
        { field: "name", message: "Property 'name' is required" },
        {
          field: "traits",
          constraints: [
            {
              field: "kind",
              message: "Discriminator should be one of: 'cat', 'dog'",
            },
          ],
        },
      ],
    });
  });

  it("convert union zod error into internal validation constraints", () => {
    const unionMessage = "Property 'value' should be either number or string";
    const Schema = z.object({
      value: z.union([z.number(), z.string()], {
        errorMap: () => ({ message: unionMessage }),
      }),
    });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isErr()).toBeTruthy();
    expect(result.err()).toMatchObject({
      constraints: [{ field: "value", message: unionMessage }],
    });
  });

  it("convert tuple zod error into internal validation constraints", () => {
    const message = "should be a tuple of string and number";
    const Schema = z.object({ value: z.tuple([z.string(), z.number()], { message }) });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isErr()).toBeTruthy();
    expect(result.err()).toMatchObject({
      constraints: [{ field: "value", message }],
    });
  });
});
