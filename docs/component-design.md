# PROPS

## `piv:icss`

快速更改细节样式（使用goober）

## `piv:class`

HTML class 名称（命名这个节点）

## `uikit:varint` （特殊）（废弃， 用piv:icss就够了）

添加样式模组

TODO：接收：`[string(color), string(size), function(customize)]`

## `uikit:plugin` （特殊）

添加逻辑模块

接收：`function(customize)[]`

## `uikit:shadowProps` （特殊）

动态添加props（一般用于继承自父组件的props）

接收：`function(customize)[]`

**注释：**

- （默认）props可以接收`T | (() => T)` 类型
- （特殊）此props的function传参有特殊含义， 并不会像默认props一般自动解function props

# plugins 查询
- withTooltip（任何组件）