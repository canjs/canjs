/**
 * @constructor documentjs.tags.author @author
 * @tag documentation
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Describes the author of a [documentjs.process.docObject].
 * 
 * @body
 * 
 * ### Example:
 * 
 * @codestart javascript
 * /*
 *  * @author Justin Meyer
 *  *|
 * @codeend
 */
module.exports = {
	add: function( line ) {
		var m = line.match(/^\s*@author\s*(.*)/);
		if ( m ) {
			this.author = m[1];
		}
	}
};
