import { children } from "solid-js"
import { PivChild, parsePivChildren } from "."

/**
 * let outside is JSXElement, inner is PivChild
 * TODO: props passed to it will set on it's children
 */
export function Fragnment(props: { children?: PivChild<any> }) {
  return <>{children(() => parsePivChildren(props.children))}</>
}
