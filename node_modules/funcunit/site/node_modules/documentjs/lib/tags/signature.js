	/**
	 * @constructor documentjs.tags.signature @signature
	 * @parent documentjs.tags
	 * 
	 * Specifies a signature for a [documentjs/tags/function @function]
	 * but can work with any other tag.
	 * 
	 * @signature '@signature `SIGNATURE` DESCRIPTION'
	 * 
	 * @codestart javascript
	 * /**
	 *  * Capitalizes a string.
	 *  * @@signature `can.capitalize(s)` Example:
	 *  *
	 *  *     can.capitalize("foo") //-> "Bar"
	 *  * 
	 *  * @@param {String} s the string to be lowercased.
	 *  * @@return {String} a string with the first character capitalized, 
	 *  * and everything else lowercased
	 *  *|
	 * capitalize: function( s ) { ... }
	 * @codeend
	 * 
	 * @param {String} SIGNATURE
	 * 
	 * Code that describes how a method should be called.
	 * 
	 * @param {String} [DESCRIPTION] Describes the behavior
	 * of the signature.
	 * 
	 */
	module.exports = {
		add: function( line, last ) {
			var description ="",
				code,
				m = line.match(/^\s*@signature\s*(?:'([^']*)')?\s*(.*)/);
			
			if( m[1] ){
				code = m[1];
				description = m[2];
			} else if( m = line.match(/^\s*@signature\s*(?:`([^`]*)`)?\s*(.*)/) ){
				code = m[1];
				description = m[2];
			} 

			if ( m ) {
				if(!this.signatures){
					this.signatures = [];
				}
				var signature = {
					code: code,
					description: description,
					params: []
				};
				// remove code params
				delete this._curParam;
				delete this.params;
				this.signatures.push(signature)
				return signature;
			}
			
		},
		addMore: function( line, data ) {
			data.description += "\n"+line;
		}
	};