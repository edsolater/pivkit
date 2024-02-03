import { createMemo } from 'solid-js'
import { Fragnment, PivChild } from '../piv'
import { Accessify } from '../utils'
import { shrinkFn } from '@edsolater/fnkit'

export function Loading(props: {
  isLoading?: Accessify<boolean | undefined>
  fallback?: PivChild
  children?: PivChild
}) {
  const isLoading = createMemo(() => Boolean(shrinkFn(props.isLoading)))
  return <Fragnment>{isLoading() ? props.fallback : props.children}</Fragnment>
}
