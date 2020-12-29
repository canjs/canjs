@function can.stache.helpers.default {{#default}}
@parent can.stache.htags 15

@signature `{{#default}}BLOCK{{/default}}`

Renders the `BLOCK` if no [can.stache.helpers.case] blocks within the switch resolved.

@param {can.stache} BLOCK a template to be rendered.

@return {DocumentFragment} A fragment, containing the rendered block.

@body

The `default` helper is contextual inside of a [can.stache.helpers.switch] block. It acts as a fall-through in case none of the [can.stache.helpers.case] helpers resolved.

For more information on how `{{#default}}` is used check:

- [can.stache.helpers.switch {{#switch expr}}]
- [can.stache.helpers.case {{#case expr}}]
