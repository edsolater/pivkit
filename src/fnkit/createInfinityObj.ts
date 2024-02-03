import { MayFn, isObject, isObjectLike, shrinkFn } from '@edsolater/fnkit'
import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
export type InfinityObjNode<V extends UserAttachedValue = any> = {
  (): V
  [currentPathFromRoot]: (keyof any)[]
  [loadSelf]: (value: MayFn<V, [oldValue: V]>) => void
  [infinityNode]: true
}
const currentPathFromRoot = Symbol('currentPathFromRoot')
const infinityNode = Symbol('isInfinityNode')
const loadSelf = Symbol('load')

/**
 * core part of createFakeTree, it's a common utils, no need to use it directly
 * can get more through this node
 */
export function createTreeableInfinityNode({
  currentKeyPath = [],
  attachedValueMap = new Map<keyof any, UserAttachedValue>(),
  getDefaultNodeValue,
  nodeValue,
}: {
  currentKeyPath?: (keyof any)[]
  attachedValueMap?: Map<string | number | symbol, any>
  nodeValue?: any
  getDefaultNodeValue?: () => any
} = {}) {
  const pathCollector = new Proxy(createInfinityNode(currentKeyPath, nodeValue ?? getDefaultNodeValue?.()), {
    get(target, key) {
      if (key in target) return Reflect.get(target, key)
      const paths = target[currentPathFromRoot].concat(key)
      const flatedKey = parseShallowKeyFromKeyArray(paths)
      if (attachedValueMap.has(flatedKey)) return attachedValueMap.get(flatedKey)
      else {
        const newInfiniteNode = createTreeableInfinityNode({
          currentKeyPath: paths,
          attachedValueMap,
          nodeValue: nodeValue?.[key],
          getDefaultNodeValue,
        })
        attachedValueMap.set(flatedKey, newInfiniteNode)
        return newInfiniteNode
      }
    },
  })
  return pathCollector
}

/**
 * can't get more through this node
 */
function createInfinityNode<T>(paths: (keyof any)[] = [], value?: T): InfinityObjNode {
  let nodeValue = value
  return Object.assign(() => nodeValue, {
    [currentPathFromRoot]: paths,
    [infinityNode]: true,
    [loadSelf]: (value: MayFn<T, [oldValue: T | undefined]>) => {
      const newValue = shrinkFn(value, [nodeValue])
      nodeValue = newValue
    },
  }) as InfinityObjNode
}

export function isInfinityNode(value: any): value is InfinityObjNode {
  return isObjectLike(value) && currentPathFromRoot in value
}

export function loadInfinityObjNode<T>(node: InfinityObjNode<T>, value: MayFn<T, [oldValue: T | undefined]>) {
  node[loadSelf](value)
}
