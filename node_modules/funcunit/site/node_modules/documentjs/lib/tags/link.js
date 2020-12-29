	/**
	 * @constructor documentjs.tags.link @link
	 * @tag documentation
	 * @parent documentjs.tags
	 * 
	 * @description 
	 * 
	 * Adds a link in the "links" section.
	 * 
	 * @body
	 * 
	 * ### Example:
	 * 
	 * @codestart javascript
	 * /*
	 *  * @link ../docco/component.html source
	 *  *|
	 * @codeend
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@link\s*([^\s]+)\s+(.+)/)
			if ( m ) {
				if(!this.links){
					this.links = [];
				}
				this.links.push({
					href: m[1],
					title: m[2]
				});
			}
		}
	};
