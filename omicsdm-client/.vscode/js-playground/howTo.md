## vscode playground

# How to use the vscode-javascript-repl extension

https://github.com/axilleasiv/vscode-javascript-repl-docs/wiki/Markdown-code-blocks

# How to copy object from Chrome debugger to clipboard

in console:
`copy(JSON.stringify(object));`

# Example for the extension

```js
// edit this comment to trigger reload
editor = "vscode";

```

```js repl++
// edit this comment to trigger reloads

// use repl+ to include the next code block
// use repl++ to include all following code blocks

```

```js repl!
// edit this comment to trigger reload.

// use repl! to ignore a code block

```

```js repl--
// edit this comment to trigger reload

// use repl- to include the previous code block
// use repl-- to include all the previous code blocks

```
