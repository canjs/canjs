	/**
	 * @constructor documentjs.tags.inherits @inherits
	 * @tag documentation
	 * @parent documentjs.tags
	 * 
	 * Indicates that the current [documentjs/DocObject DocObject] inherits from another [documentjs/DocObject DocObject].
	 * 
	 * @signature `@inherits NAME`
	 * 
	 * @codestart
	 * /*
	 *  * @constructor Client
	 *  * @inherits Person
	 *  * ...
	 *  *|
	 *  var Client = Person.extend({})
	 * @codeend
	 * 
	 * @param {String} NAME The name of DocObject the current DocObject inherits from.
	 * 
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+ ([\w\.\$]+)/)
			if ( m ) {
				this.inherits = m[1];
			}
		}
	};
