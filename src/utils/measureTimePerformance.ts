import { AnyFn } from "@edsolater/fnkit"

export function measureTimePerformance() {
  const allMeasuredTime = new Map<string, { t: number }>()
  function run(name: string, code: AnyFn) {
    const startTime = performance.now()
    const result = code()
    const endTime = performance.now()
    allMeasuredTime.set(name, { t: (allMeasuredTime.get(name)?.t ?? 0) + (endTime - startTime) })
    console.log(name, allMeasuredTime.get(name)?.t)
    return result
  }
  return { run }
}
