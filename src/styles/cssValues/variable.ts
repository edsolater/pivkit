/**
 * **CSS Utility Function**
 * @example
 * cssVar('--accent-color') // => 'var(--accent-color)'
 * cssVar('--accent-color', '#fff') // => 'var(--accent-color, #fff)'
 * cssVar('--accent-color', '--color', '#fff') // => 'var(--accent-color, var(--color, #fff))'
 * @returns css var
 */

export function cssVar(...values: string[]) {
  if (values.length === 0) return ''
  if (values.length === 1) return values[0]!.startsWith('--') ? `var(${values[0]})` : values[0]
  return `var(${values[0]}, ${cssVar(...values.slice(1))})`
}
