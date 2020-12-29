@function can-stache.portal portal
@parent can-stache.htags 6

@signature `{{#portal(EXPRESSION)}}FN{{/portal}}`

`portal` is used to insert a section of a template into another element, and not at the place where the helper is used.

```js
import {stache} from "can";

let view = stache(`
	{{#portal(head)}}
		<title>My website!</title>
		<meta og:title="My website">
	{{/portal}}
`);

let data = {
	head: document.head
};

view(data);
console.log(document.head.innerHTML)
// -> <title>My website!</title>\n<meta og:title="My website">
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An
expression that returns an *element*. If the value of the `EXPRESSION` is observable, the resulting HTML will be *moved* when the value of the observable changes to a different element.

@param {can-stache.sectionRenderer} FN A subsection that is
rendered to the value in `EXPRESSION`.

@body

## Use

`portal` is used to render HTML some place other than the template in which the helper is used.

A common use case for `portal` is to render content with the document's [head](https://developer.mozilla.org/en-US/docs/Web/API/Document/head) element.

For components, this makes it easier to have separate `<title>` and `<meta>` tags defined in each template.

For example this component:

```js
import {StacheElement} from "can";

class CartPage extends StacheElement {
  static view = `
    {{#portal(head)}}
    <title>Cart | Dog Stuff</title>
    {{/portal}}
  `;

  static props = {
    head: {
      get default() {
        return document.head;
      }
    }
  };
}

customElements.define("cart-page", CartPage);
```

Will insert `<title>Cart | Dog Stuff</title>` into the document head.
