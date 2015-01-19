@function can.stache.helpers.is {{#is key key}}
@parent can.stache.htags 12

@signature `{{#is key1 key2}}BLOCK{{/is}}`

Renders the `BLOCK` template within the current template.

@param {can.stache.key} keys A key that references a value within the current or parent
context. If the value is a function or can.compute, the function's return value is used.

@param {can.stache} BLOCK A stache template.

@return {String} If the key's value is truthy, the `BLOCK` is rendered with the
current context and its value is returned; otherwise, an empty string.

@param {can.stache} BLOCK A template that is rendered
if the result of comparsion `key1` and `key2` value is truthy.

@body

The `is` helper compares key1 and key2 and renders the blocks accordingly.

	{{#is key1 key2}}
		// truthy
	{{else}}
		// falsey
	{{/is}}
