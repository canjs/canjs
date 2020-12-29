@function can-view-parser.ParseHandler.attrStart attrStart
@parent can-view-parser.ParseHandler
@signature `attrStart(attrName, lineNo)`

Called when an attribute is found on an element.

Handles encoding of certain characthers using [can-attribute-encoder].

@param {String} attrName The name of the attribute.
@param {Number} lineNo The line number of the opening tag (undefined in production).
