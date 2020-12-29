/**
 * @constructor documentjs.tags.stylesheet @stylesheet
 *
 * @parent documentjs.tags
 *
 * @signature `@stylesheet [NAME]`
 *
 * @param {String} [NAME] The name of the stylesheet. The name is used
 * as a reference for other tags
 *
 * @param {String} [TITLE] The title to be used for display purposes
 */
module.exports = {
	add: function(line){
		var m = line.match(/^\s*@\w+\s+([^\s]+)(?:\s+(.+))?/);
		if( m ) {
			this.name = m[1];
			if(m[2]){
				this.title = m[2];
			}
			this.type = "stylesheet";
			this.showChildrenInPage = true;
			this.hideChildrenInMenu = true;
			return ["scope", this];
		}
	}
};