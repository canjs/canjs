@function can-stache.helpers.for-of for(of)
@parent can-stache.htags 5
@description Loop through a list of values, keys in an object, or integers.

@signature `{{# for( VARIABLE_NAME of EXPRESSION ) }}FN{{else}}INVERSE{{/ for}}`

  `for` is used to to loop through:
  - an array-like list of values
    ```
    {{# for(task of this.tasks) }} {{task.name}} {{/for}}
    ```
  - keys in an object
    ```
    {{# for( this.task ) }} {{scope.key}} {{scope.value}} {{/for}}
    ```
  - integers starting from 0
    ```
    {{# for( this.tasks.length ) }} {{scope.index}} {{/for}}
    ```

  If an __array-like list of values__ is passed, `for` loops through
  each value returned by `EXPRESSION` and points a
  a local [can-stache.helpers.let let-like] variable named   `VARIABLE_NAME` at each value.

  ```js
  import {stache} from "can";

  var view = stache(`
  	<ul>
  		{{# for(item of this.values) }}
  			<li>{{ item.name }}</li>
  		{{/ for }}
  	</ul>
  `);

  var data = {
  	values: [
  		{name: "first"},
  		{name: "second"}
  	]
  };

  var frag = view(data);
  console.log(frag.firstElementChild.innerHTML)
  //-> <li>first</li><li>second</li>

  document.body.appendChild(frag);
  ```
  @codepen

  If an __object of key-values__ are passed, the values of the object will be looped through.
  You can access the key with `scope.key`:

  ```js
  import {stache} from "can";

  var view = stache(`
  	<ul>
  		{{# for(name of this.values) }}
  			<li>{{scope.key}}: {{ name }}</li>
  		{{/ for }}
  	</ul>
  `);

  var data = {
  	values: {
		first: "Hope",
		middle: "van",
		last: "Dyne"
	}
  };

  var frag = view(data);
  console.log(frag.firstElementChild.innerHTML)
  //-> <li>first: Hope</li><li>middle: van</li><li>last: Dyne</li>

  document.body.appendChild(frag);
  ```
  @codepen

  If a __positive integer__ value is passed, it will loop that number of times.
  You can access the current index with `scope.index`:

  ```js
  import {stache} from "can";

  var view = stache(`
    <ul>
      {{# for(this.integerValue) }}
        <li>{{scope.index}}</li>
      {{/ for }}
    </ul>
  `);

  var data = {
    integerValue: 3
  };

  var frag = view(data);
  console.log(frag.firstElementChild.innerHTML)
  //-> <li>0</li><li>1</li><li>2</li>

  document.body.appendChild(frag);
  ```
  @codepen

  If the `EXPRESSION` is falsy or an empty object or list, the `INVERSE` section will be rendered:

  ```js
  import {stache} from "can";

  var view = stache(`
  	<ul>
  		{{# for(name of this.values) }}
  			<li>{{ item.name }}</li>
		{{ else }}
			<li>No items</li>
  		{{/ for }}
  	</ul>
  `);

  var data = {
  	values: []
  };

  var frag = view(data);
  console.log(frag.firstElementChild.innerHTML)
  //-> <li>No items</li>

  document.body.appendChild(frag);
  ```
  @codepen

  @param {VariableExpression} [VARIABLE_NAME] A local variable
  that will only be accessible to [can-stache/expressions/key-lookup KeyLookups] within the
  block.  You can leave out the `VARIABLE_NAME` and `of` to loop through items in the object like:

  ```html
  {{# for( this.values ) }}
	  <li>{{ scope.index }}</li>
  {{/ for }}
  ```

  @param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An expression that returns


  - A [can-reflect.isListLike list like] data structure.
  - An object-like (key-value) data structure.
  - A positive integer Number


  If the value of the `EXPRESSION` is an observable list ([can-define/list/list]) or map ([can-define/map/map]) and an item within it changes, only the minimum amount of DOM elements in the resulting HTML will change. If the list/map/or number value itself changes, a [can-diff/list/list difference] will be performed, resulting again in a minimal set of updates.


  @param {can-stache.sectionRenderer} FN A subsection that is
  rendered for each value in `EXPRESSION`. This subsection can
  access the value in `EXPRESSION` as `VARIABLE_NAME`.

  @param {can-stache.sectionRenderer} INVERSE A subsection that
  is rendered if `EXPRESSION` evaluats to an empty list.


@body

## Use

`for` is used to render HTML for items in a list. It improves
upon [can-stache.helpers.each] in that it does not
change the scope. Notice that within the `{{# for}}` block,
`this` still refers to the data passed to the view:

```js
import {stache} from "can";

var view = stache(`
	<ul>
		{{# for(item of this.values) }}
			<li>{{this.dataName}}-{{ item.name }}</li>
		{{/ for }}
	</ul>
`);

var data = {
	values: [
		{name: "one"},
		{name: "two"}
	],
	dataName: "number"
};

var frag = view(data);
document.body.appendChild(frag);

document.body.innerHTML
//-> <ul><li>number-one</li><li>number-two</li></ul>
```
@codepen
