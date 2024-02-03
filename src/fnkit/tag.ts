/** tag is symbol to judge whether is taged */
type Tag = symbol
function attachTag<T extends object>(obj: T, label: symbol, value: any = true) {
  Reflect.set(obj, label, value)
  return obj
}
function hasTag(obj: object, label: symbol) {
  return Reflect.has(obj, label)
}
