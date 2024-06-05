// @ts-nocheck

import type { AnyObj } from "@edsolater/fnkit"
import type { NativeProps } from ".."

const divCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <div
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </div>
  ) : (
    <div
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </div>
  )

const spanCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <span
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </span>
  ) : (
    <span
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </span>
  )

const pCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <p
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </p>
  ) : (
    <p
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </p>
  )

const buttonCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <button
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </button>
  ) : (
    <button
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </button>
  )

const inputCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <input
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ) : (
    <input
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    />
  )

const textareaCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <textarea
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ) : (
    <textarea
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    />
  )

const selectCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <select
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </select>
  ) : (
    <select
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </select>
  )

const formCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <form
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </form>
  ) : (
    <form
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </form>
  )

const sectionCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <section
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </section>
  ) : (
    <section
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </section>
  )

const articleCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <article
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </article>
  ) : (
    <article
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </article>
  )

const headerCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <header
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </header>
  ) : (
    <header
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </header>
  )

const footerCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <footer
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </footer>
  ) : (
    <footer
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </footer>
  )

const mainCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <main
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </main>
  ) : (
    <main
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </main>
  )

const asideCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <aside
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </aside>
  ) : (
    <aside
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </aside>
  )

const labelCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <label
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </label>
  ) : (
    <label
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </label>
  )

const h1Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h1
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h1>
  ) : (
    <h1
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h1>
  )

const h2Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h2
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h2>
  ) : (
    <h2
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h2>
  )

const h3Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h3
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h3>
  ) : (
    <h3
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h3>
  )

const h4Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h4
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h4>
  ) : (
    <h4
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h4>
  )

const h5Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h5
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h5>
  ) : (
    <h5
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h5>
  )

const h6Creator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <h6
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </h6>
  ) : (
    <h6
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </h6>
  )

const navCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <nav
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </nav>
  ) : (
    <nav
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </nav>
  )

const ulCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <ul
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </ul>
  ) : (
    <ul
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </ul>
  )

const liCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <li
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </li>
  ) : (
    <li
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </li>
  )

const imgCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? ( // when use additionalProps, solidjs will subscribe any change of props. it's not pure
    <img
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ) : (
    <img
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    />
  )

const svgCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <svg
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref as any}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </svg>
  ) : (
    <svg
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref as any}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </svg>
  )

const aCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <a
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </a>
  ) : (
    <a
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </a>
  )

const iframeCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <iframe
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ) : (
    <iframe
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    />
  )

const summaryCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <summary
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </summary>
  ) : (
    <summary
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </summary>
  )

const datailsCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <details
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </details>
  ) : (
    <details
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </details>
  )

const dialogCreator = (props: NativeProps, additionalProps: AnyObj | undefined) =>
  "htmlProps" in props || additionalProps ? (
    <dialog
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </dialog>
  ) : (
    <dialog
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </dialog>
  )

export const domMap = {
  div: divCreator,
  span: spanCreator,
  p: pCreator,
  button: buttonCreator,
  input: inputCreator,
  textarea: textareaCreator,
  select: selectCreator,
  form: formCreator,
  section: sectionCreator,
  article: articleCreator,
  header: headerCreator,
  footer: footerCreator,
  main: mainCreator,
  aside: asideCreator,
  label: labelCreator,
  h1: h1Creator,
  h2: h2Creator,
  h3: h3Creator,
  h4: h4Creator,
  h5: h5Creator,
  h6: h6Creator,
  nav: navCreator,
  ul: ulCreator,
  li: liCreator,
  img: imgCreator,
  svg: svgCreator,
  a: aCreator,
  iframe: iframeCreator,
  summary: summaryCreator,
  datails: datailsCreator,
  dialog: dialogCreator,
}
