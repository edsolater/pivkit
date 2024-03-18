import { unifyItem } from "@edsolater/fnkit"

type Obj = object | undefined

export function getPropsKeys<T extends Obj, U extends Obj>(objA: T, objB: U): (keyof T | keyof U)[]
export function getPropsKeys<T extends Obj, U extends Obj, V extends Obj>(
  objA: T,
  objB: U,
  objC: V,
): (keyof T | keyof U | keyof V)[]
export function getPropsKeys<T extends Obj, U extends Obj, V extends Obj, W extends Obj>(
  objA: T,
  objB: U,
  objC: V,
  objD: W,
): (keyof T | keyof U | keyof V | keyof W)[]
export function getPropsKeys<T extends Obj, U extends Obj, V extends Obj, W extends Obj, X extends Obj>(
  objA: T,
  objB: U,
  objC: V,
  objD: W,
  objE: X,
): (keyof T | keyof U | keyof V | keyof W | keyof X)[]
export function getPropsKeys<T extends object | undefined>(...objs: T[]): (keyof T)[]
export function getPropsKeys<T extends object | undefined>(...objs: T[]): (keyof T)[] {
  return unifyItem(objs.flatMap((obj) => (obj ? Reflect.ownKeys(obj) : []))) as (keyof T)[]
}
