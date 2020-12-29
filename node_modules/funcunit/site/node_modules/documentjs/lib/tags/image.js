	/**
	 * @constructor documentjs.tags.image @image
	 * @parent documentjs.tags
	 * @hide
	 * 
	 * Adds an image.
	 * 
	 * @signature `@image SRC [WIDTH] [HEIGHT]`
	 * @param {String} SRC
	 * @param {Number} [WIDTH]
	 * @param {Number} [HEIGHT]
	 * 
	 * 
	 * @codestart
	 * /**
	 *  * @body
	 *  * Check out this awesomeness:
	 *  * @image site/images/page_type_example.png 640 480
	 *  *|
	 * @codeend
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@image\s*([^\s]+)\s*([\w]*)\s*([\w]*)\s*(.*)/)

			if ( m ) {
				var src = m[1] ? m[1] : '';
				this.body += "<img class='image_tag' ";
				this.body += "src='" + src + "' ";
				m[2] ? this.body += "width='" + m[2] + "' " : true;
				m[3] ? this.body += "height='" + m[3] + "' " : true;
				this.body += "/>";
			}
		}
	};
