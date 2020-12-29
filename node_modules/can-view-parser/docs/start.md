@function can-view-parser.ParseHandler.start start
@parent can-view-parser.ParseHandler
@signature `start(tagName, unary, lineNo)`

Called when parsing a tag begins.

@param {String} tagName The name of the tag.
@param {Boolean} unary If this tag is unary (has no closing tag).
@param {Number} lineNo The starting line number of the tag (undefined in production).
