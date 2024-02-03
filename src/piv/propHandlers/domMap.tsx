import { AnyObj } from '@edsolater/fnkit'
import { Dynamic } from 'solid-js/web'
import { NativeProps } from '..'

export const domMap = (props: NativeProps, additionalProps: AnyObj | undefined) => ({
  div: () => (
    <div
      // solidjs prefer solid props for variable reactive
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

  span: () => (
    <span
      // solidjs prefer solid props for variable reactive
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
  p: () => (
    <p
      // solidjs prefer solid props for variable reactive
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
  button: () => (
    <button
      // solidjs prefer solid props for variable reactive
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
  input: () => (
    <input
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  textarea: () => (
    <textarea
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  select: () => (
    <select
      // solidjs prefer solid props for variable reactive
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
  form: () => (
    <form
      // solidjs prefer solid props for variable reactive
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
  section: () => (
    <section
      // solidjs prefer solid props for variable reactive
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
  article: () => (
    <article
      // solidjs prefer solid props for variable reactive
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
  header: () => (
    <header
      // solidjs prefer solid props for variable reactive
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
  footer: () => (
    <footer
      // solidjs prefer solid props for variable reactive
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
  main: () => (
    <main
      // solidjs prefer solid props for variable reactive
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
  aside: () => (
    <aside
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </aside>
  ),
  label: () => (
    <label
      // solidjs prefer solid props for variable reactive
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
  h1: () => (
    <h1
      // solidjs prefer solid props for variable reactive
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
  h2: () => (
    <h2
      // solidjs prefer solid props for variable reactive
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
  h3: () => (
    <h3
      // solidjs prefer solid props for variable reactive
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
  h4: () => (
    <h4
      // solidjs prefer solid props for variable reactive
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
  h5: () => (
    <h5
      // solidjs prefer solid props for variable reactive
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
  h6: () => (
    <h6
      // solidjs prefer solid props for variable reactive
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
  nav: () => (
    <nav
      // solidjs prefer solid props for variable reactive
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
  ul: () => (
    <ul
      // solidjs prefer solid props for variable reactive
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
  li: () => (
    <li
      // solidjs prefer solid props for variable reactive
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
  img: () => (
    <img
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  svg: () => (
    <svg
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      // @ts-ignore
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  a: () => (
    <a
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </a>
  ),
  iframe: () => (
    <iframe
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  summary: () => (
    <summary
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </summary>
  ),
  datails: () => (
    <details
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </details>
  ),
  dialog: () => (
    <dialog
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </dialog>
  ),
})
