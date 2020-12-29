@page can-stache.scopeAndContext Legacy Scope Behavior
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.helpers.let] and [can-stache.helpers.for-of] instead to refer to things up in the scope.

@body

Every part of a stache template is rendered with a
given [can-view-scope scope]. The scope is used to lookup
values. A scope looks in a single `context` by default with
methods to look up values from above.

In this example, `{{last}}` has no output because the context of the `{{#person}}` block doesn't contain a `last` property:

```html
<!-- Template -->
<h1>{{message}} {{#person}}{{first}} {{last}}{{/person}}</h1>
```

```js
{
	person: { first: "Alexis" },
	last: "Abril",
	message: "Hello"
}
```

```html
<!-- Result -->
<h1>Hello Alexis</h1>
```

A scope can walk up the contexts to find the property with the `scope.find(...)` method.

This is very similar to how `last` is looked up in the following JavaScript:

```js
const message = "Hello";
function outer() {
	const last = "Abril";

	function inner() {
		const first = "Alexis";
		console.log( message + " " + first + " " + last );
	}
	inner();
}
outer();
```

JavaScript looks for `last` in the `inner` context and then walks up the
scope to the `outer` context to find a `last` variable.


Let’s look at what happens with the scope the following example:

```html
<!-- Template -->
<h1>{{message}} {{#person}}{{first}} {{scope.find('last')}}{{/person}}</h1>
```

```js
{
	person: { first: "Alexis" },
	last: "Abril",
	message: "Hello"
}
```

```html
<!-- Result -->
<h1>Hello Alexis Abril</h1>
```

1. The template is rendered with `Data` as the only item in the scope. `scope:[Data]`
2. `{{message}}` is looked up within `Data`.
3. `{{#person}}` adds the `person` context to the top of the scope. `scope:[Data,Data.person]`
4. `{{first}}` is looked up in the scope.  It will be found on `Data.person`.
5. from `{{scope.find('last')}}`, `last` is looked up in the scope.  
   1. `last` is looked in `Data.person`, it’s not found.
   2. `last` is looked up in `Data` and returned.
6. `{{/person}}` removes `person` from the scope. `scope:[Data]`



The context used to lookup a value can be specified with adding `../` before a
key. For instance, if we wanted to make sure `last` was going to look up above `person`,
we could change the template to:

```html
<!-- Template -->
<h1>{{message}} {{#person}}{{first}} {{../last}}{{/person}}</h1>
```

```js
{
	person: { first: "Alexis", last: "*****" },
	last: "Abril",
	message: "Hello"
}
```

```html
<!-- Result -->
<h1>Hello Alexis Abril</h1>

```

[can-stache.tags.section Sections], [can-stache.Helpers Helpers],
and [can-component custom elements] can modify the scope used to render a subsection.

[can-stache.key] modifiers  like `../` and `@key` can control the context and value that
gets returned.

You can also create unique scope variables using [can-stache/expressions/hash Hash Expressions].

In the [can-stache.helpers.each#___each_EXPRESSION_HASH_EXPRESSION___FN__else__INVERSE___each__ {{#each}}] helper:

```html
{{#each(todos, todo=value num=index)}}
	<li data-index="{{num}}">{{todo.name}}</li>
{{/each}}
```

…and the [can-stache.helpers.with#___with_HASHES___BLOCK___with__ {{#with}}] helper:

```html
{{#with(street=person.address.street city=person.address.city)}}
		Street: {{street}}
	City: {{city}}
{{/with}}
```

You can also always read from the root scope using `scope.root`. This allows you to read data from the context you passed to your renderer function even in loops or recursive templates:

```html
<span>{{scope.root.message}}{{name}}</span>
{{#./child}}
	<div>
		{{>*self}}
	</div>
{{/child}}
```
