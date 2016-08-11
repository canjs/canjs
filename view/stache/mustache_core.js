// # can/view/stache/mustache_core.js
//
// This provides helper utilities for Mustache processing. Currently,
// only stache uses these helpers.  Ideally, these utilities could be used
// in other libraries implementing Mustache-like features.

steal("can/util",
	"./utils",
	"./mustache_helpers",
	"./expression.js",
	"can/view/live",
	"can/view/elements.js",
	"can/view/scope",
	"can/view/node_lists",
	function(can, utils, mustacheHelpers, expression, live, elements, Scope, nodeLists ){

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

	var mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,
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
		k = function(){};





	var core = {
		expression: expression,
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

			var value,
				helperOptionArg;

			if(exprData instanceof expression.Call) {
				helperOptionArg =  {
					fn: function () {},
					inverse: function () {},
					context: scope.attr("."),
					scope: scope,
					nodeList: nodeList,
					exprData: exprData,
					helpersScope: helperOptions
				};
				utils.convertToScopes(helperOptionArg, scope,helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);

				value = exprData.value(scope, helperOptions, helperOptionArg);
				if(exprData.isHelper) {
					return value;
				}
			} else {
				var readOptions = {
					// will return a function instead of calling it.
					// allowing it to be turned into a compute if necessary.
					isArgument: true,
					args: [scope.attr('.'), scope],
					asCompute: true
				};
				var helperAndValue = exprData.helperAndValue(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
				var helper = helperAndValue.helper;
				value = helperAndValue.value;

				if(helper) {
					return exprData.evaluator(helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
				}
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
				helperOptionArg = {
					fn: function () {},
					inverse: function () {}
				};
				utils.convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
				return function(){
					// Get the value
					var finalValue;
					if (can.isFunction(value) && value.isComputed) {
						finalValue = value();
					} else {
						finalValue = value;
					}
					if(typeof finalValue === "function") {
						return finalValue;
					}
					// If it's an array, render.
					else if (utils.isArrayLike(finalValue) ) {
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
				nodeLists.register(nodeList, null, parentSectionNodeList || true, state.directlyNested);

				var partialFrag = can.compute(function(){
					var localPartialName = partialName;
						// Look up partials in options first.
					var partial = options.attr("partials." + localPartialName), renderer;
					if (partial) {
						renderer = function() {
							return partial.render ? partial.render(scope, options, nodeList)
								: partial(scope, options);
						};
					}
					// Use can.view to get and render the partial.
					else {
						var scopePartialName = scope.read(localPartialName, {
							isArgument: true
						}).value;

						if (scopePartialName === null || !scopePartialName && localPartialName[0] === '*') {
							return can.frag("");
						}
						if (scopePartialName) {
							localPartialName = scopePartialName;
						}

						renderer = function() {
							return can.isFunction(localPartialName) ? localPartialName(scope, options, nodeList)
								: can.view.render(localPartialName, scope, options, nodeList);
						};
					}
					var res = can.__notObserve(renderer)();
					return can.frag(res);
				});

				partialFrag.computeInstance.setPrimaryDepth(nodeList.nesting);

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
		makeStringBranchRenderer: function(mode, expressionString){
			var exprData = core.expression.parse(expressionString),
				// Use the full mustache expression as the cache key.
				fullExpression = mode+expressionString;

			// convert a lookup like `{{value}}` to still be called as a helper if necessary.
			if(!(exprData instanceof expression.Helper) && !(exprData instanceof expression.Call)) {
				exprData = new expression.Helper(exprData,[],{});
			}

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
		makeLiveBindingBranchRenderer: function(mode, expressionString, state){

			// Pre-process the expression.
			var exprData = core.expression.parse(expressionString);
			if(!(exprData instanceof expression.Helper) && !(exprData instanceof expression.Call)) {
				exprData = new expression.Helper(exprData,[],{});
			}
			// A branching renderer takes truthy and falsey renderer.
			return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer){

				var nodeList = [this];
				nodeList.expression = expressionString;
				// register this nodeList.
				// Regsiter it with its parent ONLY if this is directly nested.  Otherwise, it's unencessary.
				nodeLists.register(nodeList, null, parentSectionNodeList || true, state.directlyNested);


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
				//var compute = can.compute(evaluator, null, false);
				var gotCompute = evaluator.isComputed,
					compute;
				if(gotCompute) {
					compute = evaluator;
				} else {
					compute = can.compute(evaluator, null, false);
				}

				compute.computeInstance.setPrimaryDepth(nodeList.nesting);

				// Bind on the compute to set the cached value. This helps performance
				// so live binding can read a cached value instead of re-calculating.
				compute.computeInstance.bind("change", k);

				var value = compute();

				// If value is a function, it's a helper that returned a function.
				if(typeof value === "function") {

					// A helper function should do it's own binding.  Similar to how
					// we prevented this function's compute from being noticed by parent expressions,
					// we hide any observables read in the function by saving any observables that
					// have been read and then setting them back which overwrites any `can.__observe` calls
					// performed in value.
					can.__notObserve(value)(this);

				}
				// If the compute has observable dependencies, setup live binding.
				else if(gotCompute || compute.computeInstance.hasDependencies ) {

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
					else if( value != null ){
						elements.replace([this], can.frag(value, this.ownerDocument));
					}
				}
				// Unbind the compute.
				compute.computeInstance.unbind("change", k);
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
		Options: utils.Options
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
