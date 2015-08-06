@function can.stache.helpers.case {{#case expr}}
@parent can.stache.htags 14

@signature `{{#case expr}}BLOCK{{/case}}`

Renders the `BLOCK` when `expr` matches the `expr` provided in the parent [can.stache.helpers.switch].

@param {can.stache.expression} expr An expression or key that references a value.

@param {can.stache} BLOCK a template that will render if the case clause resolves.

@return {DocumentFragment} A fragment, possibly containing the rendered `BLOCK`.

@body

The `case` helper is contextual inside of a [can.stache.helpers.switch] block. The parent switch contains an `expr` that will be matched against the case `expr` and if they are equal the block will be returned.

For more information on how `{{#case}}` is used check:

- [can.stache.helpers.switch {{#switch expr}}]
- [can.stache.helpers.default {{#default}}]
