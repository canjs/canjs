@function can-stache.tags.escaped {{expression}}
@parent can-stache.tags 0

@description Insert the value of the expression into the
output of the template.

@signature `{{EXPRESSION}}`

  Gets the value of `EXPRESSION` and inserts the escaped result into the output of the
  template.

  If the expression is clearly of a particular expression type like `{{ myMethod(arg) }}`,
  that expression’s rules will be followed.

  ```js
  import {stache} from "can";

  var view = stache(`<div>{{ this.value }}</div>`);

  var fragment = view({value: "<script src='evil.com'>"});

  console.log(fragment.firstChild.innerHTML) //-> &lt;script src='evil.com'&gt;
  document.body.append(fragment);
  ```
  @codepen


  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} expression The `expression` can be:

   - [can-stache/expressions/literal] - `{{ 5 }}` - Inserts a string representation of the literal.
   - [can-stache/expressions/key-lookup] - `{{ key }}` - Looks up the value of `key` in the [can-view-scope].
   - [can-stache/expressions/call] - `{{ method() }}` - Calls `method` in the [can-view-scope].
   - [can-stache.view] - `{{ view(data) }}` - Calls a view renderer function with `data` and inserts the result.

  @return {Primitive|Node|Object|Function}

  Depending on what the expression evaluates to, the following happens:

  - `null`, `undefined` - inserts the empty string.
  - `String`, `Number`, `Boolean` - inserts the string representation of the value.
  - `Function` - Calls the function back with a textNode placeholder element.
  - `Node`, `Element` - Inserts the HTML into the page.
  - An object with the `can.toDOM` symbol - Inserts the result of calling the `can.toDOM` symbol. This is how [can-stache.safeString]
    works.
  - An object with the `can.viewInsert` - Calls the `can.viewInsert` function with [can-view-callbacks.tagData]
    and inserts the result.

@body


## Use

`{{expression}}` inserts the value returned by the `expression`. To understand how a particular expression works,
please read that expression's documentation:

- [can-stache/expressions/literal] - `{{ 5 }}`
- [can-stache/expressions/key-lookup] - `{{ key }}`
- [can-stache/expressions/call] - `{{ method() }}`

This documentation focuses on how `{{expression}}` handles the result of that expression.

## Inserting primitives

## Inserting elements

DOM elements and nodes returned will be inserted in the page.

```js
import {stache, fragment} from "//unpkg.com/can@5/core.mjs";

var view = stache(`<div>{{ this.h1("Hello World") }}</div>`);

var frag = view({
    h1(text) {
        return fragment("<h1>"+text+"</h1>")
    }
});

console.log(frag.firstChild.innerHTML) //-> <h1>Hello World</h1>
document.body.append(frag);
```
@codepen

## Inserting functions

If a function is returned, that function is called back with a placeholder text node:

```js
import {stache, domMutate} from "can";

var view = stache(`<div>{{ this.blink("Hello There") }}</div>`);

var fragment = view({
	blink(text) {
		return function(placeholderElement) {
			var interval = setInterval(function(){
				placeholderElement.nodeValue = placeholderElement.nodeValue === text ?
					"" : text;
			},500);
			domMutate.onNodeRemoval(placeholderElement, function(){
				console.log("element removed");
				clearInterval(interval);
			});

		}
	}
});

document.body.append(fragment);

setTimeout(function(){
	document.body.innerHTML = "CLEARED";
},2000);
```
@codepen




## Inserting objects with `can.toDOM`

If an object has a `can.toDOM` symbol property, that property's value will be called, the result passed to [can-fragment],
and the result of [can-fragment] will be inserted.

```js
import {stache} from "//unpkg.com/can@5/core.mjs";

var view = stache(`<div>{{ helloWorld }}</div>`);

var fragment = view({
    helloWorld: {
		[Symbol.for("can.toDOM")]() {
			return "<h1>Hello World</h1>";
		}
	}
});

console.log(fragment.firstChild.innerHTML) //-> <h1>Hello World</h1>
document.body.append(fragment);
```
@codepen
