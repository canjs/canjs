/**
 * @constructor documentjs.tags.description @description
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Markdown content placed before all signature and API content.
 * 
 * @signature `@description`
 * 
 * Content after the `@description` tag appears after 
 * the title, but before signature and API content.
 * 
 * `@description` tag content is treated as markdown and set as 
 * the [documentjs.process.docObject]'s `description` property.
 * 
 * @body
 * 
 * ## Use
 * 
 * The description of a [documentjs.process.docObject] is displayed at the top
 * of an html page generated with 
 * the [documentjs.generators.html default html generator].  
 * 
 * In the following example, `@description` stops content from being added to [documentjs.tags.param],
 * and instead makes content be added to the description property.
 * 
 * @codestart javascript
 * /**
 *  * @param {String} name The name of the
 *  * component.
 *  * 
 *  * @description
 *  * A component for lib.
 *  *|
 * lib.Component = function(name){}
 * @codeend
 * 
 * By default
 * the first paragraph of content that is not after a multi-line tag like [documentjs.tags.signature],
 * [documentjs.tags.param], etc, is set as the [documentjs.tags.description].  All content
 * after the first paragraph is set as the body content.
 * 
 * You can see what is treated as description and body by default in the following example:
 * 
 * @codestart javascript
 * /**
 *  * @function 
 *  * 
 *  * DESCRIPTION DESCRIPTION
 *  * DESCRIPTION DESCRIPTION
 *  * 
 *  * BODY BODY
 *  * BODY BODY
 *  * 
 *  * BODY BODY
 *  * 
 *  * @signature `.cols(cols)` SIGNATURE_DESCRIPTION
 *  * SIGNATURE_DESCRIPTION SIGNATURE_DESCRIPTION
 *  *
 *  * @body
 *  * BODY BODY
 *  *|
 * Graph.prototype.cols = function(cols){ ... }
 * @codeend
 * 
 * 
 * 
 */
module.exports = {
	add: function( line ) {
		var m = line.match(/^\s*@description\s*(.*)/)
		if ( m ) {
			this.description = m[1]+" ";
			return ["default","description"]
		}
	}
};
