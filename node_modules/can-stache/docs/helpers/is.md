@function can-stache.helpers.is {{#is(expressions)}}
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.helpers.eq] instead.

@signature `{{#is([EXPRESSION...])}}FN{{else}}INVERSE{{/is}}`

Render FN if two values are equal, otherwise render INVERSE.

`is` is an alias for [can-stache.helpers.eq the `eq` helper].
