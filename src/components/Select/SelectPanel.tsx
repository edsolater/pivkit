import { isString, type AnyObj } from "@edsolater/fnkit"
import { createEffect, createMemo, createSignal } from "solid-js"
import type { ItemEventUtils } from "."
import { useKitProps, type KitProps } from "../../createKit"
import { createDomRef, useShortcutsRegister } from "../../hooks"
import type { PivChild } from "../../piv"
import { icssCardPanel, icssClickable } from "../../styles"
import { Panel } from "../Boxes"
import { ItemBox } from "../ItemBox"
import { Loop } from "../Loop"
import { Text } from "../Text"
import { useSelectItems } from "./useSelectItems"

type SelectableItemObj<V extends string = string> = {
  value: V
  label?: V
  /* when set, it will have muted style */
  disabled?: boolean
}

type SelectableItem = string | SelectableItemObj

type GetSelectableItemValue<T extends SelectableItem> = T extends string
  ? string
  : T extends AnyObj
    ? T["value"]
    : never

export type SelectPanelProps<T extends SelectableItem> = {
  /** also in controller */
  name?: string

  variant?: "no-style"
  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  candidates?: Iterable<T>
  value?: GetSelectableItemValue<T>
  defaultValue?: GetSelectableItemValue<T>

  /** @default true */
  canItemClickClose?: boolean

  onSelect?(utils: Omit<ItemEventUtils<SelectableItemObj>, "isSelected">): void

  onClose?: () => void

  disabled?: boolean

  /**
   * when nothing has selected
   */
  placeholder?: PivChild

  renderItem?(utils: ItemEventUtils<SelectableItemObj>): PivChild
}
type SelectPanelController = {}
// TODO: imply it !!

function toSelectableItemObj<T extends SelectableItem>(item: T): T extends string ? SelectableItemObj<T> : T {
  // @ts-expect-error froce type
  return isString(item) ? { value: item, label: item } : item
}
/** if user haven't provide `props:renderItem`, then will use this component to render Select item */
function DefaultSelectPanelItem(props: { item: SelectableItemObj }) {
  const isMuted = createMemo(() => props.item.disabled)
  return <Text icss={{ opacity: isMuted() ? 0.5 : undefined }}>{props.item.label ?? props.item.value}</Text>
}

/**
 * if need popover, use {@link withPopupWidget} plugin
 *
 * @example
 * plugin={withPopupWidget.config({
 *   shouldFocusChildWhenOpen: true,
 *   canBackdropClose: true,
 *   popElement: ({ closePopup }) => (
 *     <SelectPanel
 *       name="edit-new-widget-selector"
 *       candidates={[{ value: "tags", disabled: true }, "comment", "title"]}
 *       onClose={closePopup}
 *       onSelect={({ itemValue }) => {
 *         setTimeoutWithSecondes(() => {
 *           closePopup()
 *         }, 0.2)
 *       }}
 *     />
 *   ),
 * })}
 */
export function SelectPanel<T extends SelectableItem>(kitProps: KitProps<SelectPanelProps<T>>) {
  const { props, rawProps, shadowProps, loadController } = useKitProps(kitProps, { name: "SelectPanel" })
  const candidates = createMemo(() => (props.candidates ? Array.from(props.candidates).map(toSelectableItemObj) : []))
  const defaultItem = createMemo(() =>
    props.defaultValue ? candidates().find((c) => c.value === props.defaultValue) : undefined,
  )
  const { dom, setDom } = createDomRef()

  // controller
  const controller = {} satisfies SelectPanelController
  loadController(controller)

  // items manager
  const {
    selectedItem,
    items,
    selectFromFocusedItem,
    selectedItemIndex,
    getItemValue,
    setItem,
    focusItem,
    focusPrevItem,
    focusNextItem,
  } = useSelectItems<SelectableItemObj>({
    items: candidates,
    defaultValue: defaultItem,
    getItemValue: (i) => i.value,
    onChange: props.onSelect,
  })

  const defaultRenderItem = ({ item }: ItemEventUtils<SelectableItemObj<string>>) => (
    <DefaultSelectPanelItem item={item()} />
  )

  // compute render functions
  const renderItem = rawProps.renderItem ?? defaultRenderItem

  // keyboard shortcut
  useShortcutsRegister(dom, {
    close: {
      action: () => props.onClose?.(),
      shortcut: "Escape",
    },
    "select confirm": {
      action: selectFromFocusedItem,
      shortcut: ["Enter", "Space"],
    },
    "focus prev item": {
      action: focusPrevItem,
      shortcut: ["ArrowUp", "w"],
    },
    "focus next item": {
      action: focusNextItem,
      shortcut: ["ArrowDown", "s"],
    },
  })

  // handle item click
  const onItemClick = (_clickController, i: SelectableItemObj) => {
    setItem(i)
    if (props.canItemClickClose) {
      props.onClose?.()
    }
  }
  return (
    <Panel
      domRef={[setDom]}
      shadowProps={shadowProps}
      icss={props.variant === "no-style" ? undefined : [icssCardPanel, { paddingBlock: "8px", borderRadius: "8px" }]}
    >
      <Loop items={items}>
        {(item, idx) => {
          const isSelected = () => item === selectedItem()
          const isFocused = () => item === focusItem()
          const itemValue = () => getItemValue(item)
          return (
            <ItemBox
              onClick={(c) => onItemClick(c, item)}
              icss={[
                icssClickable,
                {
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: isSelected() ? "#fff4" : isFocused() ? "#fff2" : "transparent",
                },
              ]}
              htmlProps={{ tabIndex: 0 }} // make every child focusable
            >
              {renderItem({
                item: () => item,
                index: idx,
                itemValue: itemValue,
                isSelected,
              })}
            </ItemBox>
          )
        }}
      </Loop>
    </Panel>
  )
}

// TODO: should run only when user is required
function useElementStateIsFocused() {
  const { dom, setDom } = createDomRef()
  const [isFocus, setIsFocus] = createSignal(false)
  createEffect(() => {
    const element = dom()
    if (element) {
      element.addEventListener("focus", () => {
        setIsFocus(true)
      })
      element.addEventListener("blur", () => {
        setIsFocus(false)
      })
    }
  })
  return { isFocus, setDom }
}
