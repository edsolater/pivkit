# props

## Piv's(global props)

1. _STATIC_ means that the prop is not reactive and will changing it will not trigger a rerender\
2. all are optional

- `if?: MayFn<BooleanLike>>` --- _STATIC_. if is settled and is false , it self and it's children will not render
- `ifSelfShown?: MayFn<BooleanLike>>` --- _STATIC_. if is settled and is false , only it's children will render
- `debugLog?: (keyof PivProps)[]` --- only use this for debug mode. it will log all you need
- `domRef?: MayArray<CallbackRef<any> | null | undefined>` --- accept domSetter(return from createDomRef) to access the dom
- `class?: MayArray<ClassName<Controller>>` --- htmlElement's class
- `id?: string` --- id for `useComponentByID`. So others can access component's controller without set `props:controllerRef` to component, this have to have access to certain component instance

# special
- render - `render_SUBCOMPONENT` or `render_item`
- TODO: `layout`