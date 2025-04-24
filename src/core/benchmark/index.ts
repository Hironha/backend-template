export { Suite } from "./suite";
export { Task } from "./task";

import { type Suite } from "./suite";

export class Benchmark {
  readonly name: string;
  private suites: Array<Suite>;

  constructor(name: string) {
    this.name = name;
    this.suites = [];
  }

  addSuite(suite: Suite): Benchmark {
    this.suites.push(suite);
    return this;
  }

  run(): void {
    console.debug(`Benchmark "${this.name}"`);

    for (const suite of this.suites) {
      const meta = suite.run();
      console.debug(`Suite "${meta.name}"`);
      console.debug(`Times executed: ${meta.times}`);
      if (meta.description) {
        console.debug(`Description: ${meta.description}`);
      }

      console.debug(`  Tasks:`);
      for (const task of meta.tasks) {
        console.debug(`    Name: ${task.name}`);
        console.debug(`    Total μs: ${task.totalMicrosec}`);
        console.debug(`    Average μs: ${task.totalMicrosec / task.runs.length}\n`);
      }
    }
  }
}
