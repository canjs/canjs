@function can-stache.helpers.case case
@parent can-stache.htags 14

@signature `{{#case(EXPRESSION)}}BLOCK{{/case}}`

Renders the `BLOCK` when `EXPRESSION` matches the `EXPRESSION` provided in the parent [can-stache.helpers.switch].

```html
{{#switch(user.type)}}
	{{#case("admin")}}
		<button value="edit"/>
	{{/case}}
	{{#case("manager")}}
		<button value="view">
	{{/case}}
	{{#default()}}
		You do not have permission!
	{{/default}}
{{/switch}}
```

@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An expression or key that references a value.

@param {can-stache.sectionRenderer} BLOCK A subsection that will be rendered if
the case `EXPRESSION` matches the switch’s `EXPRESSION`.

@body

## Use

The `case` helper is contextual inside of a [can-stache.helpers.switch] block. The parent switch contains an `expr` that will be matched against the case `expr` and if they are equal the block will be returned.

For more information on how `{{#case()}}` is used check:

- [can-stache.helpers.switch]
- [can-stache.helpers.default]
