import { type Benchmark } from "@core/benchmark";
import { benchmark as validatorBenchmark } from "./validator.bench";

const benchmarks = new Set<Benchmark>();
benchmarks.add(validatorBenchmark);

for (const benchmark of benchmarks) {
  benchmark.run();
}
