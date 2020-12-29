@function can-stache.helpers.if if
@parent can-stache.htags
@signature `{{#if(EXPRESSION)}}FN{{else}}INVERSE{{/if}}`

Renders `FN` if `EXPRESSION` is truthy or `INVERSE` if `EXPRESSION`
is falsey. Both `FN` and `INVERSE` will be rendered with the
current scope.

```html
{{#if(person.isAwake())}} Hello {{/if}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION A lookup expression that will provide a truthy or falsey value.

@param {can-stache.sectionRenderer} FN A subsection that can be optionally rendered.

@param {can-stache.sectionRenderer} [INVERSE] An optional subsection that will be rendered
if `EXPRESSION` is falsey and [can-stache.helpers.else] is used.

@body

## Use

`{{#if(key)}}` provides explicit conditional truthy tests.

For example, this template:

```html
{{#if(user.isFemale)}}
  {{#if(user.isMarried)}}
    Mrs
  {{/if}}
  {{#if(user.isSingle)}}
    Miss
  {{/if}}
{{/if}}
```

Rendered with:

```js
{ user: { isFemale: true, isMarried: true } }
```

Results in:

```html
Mrs
```

If can be used with [can-stache.helpers.else {{else}}] too. For example,

```html
{{#if(user.isFemale)}}
  {{#if(user.isMarried)}}
    Mrs
  {{else}}
    Miss
  {{/if}}
{{/if}}
```

Rendered with:

```js
{ user: { isFemale: true, isMarried: false } }
```

Results in:

```html
Miss
```
