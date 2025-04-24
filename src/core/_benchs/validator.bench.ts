import z from "zod";
import { IsDate, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ZodValidator } from "@core/zod-validator";
import { ClassValidator } from "@core/class-validator";
import { Task, Suite, Benchmark } from "@core/benchmark";

const ZodSchema = z.object({
  name: z.string({ message: "Property 'name' should be a string" }),
  nested: z.object({
    time: z.date({ message: "Property 'time' should a Date" }),
  }),
});

function validateWithZod(input: unknown): void {
  const validator = new ZodValidator(ZodSchema);
  validator.validate(input);
}

class ClassValidatorNestedSchema {
  @IsNotEmpty()
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

  @IsNotEmpty()
  @ValidateNested()
  nested: ClassValidatorNestedSchema;

  constructor(props: any) {
    this.name = props?.name;
    this.nested = new ClassValidatorNestedSchema(props?.nested);
  }
}

function validateWithClassValidator(input: unknown): void {
  const validator = new ClassValidator(ClassValidatorSchema);
  validator.validate(input);
}

const input = {
  name: "test",
  nested: {
    time: new Date(),
  },
};

new Benchmark("Validations")
  .addSuite(
    new Suite("Validation with nested object", { times: 1000 })
      .addTask(
        new Task("Validation with zod")
          .withInput(input)
          .executes((input) => validateWithZod(input)),
      )
      .addTask(
        new Task("Validation with class-validator")
          .withInput(input)
          .executes((input) => validateWithClassValidator(input)),
      ),
  )
  .run();
