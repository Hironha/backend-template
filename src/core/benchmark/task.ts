export class Task {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  withInput<U extends Record<string, any>>(input: U): TaskWithInput<U> {
    return new TaskWithInput(this.name, input);
  }

  executes(fn: () => void): TaskExec {
    return new TaskExec(this.name, fn, undefined as void);
  }
}

export class TaskWithInput<T extends Record<string, any>> {
  readonly name: string;
  private readonly input: T;

  constructor(name: string, input: T) {
    this.name = name;
    this.input = input;
  }

  executes(fn: (input: Readonly<T>) => void): TaskExec<T> {
    return new TaskExec(this.name, fn, this.input);
  }
}

export class TaskExec<T extends Record<string, any> | void = void> {
  readonly name: string;
  private readonly input: T;
  private readonly fn: (input: Readonly<T>) => void;

  constructor(name: string, fn: (input: Readonly<T>) => void, input: T) {
    this.name = name;
    this.fn = fn;
    this.input = input;
  }

  run(): void {
    this.fn(this.input);
  }
}
