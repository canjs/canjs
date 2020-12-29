@function can.stache.helpers.each {{#each key}}
@parent can.stache.htags 5

@signature `{{#each key}}BLOCK{{/each}}`

Render the block of text for each item in key's value.

@param {can.stache.key} key A key that references a value within the current or parent
context. If the value is a function or can.compute, the function's
return value is used.

If the value of the key is a [can.List], the resulting HTML is updated when the
list changes. When a change in the list happens, only the minimum amount of DOM
element changes occur.

If the value of the key is a [can.Map], the resulting HTML is updated whenever
attributes are added or removed. When a change in the map happens, only
the minimum amount of DOM element changes occur.

@param {can.stache} BLOCK A template that is rendered for each item in
the `key`'s value. The `BLOCK` is rendered with the context set to the item being rendered.

@body

## Use

Use the `each` helper to iterate over a array
of items and render the block between the helper and the slash. For example,

The template:

    <ul>
      {{#each friends}}
        <li>{{name}}</li>
      {{/each}}
    </ul>

Rendered with:

    {friends: [{name: "Austin"},{name: "Justin"}]}

Renders:

    <ul>
      <li>Austin</li>
      <li>Justin</li>
    </ul>

## Object iteration

As of 2.1, you can now iterate over properties of objects and attributes with
the `each` helper. When iterating over [can.Map] it will only iterate over the
map's [keys](can.Map.keys.html) and none of the hidden properties of a can.Map. For example,

The template:

    <ul>
      {{#each person}}
        <li>{{.}}</li>
      {{/each}}
    </ul>

Rendered with:

    {person: {name: 'Josh', age: 27}}

Renders:

    <ul>
      <li>Josh</li>
      <li>27</li>
    </ul>

## Understanding when to use #each with lists

{{#each key}} iteration will do basic diffing and aim to only update the DOM where the change occured. Whereas
[can.stache.Sections Sections] iteration will re-render the entire section for any change in the list.
[can.stache.Sections Sections] iteration is the prefered method to use when a list is replaced or changing significantly.
When doing single list item changes frequently, {{#each key}} iteration is the faster choice.

For example, assuming "list" is a can.List instance:

{{#if list}} will check for the truthy value of list. This is akin to checking for the truthy value of any JS object and will result to true, regardless of list contents or length.

{{#if list.length}} will check for the truthy value of the length attribute. If you have an empty list, the length will be 0, so the #if will result to false and no contents will be rendered. If there is a length >= 1, this will result to true and the contents of the #if will be rendered.

{{#each list}} and {{#list}} both iterate through an instance of can.List, however we setup the bindings differently.

{{#each list}} will setup bindings on every individual item being iterated through, while {{#list}} will not. This makes a difference in two scenarios:

1) You have a large list, with minimal updates planned after initial render. In this case, {{#list}} might be more advantageous as there will be a faster initial render. However, if any part of the list changes, the entire {{#list}} area will be re-processed.

2) You have a large list, with many updates planned after initial render. A grid with many columns of editable fields, for instance. In this case, you many want to use {{#each list}}, even though it will be slower on initial render(we're setting up more bindings), you'll have faster updates as there are now many sections.
