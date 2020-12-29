@function can-stache.tags.partial {{>key}}
@parent can-stache/deprecated

@deprecated {4.15} Pass renderer functions through the ViewModel instead. See the “Calling views” section in the [can-stache#BasicUse can-stache docs] for an example.

Render another template within the current template.

@signature `{{>key [EXPRESSION]}}`

Looks up another template with `key` and renders it with the current scope or
`EXPRESSION` added on top of the current scope.

```js
stache.registerPartial( "address.stache", "<p>{{street}} {{city}}</p>" );
const template = stache( "{{#each(people)}} {{>address.stache address}} {{/each}}" );
```

@param {can-stache/expressions/key-lookup|String} key A key used to lookup a
[can-stache.view stache renderer function].   

The behavior is determined by what the key returns.  

If the key returns
a `function`, that function is used as the __renderer function__.  The __renderer function__
is called with the current scope (or a scope modified by `EXPRESSION`) and the
result is inserted in place of the magic tag.

If the key returns a `string`, that string is used as the __renderer function name__.
If the key returns `undefined`, the key itself is used as the __renderer function name__.

Once the __renderer function name__ is known, the __renderer function__ is looked for
by the same name.  A __renderer function__ is looked for in the following places:

 1. In [can-view-scope.Options]’s `partials` property.
 2. In partials registered with [can-stache.registerPartial].
 3. For an element whose `id` matches __renderer function name__.  Its `innerHTML` will be converted to a template.

The __renderer function__
is called with the current scope (or a scope modified by `EXPRESSION`) and the
result is inserted in place of the magic tag.

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} [EXPRESSION] An
optional expression that adds a new context to the [can-view-scope] the template is
rendered with.



@body

## Use

Partials are templates embedded in other templates.  Partials begin with a greater than sign, like `{{>my_partial}}`.  Partials inherit the calling scope.  


Partials render at runtime, so recursive partials are possible but make sure you avoid infinite loops.

Partials are typically registered [can-stache.registerPartial] like:

```js
stache.registerPartial( "address.stache", "<p>{{street}} {{city}}</p>" );
```

And called within another template like:

```js
const template = stache( "{{#person.address}} {{>address.stache}} {{/person.address}}" );
```

With data like `{person: {address: {street: "123 Evergreen", city: "Chicago"}}}`,
rendering `template` would produce:

```html
<p>123 Evergreen Chicago</p>
```

The 2nd argument to `{{>key}}` can specify a different context for the partial to be rendered
with.  The following example renders the same thing as above:

```js
const template = stache( "{{#person}} {{>address.stache address}} {{/person}}" );
```



## Functions as partials

`{{>key}}` can be used to call [can-stache.view] functions in the scope.  For example:

```html
<!-- Template -->
{{#item}}{{>myPartial}}{{/item}}
```

```js
{
	item: { name: "Justin" },
	myPartial: stache( "{{name}}" )
}
```

```html
<!-- Result -->
Justin
```

## Script tags as partials

`{{>key}}` can be used to render the contents of script tags.

For example, if you've embedded a partial like:

```html
<script type='text/stache' id='todo-stache'>
  <li>{{name}}</li>
</script>
```

This can be rendered like:

```html
{{#each(todos)}}{{>todo-stache}}{{/each}}
```
