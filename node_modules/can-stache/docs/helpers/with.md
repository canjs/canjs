@function can-stache.helpers.with {{#with(expression)}}
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.helpers.let] instead.

Changes the context within a block.

@signature `{{#with(EXPRESSION)}}BLOCK{{/with}}`

Renders `BLOCK` with the result of `EXPRESSION` added to the top of the [can-view-scope].

```html
{{#with(person.address)}}
	Street: {{street}}
	City: {{city}}
{{/with}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION A lookup expression that will provide a value.

@param {can-stache.sectionRenderer} BLOCK A template that is rendered
with the context of the `EXPRESSION`’s value.

@signature `{{#with(HASHES)}}BLOCK{{/with}}`

Renders `BLOCK` with the key-value pairs from a [can-stache/expressions/hash] added to the top of the [can-view-scope].

```html
{{#with(innerStreet=person.address.street innerCity=person.address.city)}}
    Street: {{innerStreet}}
    City: {{innerCity}}
{{/with}}
```

@param {can-stache/expressions/hash} HASHES Any number of hash keys and values

@param {can-stache.sectionRenderer} BLOCK A template that is rendered
with the hashes added to the context.

@body

## Use

`{{#with()}}` renders a subsection with a new context added to the [can-view-scope].
For example:

```html
<!-- Template -->
{{#with(person.address)}}
	Street: {{street}}
	City: {{city}}
{{/with}}
```

```js
{ person: { address: { street: "123 Evergreen", city: "Springfield" } } }
```

```html
<!-- Result -->
Street: 123 Evergreen
City: Springfield
```

The new context can be a lookup expression, or a set of hashes which are taken together to be a new context.

```html
<!-- Template -->
{{#with(innerStreet=person.address.street innerCity=person.address.city)}}
	Street: {{innerStreet}}
	City: {{innerCity}}
{{/with}}
```

```js
{ person: { address: { street: "123 Evergreen", city: "Springfield" } } }
```

```html
<!-- Result -->
Street: 123 Evergreen
City: Springfield
```

The difference between `{{#with()}}` and the default [can-stache.tags.section]
is that the subsection `BLOCK` is rendered no matter what:

```html
<!-- Template -->
{{#with(person.address)}}
	Street: {{street}}
	City: {{city}}
{{/with}}
```

```js
{ person: {} }
```

```html
<!-- Result -->
Street:
City:
```
