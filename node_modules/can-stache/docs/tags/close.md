@function can-stache.tags.close {{/expression}}
@parent can-stache.tags 4

@signature `{{/ helperKeyOrMethod }}`

Ends a [can-stache.tags.section] block. Generally, you should end a section with the
helper name like:

```html
{{# if( this.over16 ) }} Time to drive {{/ if }}
```

You can also end a section with just `{{/}}` like:

```html
{{# if( this.over16 ) }} Time to drive {{/}}
```


@param {String} [helperKeyOrMethod] A name that matches the opening key, method or helper name. It’s also possible to simply write `{{/}}` to end a block.
