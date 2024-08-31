interface StoreManager<V = unknown> {
  set: (key: string, body: V) => Promise<void>
  get: (key: string) => Promise<V | undefined>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<void>
}

export function createLocalStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.localStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.localStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.localStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.localStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.localStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}

export function createSessionStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.sessionStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.sessionStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.sessionStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.sessionStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.sessionStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}

export function createMemoryStoreManager<T>(): StoreManager<T> {
  const store = new Map<string, unknown>()
  async function set(key: string, body: unknown) {
    store.set(key, body)
  }
  async function get(key: string) {
    return store.get(key) as T | undefined
  }
  async function deleteItem(key: string) {
    store.delete(key)
  }
  async function has(key: string) {
    return store.has(key)
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}
