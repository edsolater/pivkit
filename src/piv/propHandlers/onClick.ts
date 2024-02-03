import { AnyFn } from '@edsolater/fnkit'
import { objectMerge } from '../../fnkit'
import { ValidController } from '../typeTools'

export function parseOnClick(onClick: AnyFn, controller: ValidController) {
  return (ev: any) => onClick?.(objectMerge(controller, { ev, el: ev.currentTarget }))
}
