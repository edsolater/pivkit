export function recordToMap<T>(record: Record<string, T>): Map<string, T> {
  return new Map(Object.entries(record))
}

export function mapToRecord(map: Map<string, any>): Record<string, any> {
  return Object.fromEntries(map)
}
