var getParent = require("./helpers/getParent"),
	tnd = require("./helpers/typeNameDescription");

	var funcMatch = /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[=]\s*function\s?\(([^\)]*)/,
		codeMatch = /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/;

	/**
	 * @constructor documentjs.tags.constructor @constructor
	 * @hide
	 * Document a constructor function.
	 * 
	 * @signature `@constructor NAME [TITLE]`
	 * @parent documentjs.tags
	 */
	module.exports = {
		add: function(line, curData, scope, docMap){
			console.warn("Using the @class directive.  It is deprecated!");
			// it's possible this has already been matched as something else ... clear parent
			
			this.type = "constructor";
			var data = tnd(line);
			if(data.name) {
				this.name = data.name;
			}
			
			this.title = data.description;
			return ["scope",this];
		}
	};

