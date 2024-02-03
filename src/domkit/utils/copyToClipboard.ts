export async function copyToClipboard(content: string) {
  if (globalThis?.navigator?.clipboard) {
    // eslint-disable-next-line no-console
    await globalThis.navigator.clipboard.writeText(content)
    return console.info('Text copied')
  } else {
    throw new Error('current context has no clipboard')
  }
}
