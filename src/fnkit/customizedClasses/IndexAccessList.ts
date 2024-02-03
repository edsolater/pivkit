/**
 * faster find with cache
 * it's inner use JS Map
 */

import { assert } from '@edsolater/fnkit'
// import { createEncodedObject } from '../../../app/raydium-s2/utils/structure-clone/createEncodedObject'

export class IndexAccessList<V extends object = object, BK extends keyof V = any> {
  // get faster access
  #keyIndexAccessMap: {
    [K in keyof V]?: Map<any, V[BK]>
  } = {}
  #basicKeyIndexAccessMap: BK
  #innerMap: Map<V[BK], V>

  static fromJSMap<V extends object, BK extends keyof V>(
    basicKeyPropertyName: BK,
    jsMap: Map<V[BK], V>
  ): IndexAccessList<V, BK> {
    const indexAccessMap = new IndexAccessList<V, BK>([], basicKeyPropertyName)
    indexAccessMap.#innerMap = jsMap
    return indexAccessMap
  }

  constructor(iterable: Iterable<V>, basicKeyPropertyName: BK) {
    const source = [...iterable]
    // @ts-ignore
    this.#innerMap = new Map(
      iterable && basicKeyPropertyName ? source.map((i) => [i[basicKeyPropertyName], i]) : undefined
    )
    if (iterable) {
      const first = source[0]
      assert(first && basicKeyPropertyName in first, `key ${String(basicKeyPropertyName)} not found in source`)
    }
    this.#basicKeyIndexAccessMap = basicKeyPropertyName
  }

  query<K extends keyof V>(key: V[K], keyPropertyName: K) {
    if (!keyPropertyName) return this.get(key)
    // @ts-ignore
    if (keyPropertyName !== this.#basicKeyIndexAccessMap) {
      const targetIndexAccessMap =
        this.#keyIndexAccessMap[keyPropertyName] ||
        (() => {
          const newAccessMap = new Map<any, V[BK]>(
            [...this.#innerMap.values()].map((v) => [v[keyPropertyName], v[this.#basicKeyIndexAccessMap]])
          )
          this.#keyIndexAccessMap[keyPropertyName] = newAccessMap
          return newAccessMap
        })()
      const targetBasicKey = targetIndexAccessMap.get(key)
      return targetBasicKey && this.#innerMap.get(targetBasicKey)
    }
  }

  get<K extends keyof V>(key: V[K]) {
    return this.#innerMap.get(key as unknown as V[BK])
  }

  add(value: V) {
    const sourceBasicKey = value[this.#basicKeyIndexAccessMap]
    this.#innerMap.set(sourceBasicKey, value)
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      this.#keyIndexAccessMap[indexAccessKey]?.set(value[indexAccessKey], sourceBasicKey)
    }
  }

  delete(key: V[BK]) {
    const value = this.#innerMap.get(key)
    if (!value) return false
    this.#innerMap.delete(key)
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].delete(value[indexAccessKey])
    }
    return true
  }

  has(key: V[BK]) {
    return this.#innerMap.has(key)
  }

  get size() {
    return this.#innerMap.size
  }

  clear() {
    this.#innerMap.clear()
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].clear()
    }
  }

  toMap() {
    return this.#innerMap
  }

  toRecord() {
    return Object.fromEntries(this.#innerMap.entries())
  }

  toSet() {
    return new Set(this.#innerMap.values())
  }

  toArray() {
    return [...this.#innerMap.values()]
  }

  [Symbol.iterator]() {
    return this.#innerMap.values()
  }

  // _structureCloneEncode(handleInnerValue: (innerValue: unknown) => any = (i) => i) {
  //   const items = this.toArray()
  //   return createEncodedObject('IndexAccessList', {
  //     items: handleInnerValue(items),
  //     basicKey: this.#basicKeyIndexAccessMap,
  //   } satisfies IndexAccessListStructureCloneType)
  // }

  static _structureCloneDecode(transformed: IndexAccessListStructureCloneType) {
    return new IndexAccessList(transformed.items, transformed.basicKey)
  }
}

export interface IndexAccessListStructureCloneType {
  items: any[]
  basicKey: keyof any
}
