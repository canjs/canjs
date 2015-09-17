// # can/view/stache/mustache_core.js
//
// This provides helper utilities for Mustache processing. Currently,
// only stache uses these helpers.  Ideally, these utilities could be used
// in other libraries implementing Mustache-like features.

steal("can/util",
	"./utils",
	"./mustache_helpers",
	"can/view/live",
	"can/view/elements.js",
	"can/view/scope",
	"can/view/node_lists",
	function(can, utils, mustacheHelpers, live, elements, Scope, nodeLists ){

	live = live || can.view.live;
	elements = elements || can.view.elements;
	Scope = Scope || can.view.Scope;
	nodeLists = nodeLists || can.view.nodeLists;

	// ## Types

	// A lookup is an object that is used to identify a lookup in the scope.
	/**
	 * @hide
	 * @typedef {{get: String}} can.mustache.Lookup
	 * @option {String} get A value in the scope to look up.
	 */


	// ## Helpers

	// Breaks up the name and arguments of a mustache expression.
	var argumentsRegExp = /('.*?'|".*?"|=|[\w\.\\\-_@\/~]+|[\(\)])/g,
		literalRegExp = /^('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)$/,
		// Finds mustache tags and their surrounding whitespace.
		mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,
		// A helper for calling the truthy subsection for each item in a list and putting them in a document Fragment.
		getItemsFragContent = function(items, isObserveList, helperOptions, options){
			var frag = (can.document || can.global.document).createDocumentFragment();
			for (var i = 0, len = items.length; i < len; i++) {
				append(frag, helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options) );
			}
			return frag;
		},
		// Appends some content to a document fragment.  If the content is a string, it puts it in a TextNode.
		append = function(frag, content){
			if(content) {
				frag.appendChild(typeof content === "string" ? frag.ownerDocument.createTextNode(content) : content);
			}
		},
		// A helper for calling the truthy subsection for each item in a list and returning them in a string.
		getItemsStringContent = function(items, isObserveList, helperOptions, options){
			var txt = "";
			for (var i = 0, len = items.length; i < len; i++) {
				txt += helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options);
			}
			return txt;
		},
		getKeyComputeData = function (key, scope, readOptions) {

			// Get a compute (and some helper data) that represents key's value in the current scope
			var data = scope.computeData(key, readOptions);

			can.compute.temporarilyBind(data.compute);

			return data;
		},
		// Sets .fn and .inverse on a helperOptions object and makes sure
		// they can reference the current scope and options.
		convertToScopes = function(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer){
			// overwrite fn and inverse to always convert to scopes
			if(truthyRenderer) {
				helperOptions.fn = makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
			}
			if(falseyRenderer) {
				helperOptions.inverse = makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
			}
		},
		// Returns a new renderer function that makes sure any data or helpers passed
		// to it are converted to a can.view.Scope and a can.view.Options.
		makeRendererConvertScopes = function (renderer, parentScope, parentOptions, nodeList) {
			var rendererWithScope = function(ctx, opts, parentNodeList){
				return renderer(ctx || parentScope, opts, parentNodeList);
			};
			return can.__notObserve(function (newScope, newOptions, parentNodeList) {
				// prevent binding on fn.
				// If a non-scope value is passed, add that to the parent scope.
				if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
					newScope = parentScope.add(newScope);
				}
				if (newOptions !== undefined && !(newOptions instanceof core.Options)) {
					newOptions = parentOptions.add(newOptions);
				}
				var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList|| nodeList );
				return result;
			});
		};

	var Expression = function(value){
		this._value = value;
	};
	Expression.prototype.value = function(){
		return this._value;
	};
	
	var ScopeExpression = function(key){
		this.key = key;
	};
	ScopeExpression.prototype = new Expression();
	ScopeExpression.prototype.value = function(scope, helperOptions, readOptions) {
		if(readOptions.asCompute){
			var data = getKeyComputeData(this.key, scope, readOptions);
			// If there are no dependencies, just return the value.
			if (!data.compute.computeInstance.hasDependencies) {
				return data.initialValue;
			} else {
				return data.compute;
			}
		} else {
			return scope.read(this.key, readOptions).value;
		}
	};
	
	var MethodExpression = function(name, args, hash) {
		this.name = name;
		this._args = args;
		this._hash = hash;
	};
	MethodExpression.prototype = new Expression();
	
	MethodExpression.prototype.args = function(scope, helperOptions, readOptions){
		var args = [];
		for(var i = 0, len = this._args.length; i < len; i++) {
			var arg = this._args[i];
			args.push( arg.value.apply(arg, arguments) );
		}
		return args;
	};
	MethodExpression.prototype.hash = function(scope, helperOptions, readOptions){
		var hash = {};
		for(var prop in this._hash) {
			var val = this._hash[prop];
			hash[prop] = val.value.apply(val, arguments);
		}
		return hash;
	};
	// looks up the name key in the scope
	// returns a `helper` property if there is a helper for the key.
	// returns a `value` property if the value is looked up.
	MethodExpression.prototype.helperAndValue = function(scope, helperOptions, readOptions){
		//{{foo bar}}
		
		var looksLikeAHelper = this._args.length || !can.isEmptyObject(this._hash),
			helper,
			value,
			methodKey = this.name.key,
			initialValue,
			args;
			
		// If the expression looks like a helper, try to get a helper right away.
		if (looksLikeAHelper) {
			// Try to find a registered helper.
			helper = mustacheHelpers.getHelper(methodKey, helperOptions);

			// If a function is on top of the context, call that as a helper.
			var context = scope.attr(".");
			if(!helper && typeof context[methodKey] === "function") {
				//!steal-remove-start
				can.dev.warn('can/view/stache/mustache_core.js: In 3.0, method "' + methodKey + '" will not be called as a helper, but as a method.');
				//!steal-remove-end
				helper = {fn: context[methodKey]};
			}

		}
		if(!helper) {
			args = this.args(scope, helperOptions, readOptions);
			// Get info about the compute that represents this lookup.
			// This way, we can get the initial value without "reading" the compute.
			var computeData = getKeyComputeData(methodKey, scope, {
				isArgument: false,
				args: args && args.length ? args : [scope.attr('.'), scope]
			}),
				compute = computeData.compute;

			initialValue = computeData.initialValue;

			// Set name to be the compute if the compute reads observables,
			// or the value of the value of the compute if no observables are found.
			if(computeData.compute.computeInstance.hasDependencies) {
				value = compute;
			} else {
				value = initialValue;
			}

			// If it doesn't look like a helper and there is no value, check helpers
			// anyway. This is for when foo is a helper in `{{foo}}`.
			if( !looksLikeAHelper && initialValue === undefined ) {
				helper = mustacheHelpers.getHelper(methodKey, helperOptions);
			}

		}
		
		//!steal-remove-start
		if ( !helper && initialValue === undefined) {
			if(looksLikeAHelper) {
				can.dev.warn('can/view/stache/mustache_core.js: Unable to find helper "' + methodKey + '".');
			} else {
				can.dev.warn('can/view/stache/mustache_core.js: Unable to find key or helper "' + methodKey + '".');
			}
		}
		//!steal-remove-end
		
		return {
			value: value,
			args: args,
			helper: helper && helper.fn
		};
	};
	MethodExpression.prototype.evaluator = function(helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly){


		var helperOptionArg = {
			fn: function () {},
			inverse: function () {}
		},
			context = scope.attr("."),
			args = this.args(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly),
			hash = this.hash(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);

		// Add additional data to be used by helper functions
		convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);

		can.simpleExtend(helperOptionArg, {
			context: context,
			scope: scope,
			contexts: scope,
			hash: hash,
			nodeList: nodeList,
			exprData: this,
			helperOptions: helperOptions,
			helpers: helperOptions
		});

		args.push(helperOptionArg);
		// Call the helper.
		return function () {
			return helper.apply(context, args) || '';
		};

		
	};

	MethodExpression.prototype.value = function(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly) {
		var helperAndValue = this.helperAndValue(scope, helperOptions, readOptions);
		
		var helper = helperAndValue.helper;
		// a method could have been called, resulting in a value
		if(!helper) {
			return helperAndValue.value;
		}
		
		var fn = this.evaluator(helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
		
		var compute = can.compute(fn);
		
		can.compute.temporarilyBind(compute);
		
		if (!compute.computeInstance.hasDependencies) {
			return compute();
		} else {
			return compute;
		}
	};
	
	
	
	
	var core = {
		
		Expression: Expression,
		ScopeExpression: ScopeExpression,
		MethodExpression: MethodExpression,
		
		// ## mustacheCore.expressionData
		// Returns processed information about the arguments and hash in a mustache expression.
		/**
		 * @hide
		 * Returns processed information about the arguments and hash in a mustache expression.
		 * @param {can.mustache.Expression} An expression minus the mode like: `each items animate="in"`
		 * @return {Object} Packaged info about the expression for faster processing.
		 * @option {can.mustache.Lookup|*} name The first key which is usually the name of a value or a helper to lookup.
		 * @option {Array<can.mustache.Lookup|*>} args An array of lookup values or JS literal values.
		 * @option {Object.<String,can.mustache.Lookup|*>} hashes A mapping of hash name to lookup values or JS literal values.
		 */
		expressionData: function(expression){
			var tokens = this.expressionDataTokenize(expression);
			return this._expressionData(tokens, {index: 0});
		},
		_expressionData: function(tokens, cursor){
			var name;
			var args = [];
			var hashes = {};
			while(cursor.index < tokens.length) {
				var token = tokens[cursor.index],
					nextToken = tokens[cursor.index+1],
					futureToken = tokens[cursor.index+2];
				
				if(token === "(") {
					cursor.index++;
					args.push( this._expressionData(tokens, cursor) );
				} else if(token === ")") {
					cursor.index++;
					return new MethodExpression(name, args, hashes);
				}
				// foo=bar
				else if( nextToken === "=" ) {
					cursor.index++;
					cursor.index++;
					cursor.index++;
					if(futureToken === "(") {
						hashes[token] = this._expressionData(tokens, cursor);
					} else {
						
						hashes[token] = literalRegExp.test( futureToken ) ?
							new Expression(utils.jsonParse( futureToken )) :
							new ScopeExpression(futureToken);
					}
				} else {
					cursor.index++;
					if(name === undefined) {
						name = new ScopeExpression(token);
					} else {
						args.push( literalRegExp.test( token ) ?
							new Expression(utils.jsonParse( token )) :
							new ScopeExpression(token) );
					}
					
				}
			}
			return new MethodExpression(name, args, hashes);
		},
		expressionDataTokenize: function(expression){
			var tokens = [];
			(can.trim(expression) + ' ').replace(argumentsRegExp, function (whole, arg) {
				tokens.push(arg);
			});
			return tokens;
		},
		// ## mustacheCore.makeEvaluator
		// Given a scope and expression, returns a function that evaluates that expression in the scope.
		//
		// This function first reads lookup values in the args and hash.  Then it tries to figure out
		// if a helper is being called or a value is being read.  Finally, depending on
		// if it's a helper, or not, and which mode the expression is in, it returns
		// a function that can quickly evaluate the expression.
		/**
		 * @hide
		 * Given a mode and expresion data, returns a function that evaluates that expression.
		 * @param {can.view.Scope} The scope in which the expression is evaluated.
		 * @param {can.view.Options} The option helpers in which the expression is evaluated.
		 * @param {String} mode Either null, #, ^. > is handled elsewhere
		 * @param {Object} exprData Data about what was in the mustache expression
		 * @param {renderer} [truthyRenderer] Used to render a subsection
		 * @param {renderer} [falseyRenderer] Used to render the inverse subsection
		 * @param {String} [stringOnly] A flag to indicate that only strings will be returned by subsections.
		 * @return {Function} An 'evaluator' function that evaluates the expression.
		 */
		makeEvaluator: function (scope, helperOptions, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {

			if(mode === "^") {
				var temp = truthyRenderer;
				truthyRenderer = falseyRenderer;
				falseyRenderer = temp;
			}
			
			var readOptions = {
				// will return a function instead of calling it.
				// allowing it to be turned into a compute if necessary.
				isArgument: true,
				args: [scope.attr('.'), scope],
				asCompute: true
			};
			var helperAndValue = exprData.helperAndValue(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
			var helper = helperAndValue.helper;
			var value = helperAndValue.value;
		
			if(helper) {
				return exprData.evaluator(helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
			}
			
		
			// Return evaluators for no mode.
			if(!mode) {
				// If it's computed, return a function that just reads the compute.
				if(value && value.isComputed) {
					return value;
				}
				// Just return value as the value
				else {

					return function(){
						return '' + (value != null ? value : '');
					};
				}
			} else if( mode === "#" || mode === "^" ) {
				// Setup renderers.
				var helperOptionArg = {
					fn: function () {},
					inverse: function () {}
				};
				convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);
				return function(){
					// Get the value
					var finalValue;
					if (can.isFunction(value) && value.isComputed) {
						finalValue = value();
					} else {
						finalValue = value;
					}
					// If it's an array, render.
					if (utils.isArrayLike(finalValue) ) {
						var isObserveList = utils.isObserveLike(finalValue);

						if(isObserveList ? finalValue.attr("length") : finalValue.length) {
							return (stringOnly ? getItemsStringContent: getItemsFragContent  )
								(finalValue, isObserveList, helperOptionArg, helperOptions );
						} else {
							return helperOptionArg.inverse(scope, helperOptions);
						}
					}
					// If truthy, render fn, otherwise, inverse.
					else {
						return finalValue ? helperOptionArg.fn(finalValue || scope, helperOptions) : helperOptionArg.inverse(scope, helperOptions);
					}
				};
			} else {
				// not supported!
			}
		},
		// ## mustacheCore.makeLiveBindingPartialRenderer
		// Returns a renderer function that live binds a partial.
		/**
		 * @hide
		 * Returns a renderer function that live binds a partial.
		 * @param {String} partialName the name of the partial.
		 * @return {function(this:HTMLElement,can.view.Scope,can.view.Options)} A renderer function
		 * live binds a partial.
		 */
		makeLiveBindingPartialRenderer: function(partialName, state){
			partialName = can.trim(partialName);

			return function(scope, options, parentSectionNodeList){

				var nodeList = [this];
				nodeList.expression = ">" + partialName;
				nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true :  true);

				var partialFrag = can.compute(function(){
					var localPartialName = partialName;
						// Look up partials in options first.
					var partial = options.attr("partials." + localPartialName),
						res;
					if (partial) {
						res = partial.render ? partial.render(scope, options) :
							partial(scope, options);
					}
					// Use can.view to get and render the partial.
					else {
						var scopePartialName = scope.read(localPartialName, {
							isArgument: true
						}).value;

						if (scopePartialName === null) {
							return can.frag("");
						}
						if (scopePartialName) {
							localPartialName = scopePartialName;
						}

						res = can.isFunction(localPartialName) ? localPartialName(scope, options)
							: can.view.render(localPartialName, scope, options );
					}
					return can.frag(res);

				});

				live.html(this, partialFrag, this.parentNode, nodeList);

			};
		},
		// ## mustacheCore.makeStringBranchRenderer
		// Return a renderer function that evalutes to a string and caches
		// the evaluator on the scope.
		/**
		 * @hide
		 * Return a renderer function that evaluates to a string.
		 * @param {String} mode
		 * @param {can.mustache.Expression} expression
		 * @return {function(can.view.Scope,can.view.Options, can.view.renderer, can.view.renderer)}
		 */
		makeStringBranchRenderer: function(mode, expression){
			var exprData = core.expressionData(expression),
				// Use the full mustache expression as the cache key.
				fullExpression = mode+expression;

			// A branching renderer takes truthy and falsey renderer.
			return function branchRenderer(scope, options, truthyRenderer, falseyRenderer){
				// Check the scope's cache if the evaluator already exists for performance.
				var evaluator = scope.__cache[fullExpression];
				if(mode || !evaluator) {
					evaluator = makeEvaluator( scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
					if(!mode) {
						scope.__cache[fullExpression] = evaluator;
					}
				}

				// Run the evaluator and return the result.
				var res = evaluator();
				return res == null ? "" : ""+res;
			};
		},
		// ## mustacheCore.makeLiveBindingBranchRenderer
		// Return a renderer function that evaluates the mustache expression and
		// sets up live binding if a compute with dependencies is found. Otherwise,
		// the element's value is set.
		//
		// This function works by creating a `can.compute` from the mustache expression.
		// If the compute has dependent observables, it passes the compute to `can.view.live`; otherwise,
		// it updates the element's property based on the compute's value.
		/**
		 * @hide
		 * Returns a renderer function that evaluates the mustache expression.
		 * @param {String} mode
		 * @param {can.mustache.Expression} expression
		 * @param {Object} state The html state of where the expression was found.
		 */
		makeLiveBindingBranchRenderer: function(mode, expression, state){

			// Pre-process the expression.
			var exprData = core.expressionData(expression);

			// A branching renderer takes truthy and falsey renderer.
			return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer){

				var nodeList = [this];
				nodeList.expression = expression;
				// register this nodeList.
				// Regsiter it with its parent ONLY if this is directly nested.  Otherwise, it's unencessary.
				nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true :  true);


				// Get the evaluator. This does not need to be cached (probably) because if there
				// an observable value, it will be handled by `can.view.live`.
				var evaluator = makeEvaluator( scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer,
					// If this is within a tag, make sure we only get string values.
					state.tag );

				// Create a compute that can not be observed by other
				// comptues. This is important because this renderer is likely called by
				// parent expresions.  If this value changes, the parent expressions should
				// not re-evaluate. We prevent that by making sure this compute is ignored by
				// everyone else.
				var compute = can.compute(evaluator, null, false);
				// Bind on the compute to set the cached value. This helps performance
				// so live binding can read a cached value instead of re-calculating.
				compute.bind("change", can.k);
				var value = compute();

				// If value is a function, it's a helper that returned a function.
				if(typeof value === "function") {

					// A helper function should do it's own binding.  Similar to how
					// we prevented this function's compute from being noticed by parent expressions,
					// we hide any observables read in the function by saving any observables that
					// have been read and then setting them back which overwrites any `can.__observe` calls
					// performed in value.
					var old = can.__clearObserved();
					value(this);
					can.__setObserved(old);

				}
				// If the compute has observable dependencies, setup live binding.
				else if( compute.computeInstance.hasDependencies ) {

					// Depending on where the template is, setup live-binding differently.
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					}
					else if( state.tag )  {
						live.attributes( this, compute );
					}
					else if(state.text && typeof value !== "object"){
						live.text(this, compute, this.parentNode, nodeList);
					}
					else {
						live.html(this, compute, this.parentNode, nodeList);
					}
				}
				// If the compute has no observable dependencies, just set the value on the element.
				else {

					if(state.attr) {
						can.attr.set(this, state.attr, value);
					}
					else if(state.tag) {
						live.setAttributes(this, value);
					}
					else if(state.text && typeof value === "string") {
						this.nodeValue = value;
					}
					else if( value ){
						elements.replace([this], can.frag(value, this.ownerDocument));
					}
				}
				// Unbind the compute.
				compute.unbind("change", can.k);
			};
		},
		// ## mustacheCore.splitModeFromExpression
		// Returns the mustache mode split from the rest of the expression.
		/**
		 * @hide
		 * Returns the mustache mode split from the rest of the expression.
		 * @param {can.mustache.Expression} expression
		 * @param {Object} state The state of HTML where the expression was found.
		 */
		splitModeFromExpression: function(expression, state){
			expression = can.trim(expression);
			var mode = expression.charAt(0);

			if( "#/{&^>!".indexOf(mode) >= 0 ) {
				expression = can.trim( expression.substr(1) );
			} else {
				mode = null;
			}
			// Triple braces do nothing within a tag.
			if(mode === "{" && state.node) {
				mode = null;
			}
			return {
				mode: mode,
				expression: expression
			};
		},
		// ## mustacheCore.cleanLineEndings
		// Removes line breaks accoding to the mustache specification.
		/**
		 * @hide
		 * Prunes line breaks accoding to the mustache specification.
		 * @param {String} template
		 * @return {String}
		 */
		cleanLineEndings: function(template){

			// Finds mustache tags with space around them or no space around them.
			return template.replace( mustacheLineBreakRegExp,
				function(whole,
					returnBefore,
					spaceBefore,
					special,
					expression,
					spaceAfter,
					returnAfter,
					// A mustache magic tag that has no space around it.
					spaceLessSpecial,
					spaceLessExpression,
					matchIndex){

				// IE 8 will provide undefined
				spaceAfter = (spaceAfter || "");
				returnBefore = (returnBefore || "");
				spaceBefore = (spaceBefore || "");

				var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression,{});

				// If it's a partial or tripple stache, leave in place.
				if(spaceLessSpecial || ">{".indexOf( modeAndExpression.mode) >= 0) {
					return whole;
				}  else if( "^#!/".indexOf(  modeAndExpression.mode ) >= 0 ) {

					// Return the magic tag and a trailing linebreak if this did not
					// start a new line and there was an end line.
					return special+( matchIndex !== 0 && returnAfter.length ? returnBefore+"\n" :"");


				} else {
					// There is no mode, return special with spaces around it.
					return spaceBefore+special+spaceAfter+(spaceBefore.length || matchIndex !== 0 ? returnBefore+"\n" : "");
				}

			});
		},
		// ## can.view.Options
		//
		// This contains the local helpers, partials, and tags available to a template.
		/**
		 * @hide
		 * The Options scope.
		 */
		Options: can.view.Scope.extend({
			init: function (data, parent) {
				if (!data.helpers && !data.partials && !data.tags) {
					data = {
						helpers: data
					};
				}
				can.view.Scope.prototype.init.apply(this, arguments);
			}
		})
	};

	// ## Local Variable Cache
	//
	// The following creates slightly more quickly accessible references of the following
	// core functions.
	var makeEvaluator = core.makeEvaluator,
		splitModeFromExpression = core.splitModeFromExpression;

	can.view.mustacheCore = core;
	return core;
});



