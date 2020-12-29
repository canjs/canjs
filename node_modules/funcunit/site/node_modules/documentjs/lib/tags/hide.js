	/**
	 * @constructor documentjs.tags.hide @hide
	 * @parent documentjs.tags
	 * 
	 * Hides the comment from the navigation.
	 * 
	 * @signature `@hide`
	 * 
	 * @codestart javascript
	 * /**
	 *  * Checks if there is a set_property value.  
	 *  * If it returns true, lets it handle; otherwise saves it.
	 *  * @@hide
	 *  *|
	 *  _setProperty: function( prop ) {
	 * @codeend
	 * 
	 * @signature `@hide SECTION`
	 * 
	 * Hides some section of the generated output.  The default layout supports:
	 * 
	 * @codestart javascript
	 * /**
	 *  * @hide sidebar
	 *  * @hide title
	 *  * @hide footer
	 *  * @hide article
	 *  * @hide container
	 *  * @hide header
	 *  *|
	 * @codeend
	 * 
	 * This a `hideSection` property to [documentjs.process.docObject] where `Section` is the 
	 * capitalized `SECTION` name passed to `@hide`.
	 * 
	 * 
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@hide\s*([\w\d]*)/);
			
			if ( m ) {
				var name = m[1];
				if(!name) {
					this.hide = true;
				} else {
					this["hide"+name[0].toUpperCase()+name.substr(1).toLowerCase()] = true;
				}
			}
			
		}
	};
