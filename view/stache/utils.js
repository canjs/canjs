steal("can/util", "can/view/scope",function(can){
	

		// ## can.view.Options
		//
		// This contains the local helpers, partials, and tags available to a template.
		/**
		 * @hide
		 * The Options scope.
		 */
	var Options = can.view.Options;
	
	return {
		// Returns if something looks like an array.  This works for can.List
		isArrayLike: function (obj) {
			return obj && obj.splice && typeof obj.length === 'number';
		},
		// Returns if something is an observe.  This works for can.route
		isObserveLike: function (obj) {
			return obj instanceof can.Map || (obj && !! obj._get);
		},
		// A generic empty function
		emptyHandler: function(){},
		// Converts a string like "1" into 1. "null" into null, etc.
		// This doesn't have to do full JSON, so removing eval would be good.
		jsonParse: function(str){
			// if it starts with a quote, assume a string.
			if(str[0] === "'") {
				return str.substr(1, str.length -2);
			} else if(str === "undefined") {
				return undefined;
			} else if(can.global.JSON) {
				return JSON.parse(str);
			} else {
				return eval("("+str+")");
			}
		},
		mixins: {
			last: function(){
				return this.stack[this.stack.length - 1];
			},
			add: function(chars){
				this.last().add(chars);
			},
			subSectionDepth: function(){
				return this.stack.length - 1;
			}
		},
		// Sets .fn and .inverse on a helperOptions object and makes sure
		// they can reference the current scope and options.
		convertToScopes: function(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer, isStringOnly){
			// overwrite fn and inverse to always convert to scopes
			if(truthyRenderer) {
				helperOptions.fn = this.makeRendererConvertScopes(truthyRenderer, scope, options, nodeList, isStringOnly);
			}
			if(falseyRenderer) {
				helperOptions.inverse = this.makeRendererConvertScopes(falseyRenderer, scope, options, nodeList, isStringOnly);
			}
		},
		// Returns a new renderer function that makes sure any data or helpers passed
		// to it are converted to a can.view.Scope and a can.view.Options.
		makeRendererConvertScopes: function (renderer, parentScope, parentOptions, nodeList, observeObservables) {
			var rendererWithScope = function(ctx, opts, parentNodeList){
				return renderer(ctx || parentScope, opts, parentNodeList);
			};
			var convertedRenderer = function (newScope, newOptions, parentNodeList) {
				// prevent binding on fn.
				// If a non-scope value is passed, add that to the parent scope.
				if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
					newScope = parentScope.add(newScope);
				}
				if (newOptions !== undefined && !(newOptions instanceof Options)) {
					newOptions = parentOptions.add(newOptions);
				}
				var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList|| nodeList );
				return result;
			};
			return observeObservables ? convertedRenderer : can.__notObserve(convertedRenderer);
		},
		// A helper for calling the truthy subsection for each item in a list and putting them in a document Fragment.
		getItemsFragContent: function(items, helperOptions, scope){
			var isObserveList = this.isObserveLike(items);
			var result = [],
				len = isObserveList ? items.attr('length') : items.length;

			for (var i = 0; i < len; i++) {
				var aliases = {
					"%index": i,
					"@index": i
				};
				var item = isObserveList ? items.attr('' + i) : items[i];
				result.push(helperOptions.fn(scope.add(aliases, {notContext: true }).add(item)));
			}
			return result;
		},
		Options: Options
	};
});
