@typedef {Object} can-view-callbacks.attrData attrData
@parent can-view-callbacks/types

The data provided to [can-view-callbacks.attr].

@type {Object}

  ```js
import canViewCallbacks from "can-view-callbacks";
import stache from "can-stache";

canViewCallbacks.attr( "my-attr", function( el, attrData ) {
	attrData.scope.peek( "value" ); //-> 123
	attrData.attributeName;       //-> "my-attr"

} );

stache( "<div my-attr='value'/>" )( {
	value: 123
} );
```

  @option {can-view-scope} scope The scope of the element.

  @option {can-view-scope.Options} options The mustache helpers and other non-data values passed to the template.

  @option {String} attributeName The attribute name that was matched.
