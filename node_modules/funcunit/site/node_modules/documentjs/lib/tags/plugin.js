	/**
	 * @constructor documentjs.tags.plugin @plugin
	 * @parent documentjs.tags
	 * @hide
	 * 
	 * Specifies the parent 
	 * [documentjs/DocObject DocObject]'s name. The
	 * current DocObject will be displayed under the
	 * the parent in the navigation. 
	 * 
	 * @signature `@plugin NAME`
	 * 
	 * @codestart
	 * /**
	 *  * @@page can.Construct.super
	 *  * @@parent can.Construct.plugins
	 *  * @@plugin can/construct/super
	 *  * @@test can/construct/super/qunit.html
	 *  *|
	 * @codeend
	 * 
	 * @param {String} NAME The name of the plugin.
	 */
	module.exports = {
		add: function( line ) {
			this.plugin = line.match(/@plugin ([^ ]+)/)[1];
		}
	}
