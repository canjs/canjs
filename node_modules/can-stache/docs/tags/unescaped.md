@function can-stache.tags.unescaped {{{expression}}}

@parent can-stache.tags 1

@description Insert the unescaped value of the expression into the
output of the template.

@signature `{{{EXPRESSION}}}`

  Behaves just like [can-stache.tags.escaped] but does not
  escape the result. The following makes a markdown editor:

  ```html
  <markdown-edit></markdown-edit>
  <script src="//cdnjs.cloudflare.com/ajax/libs/showdown/1.8.7/showdown.min.js"></script>
  <script type="module">
  import {StacheElement} from "can";

  class MarkdownEdit extends StacheElement {
    static view = `
      <textarea on:input:value:bind="this.value"
          rows="4" style="width: 90%"></textarea>
      <div>{{{this.html}}}</div>
    `;

    static props = {
      value: "# Hello World\nHow are __you__?",
      converter: {
        get default() {
          return new showdown.Converter();
        }
      },
      get html(){
        return this.converter.makeHtml(this.value);
      }
    };
  };
  customElements.define("markdown-edit", MarkdownEdit);
  </script>
  ```
  @codepen

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} EXPRESSION An expression whose unescaped result is inserted into the page.

  @return {Primitive|Node|Object|Function}

  Depending on what the expression evaluates to, the following happens:

  - `null`, `undefined` - inserts the empty string.
  - `Number`, `Boolean` - inserts the string representation of the value.
  - `String` - inserts the HTML of the string.
  - `Function` - Calls the function back with a textNode placeholder element.
  - `Node`, `Element` - Inserts the HTML into the page.
  - An object with the `can.toDOM` symbol - Inserts the result of calling the `can.toDOM` symbol. This is how [can-stache.safeString]
    works.
  - An object with the `can.viewInsert` - Calls the `can.viewInsert` function with [can-view-callbacks.tagData]
    and inserts the result.

  Read [can-stache.tags.escaped]'s documentation to understand how these return types are handled.

@body


## Render Component Instances

`{{{expression}}}` can be used to render [can-component] instances:

```js
import {StacheElement, stache} from "can";

class MyGreeting extends StacheElement {
  static view = `
    <p>Hello {{subject}}</p>
  `;

  static props = {
    subject: type.maybeConvert(String)
  };
}

customElements.define("my-greeting", MyGreeting);

const myGreetingInstance = new MyGreeting({
  subject: "friend"
});

const template = stache("<div>{{{componentInstance}}}</div>");

const fragment = template({
  componentInstance: myGreetingInstance
});

fragment; //-> <div><my-greeting><p>Hello friend</p></my-greeting></div>
```
