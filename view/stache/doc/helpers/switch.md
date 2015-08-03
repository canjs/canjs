@function can.stache.helpers.switch {{#switch expr}}
@parent can.stache.htags 13

@signature `{{#switch expr}}BLOCK{{/switch}}`

Renders the `BLOCK` with contextual [can.stache.helpers.case] and [can.stache.helpers.default] helpers.

@param {can.stache.expression} expr An expression or key that references a value that will be switched on.

@param {can.stache} BLOCK a template that is rendered, uses [can.stache.helpers.case] and [can.stache.helpers.default] helpers to match `expr`.

@return {DocumentFragment} A fragment containing the rendered `BLOCK`.

@body

The `switch` helper is used to render a block where one of several cases matches expr. It works just like a JavaScript switch.


	{{#switch page}}

		{{#case "cart"}}
			<can-import from="cart">
				<cart-page></cart-page>
			</can-import>
		{{/case}}

		{{#default}}
			<can-import from="home">
				<home-page></home-page>
			</can-import>
		{{/default}}

	{{/switch}}

