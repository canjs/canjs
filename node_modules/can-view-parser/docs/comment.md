@function can-view-parser.ParseHandler.comment comment
@parent can-view-parser.ParseHandler
@signature `comment(value, lineNo)`

Called when a [Comment](https://developer.mozilla.org/en-US/docs/Web/API/Comment) is found within a tag.

@param {String} value The Comment within the tag.
@param {Number} lineNo The starting line number of the comment (undefined in production).
