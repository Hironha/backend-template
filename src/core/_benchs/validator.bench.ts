import z from "zod";
import { IsDate, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ZodValidator } from "@core/zod-validator";
import { ClassValidator } from "@core/class-validator";
import { Task, Suite, Benchmark } from "@core/benchmark";

const DEBUG = false;

const ZodSchema = z.object({
  name: z.string({ message: "Property 'name' should be a string" }),
  nested: z.object(
    {
      time: z.date({ message: "Property 'time' should a Date" }),
    },
    { required_error: "Property 'nested' is required" },
  ),
});

function validateWithZod(input: unknown): void {
  const validator = new ZodValidator(ZodSchema);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.debug("Zod error");
    console.dir(result.value, { depth: Infinity });
  }
}

class ClassValidatorNestedSchema {
  @IsNotEmpty({ message: "Property 'time' should be a Date" })
  @IsDate({ message: "Property 'time' should be a Date" })
  time: Date;

  constructor(props: any) {
    this.time = props?.any;
  }
}

class ClassValidatorSchema {
  @IsNotEmpty()
  @IsString({ message: "Property 'name' should be a string" })
  name: string;

  @IsNotEmpty({ message: "Property 'nested' is required" })
  @ValidateNested()
  nested: ClassValidatorNestedSchema;

  constructor(props: any) {
    this.name = props?.name;
    this.nested = new ClassValidatorNestedSchema(props?.nested);
  }
}

function validateWithClassValidator(input: unknown): void {
  const validator = new ClassValidator(ClassValidatorSchema);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.debug("Class validator error");
    console.dir(result.value, { depth: Infinity });
  }
}

const goodInput = {
  name: "test",
  nested: {
    time: new Date(),
  },
};

const badInput = {
  age: 12,
  name: {
    first: "firstname",
    last: "lastname",
  },
};

export const benchmark = new Benchmark("Comparison of zod and class-validator")
  .addSuite(
    new Suite("Successful validation of nested objects", { times: 10_000 })
      .addTask(
        new Task("Validation with zod")
          .withInput(goodInput)
          .executes((input) => validateWithZod(input)),
      )
      .addTask(
        new Task("Validation with class-validator")
          .withInput(goodInput)
          .executes((input) => validateWithClassValidator(input)),
      ),
  )
  .addSuite(
    new Suite("Validation with error with nested objects", { times: 10_000 })
      .addTask(
        new Task("Validation with zod")
          .withInput(badInput)
          .executes((input) => validateWithZod(input)),
      )
      .addTask(
        new Task("Validation with class-validator")
          .withInput(badInput)
          .executes((input) => validateWithClassValidator(input)),
      ),
  );
