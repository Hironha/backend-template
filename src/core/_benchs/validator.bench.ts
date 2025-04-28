import z from "zod";
import {
  IsDate,
  IsNotEmpty,
  IsString,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from "class-validator";
import { ZodValidator } from "@core/zod-validator";
import { ClassValidator } from "@core/class-validator";
import { Task, Suite, Benchmark } from "@core/benchmark";

const DEBUG = false;

const PersonZodSchema = z.object({
  name: z.string({
    required_error: "Property 'name' is required",
    invalid_type_error: "Property 'name' should be a string",
  }),
  dob: z
    .date({
      required_error: "Property 'dob' is required",
      invalid_type_error: "Property 'dob' should be a date",
    })
    .refine((d) => d.getTime() < Date.now(), { message: "Property 'dob' cannot be a future date" }),
});

function validatePersonWithZod(input: unknown): void {
  const validator = new ZodValidator(PersonZodSchema);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.error("[ERROR] validate person with zod error");
    console.dir(result.value, { depth: Infinity });
  }
}

interface RefinementConfig {
  /** @default true */
  when?: (self: any) => boolean | boolean;
  validate: (self: any) => boolean;
}

function Refinement(config: RefinementConfig, options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "refinement",
      target: object.constructor,
      propertyName,
      constraints: [config.validate],
      options,
      validator: {
        validate(_value, args) {
          const active = typeof config.when === "function" ? config.when(object) : config.when;
          const shouldValidate = active ?? true;
          if (!shouldValidate) {
            return true;
          }
          return config.validate(args?.object ?? {});
        },
      },
    });
  };
}

class PersonSchema {
  @IsNotEmpty({ message: "Property 'name' is required" })
  @IsString({ message: "Property 'name' should be a string" })
  name: string;

  @IsNotEmpty({ message: "Property 'dob' is required" })
  @IsDate({ message: "Property 'dob' should be a date" })
  @Refinement(
    {
      when: (self) => self.dob instanceof Date,
      validate: (self) => self.dob?.getTime() < Date.now(),
    },
    { message: "Property 'dob' cannot be a future date" },
  )
  dob: Date;

  constructor(props: any) {
    this.name = props?.name;
    this.dob = props?.dob;
  }
}

function validatePersonWithClassValidator(input: unknown): void {
  const validator = new ClassValidator(PersonSchema);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.error("[ERROR] validate person with class validator error");
    console.dir(result.value, { depth: Infinity });
  }
}

const goodPersonInput = {
  name: "Test",
  dob: new Date("2012-04-28T12:15:30.229Z"),
};

const goodPersonSuite = new Suite("Successful validation of person object", { times: 10_000 })
  .addTask(
    new Task("Validation with zod").withInput(goodPersonInput).executes(validatePersonWithZod),
  )
  .addTask(
    new Task("Validation with class-validator")
      .withInput(goodPersonInput)
      .executes(validatePersonWithClassValidator),
  );

const badPersonInput = {
  name: new Date("2012-04-28T12:15:30.229Z"),
  dob: "test",
};

const badPersonSuite = new Suite("Failed validation of person object", { times: 10_000 })
  .addTask(
    new Task("Validation with zod").withInput(badPersonInput).executes(validatePersonWithZod),
  )
  .addTask(
    new Task("Validation with class-validator")
      .withInput(badPersonInput)
      .executes(validatePersonWithClassValidator),
  );

const AnimalZodSchema = z.union([
  z.object({
    kind: z.literal("cat", { required_error: "Property 'kind' is required" }),
    sound: z.literal("meow", {
      required_error: "Property 'sound' is required",
      message: "Property 'sound' should be 'meow' for cats",
    }),
  }),
  z.object({
    kind: z.literal("dog", { required_error: "Property 'kind' is required" }),
    sound: z.literal("woof", {
      required_error: "Property 'sound' is required",
      message: "Property 'sound' should be 'woof' for dogs",
    }),
  }),
]);

function validateAnimalWithZod(input: unknown) {
  const validator = new ZodValidator(AnimalZodSchema);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.error("[ERROR] validate animal with zod validator error");
    console.dir(result.value, { depth: Infinity });
  }
}

class Animal {
  @IsNotEmpty({ message: "Property 'kind' is required" })
  @IsString({ message: "Property 'kind' should be a string" })
  @Refinement({ validate: (self) => self.kind === "cat" || self.kind === "dog" })
  kind: string;

  @IsNotEmpty({ message: "Property 'sound' is required" })
  @IsString({ message: "Property 'sound' should be a string" })
  @Refinement(
    {
      when: (self) => self.kind === "cat",
      validate: (self) => self.sound === "meow",
    },
    { message: "Property 'sound' should be 'meow' for cats" },
  )
  @Refinement(
    {
      when: (self) => self.kind === "dog",
      validate: (self) => self.sound === "woof",
    },
    { message: "Property 'sound' should be 'woof' for dogs" },
  )
  sound: string;

  constructor(props: any) {
    this.kind = props?.kind;
    this.sound = props?.sound;
  }
}

function validateAnimalWithClassValidator(input: unknown) {
  const validator = new ClassValidator(Animal);
  const result = validator.validate(input);
  if (DEBUG && result.isErr()) {
    console.error("[ERROR] validate animal with class-validator  error");
    console.dir(result.value, { depth: Infinity });
  }
}

const goodAnimalInput = {
  kind: "cat",
  sound: "meow",
};

const goodAnimalSuite = new Suite("Successful validation of animal object", {
  times: 10_000,
})
  .addTask(
    new Task("Validate animal with zod validator")
      .withInput(goodAnimalInput)
      .executes(validateAnimalWithZod),
  )
  .addTask(
    new Task("Validate animal with class-validator")
      .withInput(goodAnimalInput)
      .executes(validateAnimalWithClassValidator),
  );

const badAnimalInput = {
  kind: "cat",
  sound: "woof",
};

const badAnimalSuite = new Suite("Failed validation of animal object", {
  times: 10_000,
})
  .addTask(
    new Task("Validate animal with zod validator")
      .withInput(badAnimalInput)
      .executes(validateAnimalWithZod),
  )
  .addTask(
    new Task("Validate animal with class-validator")
      .withInput(badAnimalInput)
      .executes(validateAnimalWithClassValidator),
  );

export const benchmark = new Benchmark("Comparison of zod and class validator")
  .addSuite(goodPersonSuite)
  .addSuite(badPersonSuite)
  .addSuite(goodAnimalSuite)
  .addSuite(badAnimalSuite);
