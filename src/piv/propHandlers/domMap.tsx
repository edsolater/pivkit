import { AnyObj } from "@edsolater/fnkit"
import { NativeProps } from ".."

export const domMap = {
  div: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  span: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  p: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  button: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  input: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <input
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  textarea: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <textarea
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  select: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  form: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <form
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      // @ts-ignore
      onSubmit={props.onSubmit}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </form>
  ),
  section: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  article: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  header: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  footer: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  main: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  aside: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <aside
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </aside>
  ),
  label: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h1: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h2: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h3: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h4: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h5: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  h6: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  nav: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  ul: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  li: (props: NativeProps, additionalProps: AnyObj | undefined) => (
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
  ),
  img: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <img
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  svg: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <svg
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      // @ts-ignore
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  a: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <a
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </a>
  ),
  iframe: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <iframe
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  summary: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <summary
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </summary>
  ),
  datails: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <details
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </details>
  ),
  dialog: (props: NativeProps, additionalProps: AnyObj | undefined) => (
    <dialog
      // solidjs prefer static props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </dialog>
  ),
}
