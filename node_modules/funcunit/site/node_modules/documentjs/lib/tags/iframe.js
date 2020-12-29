	/**
	 * @constructor documentjs.tags.iframe @iframe
	 * @parent documentjs.tags
	 * 
	 * Adds an iframe to the page. It can be added to the 
	 * [documentjs/tags/body @body] or any other tags that
	 * accept a description.
	 * 
	 * @signature `@iframe SRC [HEIGHT]`
	 * @codestart
	 * /**
	 *  * A component for lib.
	 *  * @body
	 *  * See it in action:
	 *  * @iframe lib/component/component.html 300
	 *  *|
	 * @codeend
	 * 
	 * @param {String} SRC The source of the html page.
	 * @param {Number} [HEIGHT] The height of the html page. If
	 * a height is not provided, the height is determined as
	 * the content of the body.
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@iframe\s*([\-\w\.\/]*)\s*([\w]*)\s*(.*)/)

			if ( m ) {
				var src = m[1] ? m[1].toLowerCase() : '';
				var height = m[2] ? m[2] : '320';
				this.body += "<div class='iframe_wrapper' "
				this.body += "data-iframe-src='" + src + "' "
				this.body += "data-iframe-height='" + height + "'></div>";
			}
		}
	};
