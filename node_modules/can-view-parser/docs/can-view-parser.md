@module {function} can-view-parser
@parent can-views
@collection can-infrastructure
@description Parse HTML and mustache tokens.
@package ../package.json

@signature `parse(html, handler, [returnIntermediate])`

Parse an html string:

```js
import parser from "can-view-parser";

const html = "<h1><span bob=\"phillips\"></span><span bob=\"meyers\"></span>" +
  "</h1>";

const bobs = {};
let curAttr;

parser( html, {
	attrStart: function( attrName ) {
		curAttr = attrName;
	},
	attrValue: function( value ) {
		bobs[ curAttr ] = value;
	}
} );

for ( const first in bobs ) {
	const last = bobs[ first ];
	console.log( "Hello", first, last );
}
```

@param {String|Object} html A mustache and html string to parse or an intermediate object the represents a previous parsing.
@param {can-view-parser.ParseHandler}  handler An object of callbacks.
@param {Boolean} [returnIntermediate=false] If true, returns a JS object representation of the parsing.
