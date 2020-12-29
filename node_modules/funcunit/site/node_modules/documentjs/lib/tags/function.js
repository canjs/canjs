var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription'),
	
	//(~)? is just a stupid way of making sure there are the right number of parts
	
	// key: function() or key= function(){}
	keyFunction = /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[:=].*function\s?\(([^\)]*)/,
	namedFunction = /\s*function\s+([\w\.\$]+)\s*(~)?\(([^\)]*)/;

	
	
	var updateNameWithScope = require("./helpers/updateNameAndParentWithScope");

	/**
	 * @constructor documentjs.tags.function @function
	 * 
	 * @parent documentjs.tags
	 * 
	 * @description Specifies the comment is for a function. Use [documentjs.tags.param @param] to
	 * specify the arguments of a function.
	 * 
	 * @signature `@function [NAME] [TITLE]`
	 * 
	 * @codestart javascript
	 * /**
	 *  * @function lib.Component.prototype.update update
	 *  * @parent lib.Component
	 *  *|
	 * C.p.update = function(){
	 * 	 
	 * }
	 * @codeend
	 * 
	 * @param {String} [NAME] The name of the function. It should 
	 * be supplied if it can not be determined from the code block
	 * following the comment.
	 * 
	 * @param {String} [TITLE] The title to be used for display purposes.
	 * 
	 * @body
	 * 
	 * ## Code Matching
	 * 
	 * The `@function` type can be infered from code like the following:
	 * 
	 * @codestart javascript
	 * /**
	 *  * The foo function exists
	 *  *|
	 * foo: function(){}
	 * /**
	 *  * The bar function exists
	 *  *|
	 * bar = function(){}
	 * @codeend
	 */
	module.exports = {
		codeMatch: /function(\s+[\w\.\$]+)?\s*\([^\)]*\)/,
		code: function( code, scope, docMap ) {
			
			var parts = code.match(keyFunction);
			
			if (!parts ) {
				parts = code.match(namedFunction);
			}
			var data = {
				type: "function"
			};
			if (!parts ) {
				return;
			}
			data.name = parts[1] ? parts[1].replace(/^this\./, "")
				.replace(/^exports\./, "")
				.replace(/^\$./, "jQuery.") : parts[2];


			data.params = [];
			var params = parts[3].match(/\w+/g);

			if ( params ) {

				for ( var i = 0; i < params.length; i++ ) {
					data.params.push({
						name: params[i],
						types: [{type: "*"}]
					});
				}
			
			}
			
			// assign name and parent
			if(scope && docMap){
				var parentAndName = getParent.andName({
					parents: "*",
					useName: ["constructor","static","prototype","add","module"],
					scope: scope,
					docMap: docMap,
					name: data.name
				});

				data.parent = parentAndName.parent;
				data.name = parentAndName.name;
			}
			
			return data;
		},
		add: function(line, curData, scope, docMap){
			var data = tnd(line);
			this.title = data.description;
			if(data.name) {
				this.name = data.name;
			}
			updateNameWithScope(this, scope, docMap);
			if(this.name)
			this.type = "function";
			if(!data.params){
				data.params = [];
			}
		}
	};

