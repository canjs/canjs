@function can-view-parser.ParseHandler.end end
@parent can-view-parser.ParseHandler
@signature `end(tagName, unary, lineNo)`

Called at the end of parsing a tag.

@param {String} tagName The name of the tag.
@param {Boolean} unary If this tag is unary (has no closing tag).
@param {Number} lineNo The starting line number of the tag (undefined in production).
