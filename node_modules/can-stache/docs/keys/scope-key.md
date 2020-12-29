@typedef {String} can-stache/keys/scope/key scope/key
@parent can-stache/keys

@description Looks up the *key* on the [can-view-scope scope] or [can-view-scope.Options helper scope] in a template, walking until a value is found.

@signature `scope/key`

Looks up a value in the [can-view-scope scope] or
[can-view-scope.Options helper scope] by walking up to parent scopes until
a value is found.  This results in a
[can-stache/expressions/key-lookup]. [can-stache/expressions/key-lookup]
expressions can provide different values depending on what type of expression they
are within.

```html
<div>
	<h1>Title</h1>
	<h2>Team {{scope/name}}</h2>
</div>
```

@body

## Use

Use when you are unable to directly reference a value using [can-stache/keys/current],
[can-stache/keys/parent], [can-stache/keys/this], etc. you can use `scope/key` to look
up the value anywhere on the scope.

These two are equivalent:

```html
<span>{{scope.find('person')}}</span>
```

and

```html
<span>{{scope/person}}</span>
```
