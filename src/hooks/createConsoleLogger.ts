import { createEffect } from "solid-js"

/**
 * for debug
 *
 * a shortcut for Debug to create a console logger
 */
export function createConsoleLogger(variableName: string, variable: () => any): void {
  createEffect(() => {
    console.log(`${variableName}: `, variable())
  })
}
