import { isNumber, notNullish } from "@edsolater/fnkit"

/**
 * **CSS Utility Function**
 * @example
 * css_clamp('10vw', {min: 50, max: 200}) // => 'clamp(50px, 100vw, 200px)'
 * css_clamp('10vw', {min: 50}) // => 'min(50px, 100vw)'
 * css_clamp('10vw', {max: 200}) // => 'max(100vw, 200px)'
 * css_clamp('10vw', {}) // => '10vw'
 * @returns css clamp() or min() or max() or self
 */
export function cssClamp(v: string | number, boundary?: { min?: string | number; max?: string | number }) {
  if (notNullish(boundary?.min) && notNullish(boundary?.max))
    return `clamp(${toPxIfNumber(boundary!.min)}, ${toPxIfNumber(v)}, ${toPxIfNumber(boundary!.max)})`
  if (notNullish(boundary?.min)) return `min(${toPxIfNumber(boundary!.min)}, ${toPxIfNumber(v)})`
  if (notNullish(boundary?.max)) return `max(${toPxIfNumber(v)}, ${toPxIfNumber(boundary!.max)})`
  return toPxIfNumber(v)
}

function toPxIfNumber(n: number | string) {
  return isNumber(n) ? `${n}px` : n
}
