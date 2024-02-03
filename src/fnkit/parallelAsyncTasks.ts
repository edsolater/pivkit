import { DeMayFn, MayFn, MayPromise } from '@edsolater/fnkit'

export function parallelAsyncTasks<Task1 extends MayFn<MayPromise<any>>>(
  tasks: [Task1]
): Promise<[Awaited<DeMayFn<Task1>>]>
export function parallelAsyncTasks<Task1 extends MayFn<MayPromise<any>>, Task2 extends MayFn<MayPromise<any>>>(
  tasks: [Task1, Task2]
): Promise<[Awaited<DeMayFn<Task1>>, Awaited<DeMayFn<Task2>>]>
export function parallelAsyncTasks<
  Task1 extends MayFn<MayPromise<any>>,
  Task2 extends MayFn<MayPromise<any>>,
  Task3 extends MayFn<MayPromise<any>>,
>(tasks: [Task1, Task2, Task3]): Promise<[Awaited<DeMayFn<Task1>>, Awaited<DeMayFn<Task2>>, Awaited<DeMayFn<Task3>>]>
export function parallelAsyncTasks<
  Task1 extends MayFn<MayPromise<any>>,
  Task2 extends MayFn<MayPromise<any>>,
  Task3 extends MayFn<MayPromise<any>>,
  Task4 extends MayFn<MayPromise<any>>,
>(
  tasks: [Task1, Task2, Task3, Task4]
): Promise<[Awaited<DeMayFn<Task1>>, Awaited<DeMayFn<Task2>>, Awaited<DeMayFn<Task3>>, Awaited<DeMayFn<Task4>>]>
export async function parallelAsyncTasks<Tasks extends MayFn<Promise<any>>[]>(tasks: Tasks): Promise<any[]> {
  const settledResults = await Promise.allSettled(tasks)
  const results = settledResults.map((r) => (r.status === 'fulfilled' ? r.value : undefined))
  return results
}
