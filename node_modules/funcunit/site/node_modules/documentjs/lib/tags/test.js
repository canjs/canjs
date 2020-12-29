	/**
	 * @constructor documentjs.tags.test @test
	 * @parent documentjs.tags
	 * @hide
	 * 
	 * Link to test page.
	 * 
	 * @signature `@test URL`
	 * 
	 * @codestart
	 * /**
	 *  * A component for the lib library.
	 *  * @test lib/component/component.test
	 *  *|
	 * lib.Component = function( name ) { ... }
	 * @codeend
	 * 
	 * @param {String} URL The url of the test page.
	 */
	module.exports = {
		add: function( line ) {
			this.test = line.match(/@test ([^ ]+)/)[1];
		}
	};
