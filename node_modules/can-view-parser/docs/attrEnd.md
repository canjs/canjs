@function can-view-parser.ParseHandler.attrEnd attrEnd
@parent can-view-parser.ParseHandler
@signature `attrEnd(attrName, lineNo)`

Called at the end of parsing an attribute; after the [can-view-parser.ParserHandler.attrStart] and [can-view-parser.ParserHandler.attrValue] functions have been called.

@param {String} attrName The name of the attribute.
@param {Number} lineNo The line number of the opening tag (undefined in production).
