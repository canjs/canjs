@function can-stache.tags.inverse {{^expression}}
@parent can-stache/deprecated
@description Like [can-stache.tags.section], but renders
the opposite subsection depending on the type of expression
or the expression’s return value.

@deprecated {4.15.0} Instead of using `{{^}}`, use `{{#}}` and [can-stache.helpers.not]. For example,
instead of:

```html
{{^ if(this.isOver18) }}
```

use:

```html
{{# not(this.isOver18) }}
```

@signature `{{^EXPRESSION}}FN{{else}}INVERSE{{/key}}`

Works just like [can-stache.tags.section], but renders `INVERSE`
when it would have rendered the `FN` block and vice-versa.

For example:

```html
{{^ isOver18(person) }} Can’t Vote {{/isOver18}}
```

Renders `Can’t Vote` if `isOver18(person)` returns `falsey`.

@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} EXPRESSION An expression type. Behavior depends on the type of expression:

 - [can-stache/expressions/key-lookup] and [can-stache/expressions/call]s:
   - renders `FN` with falsey values and empty lists.
   - renders `INVERSE` with truthy values or each item in a list.
 - [can-stache/expressions/helper]s: switch the `options.fn` and `options.inverse`.

@body

## Use

Inverted sections match falsey values. An inverted section
syntax is similar to regular sections except it begins with a caret
rather than a pound. If the value referenced is falsey, the section
will render. For example:


The template:

```html
<ul>
    {{#friends}}
        </li>{{name}}</li>
    {{/friends}}
    {{^friends}}
        <li>No friends.</li>
    {{/friends}}
</ul>
```

And data:

```js
{
	friends: []
}
```

Results in:

```html
<ul>
    <li>No friends.</li>
</ul>
```
