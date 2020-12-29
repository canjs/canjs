@property {String} can-view-parser.ParseHandler.magicStart magicStart
@parent can-view-parser.ParseHandler
@deprecated {4.0}

@option {String}

The starting characters of a magic tag.

```js
parser( " /* ... */ content /* ... */", {

	// ...
	magicStart: "{",
	magicMatch: /\{([^\}]*)\}/g
} );
```
