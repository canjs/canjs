@function can-stache.helpers.default default
@parent can-stache.htags 15

@signature `{{#default()}}BLOCK{{/default}}`

Renders `BLOCK` if no [can-stache.helpers.case] blocks within the [can-stache.helpers.switch] resolved.

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


@param {can-stache.sectionRenderer} BLOCK a template to be rendered.

@body

## Use

The `default` helper is contextual inside of a [can-stache.helpers.switch] block. It acts as a fall-through in case none of the [can-stache.helpers.case] helpers resolved.

For more information on how `{{#default()}}` is used check:

- [can-stache.helpers.switch {{#switch(expr)}}]
- [can-stache.helpers.case {{#case(expr)}}]
