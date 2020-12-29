@function can-stache.registerPartial registerPartial
@description Register a partial template that can be rendered with [can-stache.tags.partial].
@parent can-stache/deprecated

@deprecated {4.15} Pass renderer functions through the ViewModel instead. See the “Calling views” section in the [can-stache#BasicUse can-stache docs] for an example.

@signature `stache.registerPartial(name, template)`

Registers a template so it can be rendered with `{{>name}}`.

```js
stache.registerPartial( "item.stache", "<li>{{name}}</li>" );

const itemsTemplate = stache( "{{#each(items)}}{{>item.stache}}{{/each}}" );
```

@param {String} name The name of the partial.
@param {String|can-stache.view} template The string of a stache template or the
returned result of a stache template.

@body
