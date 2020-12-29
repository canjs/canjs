@function can-stache.helpers.each {{#each(expression)}}
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.helpers.for-of] instead.

@signature `{{#each(EXPRESSION)}}FN{{else}}INVERSE{{/each}}`

Render `FN` for each item in `EXPRESSION`’s return value.  If `EXPRESSION`
is falsey or an empty list, render `INVERSE`.

```html
{{#each(todos)}}
  <li>{{name}}</li>
{{else}}
  <li>No todos, rest easy!</li>
{{/each}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An
expression that typically returns a list like data structure.

If the value of the EXPRESSION is a [can-define/list/list] or [can-list], the resulting HTML is updated when the list changes. When a change in the list happens, only the minimum amount of DOM
element changes occur.  The list itself can also change, and a [can-diff/list/list diff]
will be performed, which also will perform a minimal set of updates. The [can-stache/keys/special special %key key] is available within `FN`.

If the value of the key is an object, `FN` will be
called for each property on the object. The [can-stache/keys/special special %key key]
is available within `FN`.

@param {can-stache.sectionRenderer} FN A subsection that will be rendered with each
item in `EXPRESSION` or property value in `EXPRESSION`.

@param {can-stache.sectionRenderer} [INVERSE] An optional subsection that will be rendered
if `EXPRESSION` is falsey or an empty list or object.

@signature `{{#each(EXPRESSION, HASH_EXPRESSION)}}FN{{else}}INVERSE{{/each}}`

Like a normal `{{#each(EXPRESSION)}}`, but uses [can-stache/expressions/hash] to
add the current `value`, `key`, or `index` to the current scope.

```html
{{#each(todos, todo=value num=index)}}
    <li data-index="{{num}}">{{todo.name}}</li>
{{/each}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An
expression that returns a list or object like data structure.

@param {can-stache/expressions/hash} HASH_EXPRESSION A hash expression that aliases special properties for each iteration:
- `value`: The current value
- `key`: The key of the current object item
- `index`: The index of the current array item

@param {can-stache.sectionRenderer} FN A subsection that will be rendered with each
item in `EXPRESSION` or property value in `EXPRESSION`.

@param {can-stache.sectionRenderer} [INVERSE] An optional subsection that will be rendered
if `EXPRESSION` is falsey or an empty list or object.

@signature `{{#each(EXPRESSION)}}FN{{else}}INVERSE{{/each}}`

Like a normal `{{#each(EXPRESSION)}}`, but adds each item in `EXPRESSION` as
`KEY` in `FN`’s [can-view-scope].

```html
{{#each(todos, todo=value)}}
    <li>{{todo.name}}</li>
{{/each}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An
expression that returns a list or object like data structure.

@param {can-stache.key} key The name that:
 - each item in `EXPRESSION`’s list, or
 - each property value in `EXPRESSION`’s object
should take on in `FN`.

@param {can-stache.sectionRenderer} FN A subsection that will be rendered with each
item in `EXPRESSION` or property value in `EXPRESSION`.

@param {can-stache.sectionRenderer} [INVERSE] An optional subsection that will be rendered
if `EXPRESSION` is falsey or an empty list or object.


@body

## Use

Use the `each` helper to iterate over a array
of items and render the block between the helper and the slash.

For example, this template:

```html
<ul>
  {{#each(friends)}}
    <li>{{name}}</li>
  {{/each}}
</ul>
```

Rendered with:

```js
{ friends: [ { name: "Austin" }, { name: "Justin" } ] }
```

Renders:

```html
<ul>
  <li>Austin</li>
  <li>Justin</li>
</ul>
```

## Object iteration

When iterating over [can-map] it will only iterate over the
map’s [can-map.keys] and none of the hidden properties of a Map.

For example, this template:

```html
<ul>
  {{#each(person)}}
    <li>{{.}}</li>
  {{/each}}
</ul>
```

Rendered with:

```js
{ person: { name: "Josh", age: 27 } }
```

Renders:

```html
<ul>
  <li>Josh</li>
  <li>27</li>
</ul>
```

## Understanding when to use #each with lists

`{{#each(key)}}` iteration will do basic diffing and aim to only update the DOM where the change occurred. Whereas
[can-stache.tags.section] default iteration will re-render the entire section for any change in the list.
[can-stache.tags.section] iteration is the preferred method to use when a list is replaced or changing significantly.
When doing single list item changes frequently, `{{#each(expression)}}` iteration is the faster choice.

For example, assuming "list" is a [can-define/list/list] instance:

`{{#each(list)}}` and `{{#list}}` both iterate through an instance of [can-define/list/list], however we setup the bindings differently.

`{{#each(list)}}` will setup bindings on every individual item being iterated through, while `{{#list}}` will not. This makes a difference in two scenarios:

1) You have a large list, with minimal updates planned after initial render. In this case, `{{#list}}` might be more advantageous as there will be a faster initial render. However, if any part of the list changes, the entire `{{#list}}` area will be re-processed.

2) You have a large list, with many updates planned after initial render. A grid with many columns of editable fields, for instance. In this case, you many want to use `{{#each(list)}}`, even though it will be slower on initial render (we’re setting up more bindings), you’ll have faster updates as there are now many sections.
