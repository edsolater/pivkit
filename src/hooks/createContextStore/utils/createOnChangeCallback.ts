import { OnChangeCallback } from "../type"

export function createOnChangeCallback<T extends Record<string, any>, K extends keyof T>(
  propertyName: K,
  cb: OnChangeCallback<T, K>,
) {
  return { propertyName, cb }
}

// export const createOnChangeCallback2 = <T extends Record<string, any>, K extends keyof T>(propertyName:keyof T)=>(cb)=>({ propertyName, cb }
