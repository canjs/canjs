@function can-stache.tags.section {{#expression}}
@parent can-stache.tags 3

Renders a subsection one or more times depending on the type of expression
or the expression’s return value.

@signature `{{# EXPRESSION }} TRUTHY {{else}} FALSY {{/ EXPRESSION }}`

  Defines a `TRUTHY` section and optional `FALSY` expression. `TRUTHY`
  or `FALSEY` are rendered zero or many times depending on the behavior of
  `EXPRESSION`.

  The following example uses `{{#}}` and `{{/}}` to define a section that
  is rendered conditionally by the [can-stache.helpers.if] helper:

  ```js
  import {stache} from "can";

  const view = stache(`<div>
    {{# if(this.day) }}
      Good Morning!
    {{/ if }}
    </div>`);

  var fragment = view({day: true});
  console.log(fragment.firstChild.innerHTML) //-> "Good Morning!"

  document.body.appendChild(fragment);
  ```
  @codepen

  Different helpers can render these sections multiple times. [can-stache.helpers.else]
  also defines a `FALSY` section that helpers can call. In the following, [can-stache.helpers.for-of]
  calls the `FALSY` section:

  ```js
  import {stache} from "can";

  const view = stache(`<ul>
    {{# for(value of values) }}
      <li>{{ value }}<li>
    {{ else }}
      <li>no values<li>
    {{/ for }}
    </ul>`);

  var fragment = view({values: []});
  console.log(fragment.firstChild.innerHTML) //-> "<li>no values</li>"

  document.body.appendChild(fragment);
  ```
  @codepen

  Helpers can control the variables and context accessible in the `TRUTHY`
  and `FALSY` section. Read [can-stache.addHelper] and
  [can-stache.addLiveHelper] on how to do this with your own helpers.

@signature `{{# KEY_EXPRESSION }} TRUTHY {{else}} FALSY {{/KEY_EXPRESSION}}`

  <div class="deprecated warning">
  <h3>Deprecated 4.15.0</h3>

  This use has been deprecated in favor of using [can-stache.helpers.if],
  [can-stache.helpers.for-of], or [can-stache.helpers.let].

  - Instead of  `{{#this.truthy}} {{../value}} {{/this.truthy}}`,
    use `{{# if(this.truthy) }} {{ this.value }} {{/ if }}`.
  - Instead of  `{{#this.values}} {{value}} {{/this.values}}`,
    use `{{# for(value of this.values) }} {{ value }} {{/ for }}`.
  - Instead of  `{{#this.object}} {{objectKey}} {{/this.object}}`,
    use `{{# let obj=this.object }} {{ obj.objectKey }} {{/ let }}`.

  </div>

  Renders the `FN` or `INVERSE` section one or many times depending on
  the value in `KEY_EXPRESSION`.

  If `KEY_EXPRESSION` returns an  [can-reflect.isListLike array like object],
  the `FN` section will be rendered for each item in the array.  If the array like object is
  empty, the `INVERSE` section will be rendered. The [can-stache.helpers.each] helper
  should generally be used for observable array-like objects as it has some performance
  advantages.  

  ```html
  {{#items}}<li>{{name}}</li>{{/items}}
  ```

  If `KEY_EXPRESSION` returns a truthy value, the `FN` section will be rendered with
  the truthy value.

  If `KEY_EXPRESSION` returns a fasley value, the `INVERSE` section will be rendered with
  the fasley value.

  ```html
  {{#address}} {{street}} {{city}} {{/address}}
  ```

  The closing tag can end with `{{/}}`.

  @param {can-stache/expressions/key-lookup} KEY_EXPRESSION A key expression.
  If there is no value in the scope of `keyOrHelper`, it will be treated as a [can-stache/expressions/helper].
  @param {can-stache.sectionRenderer} FN The truthy subsection.
  @param {can-stache.sectionRenderer} INVERSE An optional inverse section created
  by using [can-stache.helpers.else].


@body

## Use

`{{#}}` and `{{/}}` are used to define sections so helpers like [can-stache.helpers.if] and
[can-stache.helpers.for-of] can call those sections.  This is similar to  `{` and `}`
in JavaScript.  

For example:

```html
{{# if(this.day) }}
  Good Morning!
{{/ if }}
```

is like:

```js
if(this.day) {
	console.log( "Good Morning!" );
}
```

The helper called by `{{#}}` controls the variables and context accessible in the `TRUTHY`
and `FALSY` sections. Read the helper's documentation to understand when the subsections are
called and what they are called with.
