/**
 * contact multiple IterableIterator into one IterableIterator
 */
export function contactIterableIterators<T, U>(
  ii1: IterableIterator<T>,
  ii2: IterableIterator<U>,
): IterableIterator<T | U>
export function contactIterableIterators<T, U, V>(
  ii1: IterableIterator<T>,
  ii2: IterableIterator<U>,
  ii3: IterableIterator<V>,
): IterableIterator<T | U | V>
export function contactIterableIterators<T, U, V, W>(
  ii1: IterableIterator<T>,
  ii2: IterableIterator<U>,
  ii3: IterableIterator<V>,
  ii4: IterableIterator<W>,
): IterableIterator<T | U | V | W>
export function contactIterableIterators<T, U, V, W, X>(
  ii1: IterableIterator<T>,
  ii2: IterableIterator<U>,
  ii3: IterableIterator<V>,
  ii4: IterableIterator<W>,
  ii5: IterableIterator<X>,
): IterableIterator<T | U | V | W | X>
export function contactIterableIterators(...iis: IterableIterator<any>[]): IterableIterator<any> {
  return (function* () {
    for (const ii of iis) {
      for (const item of ii) {
        yield item
      }
    }
  })()
}
