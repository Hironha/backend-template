import { hrtime } from "node:process";
import { type TaskExec } from "./task";

export interface SuiteOptions {
  times: number;
  description?: string;
}

export interface TaskRunMeta {
  microsec: number;
}

export interface TaskMeta {
  name: string;
  totalMicrosec: number;
  runs: TaskRunMeta[];
}

export interface SuiteMeta {
  name: string;
  description?: string;
  times: number;
  tasks: TaskMeta[];
}

export class Suite {
  readonly name: string;
  readonly description?: string;
  private readonly times: number;
  private tasks: Array<TaskExec<any>>;

  constructor(name: string, options?: SuiteOptions) {
    this.name = name;
    this.times = options?.times ?? 1000;
    this.description = options?.description;
    this.tasks = [];
  }

  addTask(task: TaskExec<any>): Suite {
    this.tasks.push(task);
    return this;
  }

  run(): SuiteMeta {
    const tasksMeta: TaskMeta[] = [];

    for (const task of this.tasks) {
      const begin = hrtime.bigint();

      const runs: TaskRunMeta[] = [];
      for (let i = 0; i < this.times; i++) {
        const b = hrtime.bigint();
        task.run();
        const e = hrtime.bigint();
        runs.push({ microsec: Number(e - b) / 1e3 });
      }

      const end = hrtime.bigint();
      tasksMeta.push({
        name: task.name,
        runs,
        totalMicrosec: Number(end - begin) / 1e3,
      });
    }

    return {
      name: this.name,
      description: this.description,
      times: this.times,
      tasks: tasksMeta,
    };
  }
}
