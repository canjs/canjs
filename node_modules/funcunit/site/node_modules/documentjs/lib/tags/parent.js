	module.exports = (function() {
		var waiting = {}

		/**
		 * @constructor documentjs.tags.parent @parent
		 * @parent documentjs.tags
		 * 
		 * Specifies the parent 
		 * [documentjs.process.docObject]'s name. The
		 * current docObject will be displayed under the
		 * the parent in the navigation. 
		 * 
		 * @signature `@parent NAME`
		 * 
		 * @codestart javascript
		 * /**
		 *  * @constructor jQuery.Drag
		 *  * @parent specialevents
		 *  * ...
		 *  *|
		 *  $.Drag = function(){}
		 * @codeend
		 * 
		 * @param {String} NAME The name of the parent
		 * [documentjs.process.docObject].
		 * 
		 * @body
		 * 
		 * ## Use
		 * 
		 * [documentjs.tags.function] and [documentjs.tags.property] tags can infer
		 * their parent from the current scope.
		 */
		return {
			add: function( line , curData, objects) {
				var m = line.match(/^\s*@parent\s*([\w\-\.\/\$]*)\s*([\d]*)/);
				this.parent = m[1];
				if(m[2]){
					this.order =  parseInt(m[2]) || 0;
				}
			}
		};

	})();

