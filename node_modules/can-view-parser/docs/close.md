@function can-view-parser.ParseHandler.close close
@parent can-view-parser.ParseHandler
@signature `close(tagName, lineNo)`

Called when a closing tag is found. If no closing tag exists for this tag (because it is self-closing) this function will not be called.

@param {String} tagName The name of the tag.
@param {Number} lineNo The line number of the tag (undefined in production).
