
/**
 * @constructor documentjs.tags.test @test
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Adds an API section to this page
 * 
 * @signature `@api ROOT`
 * 
 * @codestart
 * /**
 *  * A component for the lib library.
 *  * @test lib/component/component.test
 *  *|
 * lib.Component = function( name ) { ... }
 * @codeend
 * 
 * @param {String} ROOT the name of the object and child object you want an API section for.
 */
module.exports = {
	add: function( line ) {
		this.api = line.match(/@api ([^ ]+)/)[1];
	}
};
