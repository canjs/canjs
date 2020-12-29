@function can-stache.helpers.debugger debugger
@parent can-stache.htags

In development, breaks at the given point in the template to inspect the current scope in the
console.  

@signature `{{debugger}}`

  Breaks any time that part of the page renders.

  The following will hit the debugger
  when you click the _Show_ button:

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      {{ let value=false }}
      {{# if(value) }}
        {{ debugger }}
      {{/ if }}
      <button on:click="value = true">Show</button>
    `;
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

  The [can-view-scope] can be used to look up values. `scope.log()` prints the scope.
  `scope.get(key)` reads a key value.

@signature `{{debugger(CONDITION)}}`
  The one argument debugger breaks any time the helper evaluates and the argument evaluates to a truthy value.

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      {{ let value=false }}
      {{ debugger(value) }}
      <button on:click="value = true">Set to true</button>
    `;
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

  @param {can-stache/expressions/key-lookup|can-stache/expressions/call} CONDITION an EXPRESSION that if evaluates to a truthy value triggers the debugger.

@signature `{{debugger(LEFT, RIGHT)}}`
  The two argument debugger breaks any time the helper evaluates and the two evaluated arguments are equal to each other.

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      {{ let value=false }}
      {{ debugger(value, 2) }}
      <button on:click="value = 2">Set to 2</button>
    `;
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

  @param {can-stache/expressions/key-lookup|can-stache/expressions/call} LEFT an EXPRESSION which compares with RIGHT which if equal triggers the debugger.

  @param {can-stache/expressions/key-lookup|can-stache/expressions/call} RIGHT an EXPRESSION which compares with LEFT which if equal triggers the debugger.

@body

## Use

The `debugger` helper breaks at its place in the template.

During a break, in the paused inspector there is a special `get(<path>)` function to help inspect the current scope. For example, `get("book.title")` will attempt to locate `book` in the current scope and return its `title` property.

Use the helper in development and debugging.
In production, the `debugger` never breaks and instead prints a warning.

## See also

- [guides/debugging] Guide
- [Debugging Tutorial](https://www.bitovi.com/blog/canjs-debugging-tutorial)
