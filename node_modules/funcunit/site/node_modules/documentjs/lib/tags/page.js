	/**
	 * @constructor documentjs.tags.page @page
	 * @parent documentjs.tags
	 * 
	 * Declares this comment as a page. Use pages to
	 * represent content that doesn't belong to part of the
	 * application structure.
	 * 
	 * @signature `@page NAME [TITLE]`
	 * 
	 * @codestart 
     * /**
     *  * @@page lib/faq FAQ
     *  * @@parent lib
     *  * 
     *  * Checkout these frequently asked questions 
     *  *
     *  * @@body
     *  *
     *  * ## How to contribute to DocumentJS
     *  *|
	 * @codeend
	 * 
	 * @param {String} NAME The unique name of the page.
	 * @param {String} [TITLE] The title of the article used for display purposes.
	 * 
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+\s+([^\s]+)(?:\s+(.+))?/)
			if ( m ) {
				this.name = m[1];
				if(m[2]){
					this.title= m[2]
				}
				this.type= "page"
			}
		}
	};
