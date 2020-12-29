var getParent = require('./helpers/getParent');
/**
 * @constructor documentjs.tags.styles @styles
 *
 * @parent documentjs.tags
 *
 *
 * @signature `@styles [NAME]`
 *
 * @param {String} [NAME] The name of the style. The name is used
 * as a reference for other tags
 *
 * @param {String} [TITLE] The title to be used for display purposes
 */
module.exports = {
	add: function(line, curData, scope, docMap){
		var m = line.match(/^\s*@\w+\s+([^\s]+)(?:\s+(.+))?/);
		if( m ) {
			this.name = m[1];
			if(m[2]){
				this.title = m[2];
			}
			this.type = "styles";
			var parentAndName = getParent.andName({
				parents: '*',
				useName: ['stylesheet'],
				scope: scope,
				docMap: docMap,
				name: this.name
			});
			if(!this.parent){
				this.parent = parentAndName.parent;
			}
			this.hideInParentMenu = true;
		}
	}
};