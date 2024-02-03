import { SwitchController, SwitchProps } from '..'
import { createPlugin } from '../../../piv'
import { PivChild } from '../../../piv/typeTools'

/**
 * **Plugin** for Switch
 * can render switch Thumb
 */
export const renderSwitchThumb = createPlugin<{ renderThumbContent?: PivChild<SwitchController> }, any, SwitchProps>(
  ({ renderThumbContent }) =>
    () => ({
      'anatomy:Thumb': {
        'render:lastChild': renderThumbContent,
      },
    })
)
