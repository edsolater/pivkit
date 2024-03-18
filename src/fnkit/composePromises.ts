export async function composePromises<T1 extends Promise<unknown[] | unknown>>(p1: T1): Promise<Awaited<T1>>
export async function composePromises<T1 extends Promise<unknown[] | unknown>, T2 extends Promise<unknown[] | unknown>>(
  p1: T1,
  p2: T2,
): Promise<ConcateArrayToSingle<Awaited<T1>, Awaited<T2>>>
export async function composePromises<
  T1 extends Promise<unknown[] | unknown>,
  T2 extends Promise<unknown[] | unknown>,
  T3 extends Promise<unknown[] | unknown>,
>(p1: T1, p2: T2, p3: T3): Promise<ConcateArrayToSingle<ConcateArrayToSingle<Awaited<T1>, Awaited<T2>>, Awaited<T3>>>
export async function composePromises<
  T1 extends Promise<unknown[] | unknown>,
  T2 extends Promise<unknown[] | unknown>,
  T3 extends Promise<unknown[] | unknown>,
  T4 extends Promise<unknown[] | unknown>,
>(
  p1: T1,
  p2: T2,
  p3: T3,
  p4: T4,
): Promise<
  ConcateArrayToSingle<ConcateArrayToSingle<ConcateArrayToSingle<Awaited<T1>, Awaited<T2>>, Awaited<T3>>, Awaited<T4>>
>
export async function composePromises<T extends Promise<any>[]>(...args: T) {
  const results = await Promise.all(args)
  return results.flat()
}

export type ConcateArrayToSingle<T1 extends unknown[] | unknown, T2 extends unknown[] | unknown> = T1 extends unknown[]
  ? T2 extends unknown[]
    ? [...T1, ...T2]
    : [...T1, T2]
  : T2 extends unknown[]
    ? [T1, ...T2]
    : [T1, T2]
