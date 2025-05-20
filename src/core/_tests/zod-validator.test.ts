import z from "zod/v4";
import { describe, it, expect } from "@jest/globals";
import { ZodValidator } from "@core/zod-validator";

describe("ZodValidator", () => {
  it("validate with zod schemas", () => {
    const Schema = z.object({
      name: z.string({ error: "name should be a string" }),
    });
    const validator = new ZodValidator(Schema);

    const src = { name: "test" };
    const validated = validator.validate(src);

    expect(validated.isRight()).toBeTruthy();
    expect(validated.right()).toMatchObject(src);
  });

  it("validate non object returning empty field in validation constraint", () => {
    const message = "should be an object";
    const Schema = z.object({ value: z.number() }, { message });
    const validator = new ZodValidator(Schema);
    const result = validator.validate(true);
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([{ field: "", message }]);
  });

  it("convert simple zod error into internal validation constraints", () => {
    const message = "Property 'name' should be a string";
    const Schema = z.object({ name: z.string({ message }) });
    const validator = new ZodValidator(Schema);

    const src = { name: 12 };
    const validated = validator.validate(src);

    expect(validated.isLeft()).toBeTruthy();
    expect(validated.left()).toMatchObject([{ field: "name", message }]);
  });

  it("convert complex object zod error into internal validation constraints", () => {
    const Schema = z.object({
      name: z.string({ message: "expected string" }),
      config: z.object(
        {
          quantity: z
            .number({ message: "expected number" })
            .int({ message: "expected integer" }),
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

    expect(validated.isLeft()).toBeTruthy();
    expect(validated.left()).toMatchObject([
      { field: "name", message: "expected string" },
      {
        field: "config",
        constraints: [
          { field: "quantity", message: "expected number" },
          {
            field: "nested",
            constraints: [{ field: "time", message: "expected string" }],
          },
        ],
      },
    ]);
  });

  it("convert discriminated union zod error into internal validation constraints", () => {
    const Schema = z.discriminatedUnion(
      "kind",
      [
        z.object({ kind: z.literal("cat") }),
        z.object({ kind: z.literal("dog") }),
      ],
      { error: "Discriminator should be one of: 'cat' or 'dog'" },
    );

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([
      {
        field: "kind",
        message: "Discriminator should be one of: 'cat' or 'dog'",
      },
    ]);
  });

  it("convert nested discriminated union zod error into internal validation constraints", () => {
    const Schema = z.object({
      name: z.string({ error: "Property 'name' is required" }),
      traits: z.discriminatedUnion(
        "kind",
        [
          z.object({ kind: z.literal("cat") }),
          z.object({ kind: z.literal("dog") }),
        ],
        {
          error: "Discriminator should be one of: 'cat', 'dog'",
        },
      ),
    });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({ traits: {} });
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([
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
    ]);
  });

  it("convert union zod error into internal validation constraints", () => {
    const unionMessage = "Property 'value' should be either number or string";
    const Schema = z.object({
      value: z.union([z.number(), z.string()], { error: unionMessage }),
    });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([
      { field: "value", message: unionMessage },
    ]);
  });

  it("convert tuple zod error into internal validation constraints", () => {
    const message = "should be a tuple of string and number";
    const Schema = z.object({
      value: z.tuple([z.string(), z.number()], { message }),
    });

    const validator = new ZodValidator(Schema);
    const result = validator.validate({});
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([{ field: "value", message }]);
  });

  it("convert conditional validation errors into internal validation constraints", () => {
    enum Level {
      MERCHANT = "merchant",
      ACCOUNT = "account",
      ACCOUNTS = "accounts",
    }

    const Schema = z
      .object({
        merchantId: z.string(),
        merchantName: z.string().max(256),
        level: z.nativeEnum(Level, { message: "test" }),
        accountId: z.string().optional(),
        accountName: z.string().optional(),
        mainAlertConfigurationId: z.string().optional(),
        accountIds: z.array(z.string()).nonempty().max(20).optional(),
      })
      .refine(
        (obj) => (obj.level === Level.ACCOUNT ? obj.accountId != null : true),
        {
          message: `Required when level is '${Level.ACCOUNT}'`,
          path: ["accountId"],
        },
      )
      .refine(
        (obj) => (obj.level === Level.ACCOUNT ? obj.accountName != null : true),
        {
          message: `Required when level is '${Level.ACCOUNT}'`,
          path: ["accountName"],
        },
      )
      .refine(
        (obj) => (obj.level === Level.ACCOUNTS ? obj.accountIds != null : true),
        {
          message: `Required when level is '${Level.ACCOUNTS}'`,
          path: ["accountIds"],
        },
      );

    const validator = new ZodValidator(Schema);

    let result = validator.validate({
      merchantId: "test",
      merchantName: "test",
      level: Level.ACCOUNT,
    });
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([
      {
        field: "accountId",
        message: `Required when level is '${Level.ACCOUNT}'`,
      },
      {
        field: "accountName",
        message: `Required when level is '${Level.ACCOUNT}'`,
      },
    ]);

    result = validator.validate({
      merchantId: "test",
      merchantName: "test",
      level: Level.ACCOUNTS,
    });
    expect(result.isLeft()).toBeTruthy();
    expect(result.left()).toMatchObject([
      {
        field: "accountIds",
        message: `Required when level is '${Level.ACCOUNTS}'`,
      },
    ]);
  });
});
