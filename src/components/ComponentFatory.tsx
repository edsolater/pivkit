import { isFunction, isObject } from '@edsolater/fnkit'
import { JSX } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { Box } from './Boxes'

/** a special component for creating element tree by pure js data
 *
 * @todo: how to turn pure object tree to component tree ?
 */
export function RenderFactory(props: {
  data: object
  /**
   * JSXElement ----> render a JSXElement \
   * object or array ----> pass through the factory function again \
   * primitive value ----> render in original jsx rule
   */
  widgetCreateRule: (
    value: any,
    key: string | number | symbol | undefined
  ) => JSX.Element | any /* value */ | undefined | void
}) {
  const store = props.data
  const unwrapedStore = unwrap(store)
  function parseData(
    mapFn: (value: any, key: string | number | symbol | undefined) => JSX.Element | any /* value */ | undefined | void,
    currentPath: (string | number | symbol)[] = []
  ) {
    const currentTarget = getByPath(unwrapedStore, currentPath)
    const currentKey = currentPath.at(-1)
    const mayComponent = mapFn(currentTarget, currentKey)
    if (isFunction(mayComponent)) {
      const value = () => getByPath(store, currentPath)
      return mayComponent(value)
    } else if (isObject(mayComponent)) {
      return <Box>{Object.entries(currentTarget).map(([key, value]) => parseData(mapFn, currentPath.concat(key)))}</Box>
    } else {
      return mayComponent
    }
  }

  return <>{parseData(props.widgetCreateRule)}</>
}

function getByPath(obj: object, path: (string | number | symbol)[]) {
  let currentObj = obj
  for (const key of path) {
    if (!isObject(currentObj)) break
    currentObj = currentObj[key]
  }
  return currentObj
}

function isJSXElement(v: any): v is JSX.Element {
  return isObject(v) && 'type' in v && v.type !== undefined
}
