import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { describe, it, expect } from "@jest/globals";
import { type ValidationError } from "@core/validator";
import { ClassValidator } from "@core/class-validator";

describe("ClassValidator", () => {
  it("should be able to validate with class validator schemas", () => {
    class Schema {
      @IsNotEmpty()
      @IsString()
      name: string;

      constructor(props: any) {
        this.name = props?.name;
      }
    }

    const validator = new ClassValidator(Schema);
    const src = { name: "test" };
    const validated = validator.validate(src);

    expect(validated.isOk()).toBeTruthy();
    expect(validated.ok()).toMatchObject(src);
  });

  it("should be able to convert simple zod error into internal validation constraints", () => {
    const message = "expected string";

    class Schema {
      @IsNotEmpty()
      @IsString({ message })
      @MinLength(2)
      name: string;

      constructor(props: any) {
        this.name = props?.name;
      }
    }

    const validator = new ClassValidator(Schema);
    const src = { name: 12 };
    const validated = validator.validate(src);

    expect(validated.isErr()).toBeTruthy();
    expect(validated.err()).toMatchObject({
      constraints: [{ field: "name", message }],
    });
  });

  it("should be able to convert complex object class validator error into internal validation constraints", () => {
    class NestedSchema {
      @IsNotEmpty()
      @IsDateString({}, { message: "expected string" })
      time: string;

      constructor(props: any) {
        this.time = props?.time;
      }
    }

    class ConfigSchema {
      @IsNotEmpty({ message: "expected quantity" })
      @IsNumber({}, { message: "expected number" })
      @IsInt({ message: "expected integer" })
      quantity: number;

      @IsNotEmpty()
      @ValidateNested()
      nested: NestedSchema;

      constructor(props: any) {
        this.quantity = props?.quantity;
        this.nested = new NestedSchema(props?.nested);
      }
    }

    class Schema {
      @IsNotEmpty()
      @IsString({ message: "expected string" })
      name: string;

      @IsNotEmpty()
      @ValidateNested()
      config: ConfigSchema;

      constructor(props: any) {
        this.name = props?.name;
        this.config = new ConfigSchema(props?.config);
      }
    }

    const validator = new ClassValidator(Schema);
    const src = {
      name: 12,
      config: {
        nested: {
          time: new Date(),
        },
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
            { field: "quantity", message: "expected quantity" },
            { field: "nested", constraints: [{ field: "time", message: "expected string" }] },
          ],
        },
      ],
    });
  });
});
