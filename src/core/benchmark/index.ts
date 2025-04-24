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
    console.debug(`Benchmark "${this.name}"\n`);

    for (const suite of this.suites) {
      const meta = suite.run();
      console.debug(`> Suite "${meta.name}"`);
      console.debug(`  Times executed: ${meta.times}\n`);
      if (meta.description) {
        console.debug(`Description: ${meta.description}`);
      }

      for (const task of meta.tasks) {
        const averageTime = task.totalMicrosec / task.runs.length;
        console.debug(`  > Task "${task.name}"`);
        console.debug(`    Total time: ${task.totalMicrosec.toFixed(2)}μs`);
        console.debug(`    Average time: ${averageTime.toFixed(2)}μs\n`);
      }
    }
  }
}
