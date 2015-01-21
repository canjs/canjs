@function can.stache.helpers.is {{#is expr1 expr2 expr3}}
@parent can.stache.htags 12

@signature `{{#is expr1 expr2}}BLOCK{{/is}}`

Renders the `BLOCK` template within the current template.

@param {can.stache.key} [args] A key that references a value within the current or parent
context. If the value is a function or can.compute, the function's return value is used.

@param {can.stache} BLOCK A stache template.

@return {String} If the key's value is truthy, the `BLOCK` is rendered with the
current context and its value is returned; otherwise, an empty string.

@param {can.stache} BLOCK A template that is rendered
if the result of comparsion `expr1` and `expr2` value is truthy.

@body

The `is` helper compares expr1 and expr2 and renders the blocks accordingly.

	{{#is expr1 expr2}}
		// truthy
	{{else}}
		// falsey
	{{/is}}
