@function can-view-parser.ParseHandler.chars chars
@parent can-view-parser.ParseHandler
@signature `chars(value, lineNo)`

Called when [CharacterData](https://developer.mozilla.org/en-US/docs/Web/API/CharacterData) is found within a tag.

@param {String} value The character data within the tag.
@param {Number} lineNo The starting line number of the text (undefined in production).
