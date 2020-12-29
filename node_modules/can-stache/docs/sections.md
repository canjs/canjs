@page can-stache.Sections Sections
@parent can-stache.pages 7
@hide

Sections (`[can-stache.tags.section {{#key}}]` followed by `[can-stache.tags.close {{/key}}]`) have multiple uses
depending on what type of object is passed to the section. In all cases, using a section will change
the current [can-stache.context context].

The most basic form of section will simply render a section of code if the key referenced is considered **truthy** (has a value):

```html
<!-- Template -->
Hello!
{{#person}}
	{{name}}
{{/person}}
```

```js
{
	person: {
		name: "Andy"
	}
}
```

```html
<!-- Result -->
Hello!
Andy
```

Whenever the key doesn’t exist or the value is **falsey**, the section won’t be rendered:

```html
<!-- Template -->
Hello!
{{#person}}
	{{name}}
{{/person}}
```

```js
{}
```

```html
<!-- Result -->
Hello!
```

However, this scenario can be covered through the use of an inverse section
(`[can-stache.tags.inverse {{^key}}]` followed by `[can-stache.tags.close {{/key}}]`):

```html
<!-- Template -->
Hello!
{{#person}}
	{{name}}
{{/person}}
{{^person}}
	No one is here.
{{/person}}
```

```js
{}
```

```html
<!-- Result -->
Hello!
No one is here.
```

## Iteration

There is a special case for sections where the key references an array. In this case, the section iterates
the entire array, rendering the inner text for each item in the array. Arrays are considered **truthy** if
they aren’t empty. The `{{.}}` tag will reference the current item within the array during iteration (which is
primarily used when the items in the array are primitives like strings and numbers).

```html
<!-- Template -->
{{#people}}
	{{.}}
{{/people}}
```

```js
{
	people: [ "Andy", "Austin", "Justin" ]
}
```

```html
<!-- Result -->
Andy Austin Justin
```

## Understanding when to use Sections with lists

Section iteration will re-render the entire section for any change in the list. It is the preferred method to
use when a list is replaced or changing significantly. Whereas [can-stache.helpers.each {{#each(key)}}] iteration
will do basic diffing and aim to only update the DOM where the change occurred. When doing single list item
changes frequently, [can-stache.helpers.each {{#each(key)}}] iteration is the faster choice.

For example, assuming "list" is a [can-list] instance:

`{{#if(list)}}` will check for the truthy value of list. This is akin to checking for the truthy value of any JS object and will result to true, regardless of list contents or length.

`{{#if(list.length)}}` will check for the truthy value of the length attribute. If you have an empty list, the length will be 0, so the `#if` will result to false and no contents will be rendered. If there is a length >= 1, this will result to true and the contents of the `#if` will be rendered.

`{{#each(list)}}` and `{{#list}}` both iterate through an instance of [can-list], however we set up the bindings differently.

`{{#each(list)}}` will set up bindings on every individual item being iterated through, while `{{#list}}` will not. This makes a difference in two scenarios:

1) You have a large list, with minimal updates planned after initial render. In this case, `{{#list}}` might be more advantageous as there will be a faster initial render. However, if any part of the list changes, the entire `{{#list}}` area will be re-processed.

2) You have a large list, with many updates planned after initial render. A grid with many columns of editable fields, for instance. In this case, you many want to use `{{#each(list)}}`, even though it will be slower on initial render (we’re setting up more bindings), you’ll have faster updates as there are now many sections.
