@function can-stache.helpers.unless {{#unless(expression)}}
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.helpers.if] instead.

@signature `{{#unless(EXPRESSION)}}FN{{else}}INVERSE{{/unless}}`

Renders `FN` if `EXPRESSION` is falsey or `INVERSE` if `EXPRESSION`
is truthy. Both `FN` and `INVERSE` will be rendered with the
current scope.

```html
{{#unless(person.isAwake())}} Shhhhh! {{/unless}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION A lookup expression that will provide a truthy or falsey value.

@param {can-stache.sectionRenderer} FN A subsection that can be optionally rendered.

@param {can-stache.sectionRenderer} [INVERSE] An optional subsection that will be rendered
if `EXPRESSION` is truthy and [can-stache.helpers.else] is used.

@body

## Use

The `unless` helper evaluates the inverse of the value
of the key and renders the block between the helper and the slash.

```html
{{#unless(expr)}}
  // unless
{{/unless}}
```
