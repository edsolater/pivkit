import { JSX } from 'solid-js/jsx-runtime'
import { ValidProps } from '../piv'

/**
 * all specific <Kit> will have same additional props
 * @param kitName kit name
 * @returns global costomized props
 */
export function useGlobalKitTheme<P extends ValidProps>(kitName: string): Partial<P> {
  return {} // <-- TODO
}

export function GrobalKitThemeProvider(props: { children: JSX.Element }) {
  return props.children
}
