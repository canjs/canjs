@function can-stache.tags.unescaped2 {{&key}}
@hide
@parent can-stache.tags 2

@description Insert the unescaped value of the expression into the
output of the template.

@signature `{{&key}}`

The `{{&key}}` tag is an alias for [can-stache.tags.unescaped {{{key}}}].

@param {can-stache.key} key A key that references a value within the current or parent
context. If the value is a function or [can-compute.computed], the function’s return value is used.
@return {String|Function|*}
