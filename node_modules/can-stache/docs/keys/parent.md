@typedef {String} can-stache/keys/parent ../parent
@parent can-stache/keys

Start looking for values in the parent context.

@signature `../key`

Look for values starting in the parent context.

```html
{{#each(todos)}}
	<div class='{{#if(../isEditing(this))}}editing{{/if}}'>
		{{./name}}
	</div>
{{/each}}
```

@body

## Use

Adding `../` before a key will lookup the key starting in the parent
context.  By changing the previous template to:

```html
{{first}} {{last}}
  {{#children}}
    {{first}} {{../last}}
  {{/children}}
```

It will write out:

```html
Barry Meyer
    Kim Meyer
    Justin Meyer
```

You can use `.././last` to lookup `last` _only_ in the parent context.
