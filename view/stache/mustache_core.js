steal("can/util", 
	"./utils",
	"./mustache_helpers",
	"can/view/live",
	"can/view/scope",function(can, utils, mustacheHelpers, live, Scope ){
	
	
	
	var Options = can.view.Scope.extend({
		init: function (data, parent) {
			if (!data.helpers && !data.partials && !data.tags) {
				data = {
					helpers: data
				};
			}
			can.view.Scope.prototype.init.apply(this, arguments);
		}
	});
	
	var emptyHandler = function(){},
		argumentsRegExp = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
		literalNumberStringBooleanRegExp = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/,
		isLookup = function (obj) {
			return obj && typeof obj.get === "string";
		},
		makeConvertToScopes = function (renderer, scope, options) {
			return function (updatedScope, updatedOptions) {
				if (updatedScope !== undefined && !(updatedScope instanceof can.view.Scope)) {
					updatedScope = scope.add(updatedScope);
				}
				if (updatedOptions !== undefined && !(updatedOptions instanceof Options)) {
					updatedOptions = options.add(updatedOptions);
				}
				return renderer(updatedScope, updatedOptions || options);
			};
		},
		getStashArgsAndHash = function(text){
			var args = [],
				hashes = {},
				i = 0;
			
			(can.trim(text) + ' ').replace(argumentsRegExp, function (whole, arg) {
				var m;
				// Check for special helper arguments (string/number/boolean/hashes).
				if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
					if(m[1] || m[2]) {
						args.push(utils.jsonParse(m[1] || m[2]));
					}
					// Found a hash object.
					else {
						// Addd to the hash object.
						hashes[m[3]] =  (m[6] ?  {get: m[6]} :  utils.jsonParse(m[4] || m[5]));
					}
				}
				// Otherwise output a normal interpolation reference.
				else {
					args.push({get: arg});
				}
				i++;
			});
			
			return {
				name: args.shift(),
				args: args,
				hash: hashes
			};
		},
		// Given some mustache mode, text, and state, returns a function that 
		// mode = "#"
		// text = "each todos"
		// state = {tag: "ul"}
		
		// Process a mustache magic tag.
		// @param {can.view.Scope}
		// @param {can.view.Options}
		// @param {String} mode either null, #, ^. > is handled elsewhere
		// @param {Object} arged data about what was in the magic tag
		// @param {renderer} [truthyRenderer] used to render a subsection 
		// @param {renderer} [falseyRenderer] used to render the inverse subsection
		// @param {String} [stringOnly] A flag to indicate that only strings will be returned by subsections.
		process = function (scope, options, mode, arged, truthyRenderer, falseyRenderer, stringOnly) {

			// here we are going to cache the lookup values so future calls are much faster
			var args = [],
				helperOptions = {
					fn: function () {},
					inverse: function () {}
				},
				hash = {},
				context = scope.attr("."),
				getHelper = true,
				name = arged.name,
				argLookups = arged.args,
				hashLookups = arged.hash,
				helper;
				
			// convert lookup values to actual values in name, arguments, and hash
			for(var i = 0, len = argLookups.length; i < len; i++) {
				var arg = argLookups[i];
				if (arg && isLookup(arg)) {
					args.push(getKey(arg.get, scope, options, false, true));
				} else {
					args.push(arg);
				}
			}
			for(var prop in hashLookups) {
				if (isLookup(hashLookups[prop])) {
					hash[prop] = getKey(hashLookups[prop].get, scope, options);
				} else {
					hash[prop] = hashLookups[prop]
				}
			}

			if (isLookup(name)) {
				var get = name.get;
				name = getKey(name.get, scope, options, args.length, false);

				// Base whether or not we will get a helper on whether or not the original
				// name.get and getKey resolve to the same thing. Saves us from running
				// into issues like {{text}} / {text: 'with'}
				getHelper = (get === name);
			}
			if(mode === "^") {
				var temp = truthyRenderer;
				truthyRenderer = falseyRenderer;
				falseyRenderer = temp;
			}
			// overwrite fn and inverse to always convert to scopes
			if(truthyRenderer) {
				helperOptions.fn = makeConvertToScopes(truthyRenderer, scope, options);
			}
			if(falseyRenderer) {
				helperOptions.inverse = makeConvertToScopes(falseyRenderer, scope, options);
			}
			//helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);

			// Check for a registered helper or a helper-like function.
			if (helper = (getHelper && (typeof name === "string" && mustacheHelpers.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
				fn: name
			}))) {
				// Add additional data to be used by helper functions

				can.extend(helperOptions, {
					context: context,
					scope: scope,
					contexts: scope,
					hash: hash
				});

				args.push(helperOptions);
				// Call the helper.
				return function () {
					return helper.fn.apply(context, args) || '';
				};

			}
			return function () {

				var value;
				if (can.isFunction(name) && name.isComputed) {
					value = name();
				} else {
					value = name;
				}
				if (mode === "#" || mode === "^") {
					if (utils.isArrayLike(value) ) {
						var isObserveList = utils.isObserveLike(value),
							frag = document.createDocumentFragment();
						if(isObserveList ? value.attr("length") : value.length) {
							return (stringOnly ? getItemsStringContent: getItemsFragContent  )
								(value, isObserveList, helperOptions, options);
						} else {
							return helperOptions.inverse(scope, options);
						}
						// Add the reference to the list in the contexts.
						
						
					}
					// Normal case.
					else {
						return value ? helperOptions.fn(value || scope, options) : helperOptions.inverse(scope, options);
					}
				} else {
					return '' + (value != null ? value : '');
				}
			};
		},
		getItemsFragContent = function(items, isObserveList, helperOptions, options){
			var frag = document.createDocumentFragment();
			for (var i = 0, len = items.length; i < len; i++) {
				append(frag, helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options) );
			}
			return frag;
		},
		getItemsStringContent = function(items, isObserveList, helperOptions, options){
			var txt = "";
			for (var i = 0, len = items.length; i < len; i++) {
				txt += helperOptions.fn( isObserveList ? items.attr('' + i) : items[i], options);
			}
			return txt;
		},
		append = function(frag, content){
			content && frag.appendChild(typeof content === "string" ? document.createTextNode(content) : content);
		},
		getKey = function (key, scope, options, isHelper, isArgument) {

			// Cache a reference to the current context and options, we will use them a bunch.
			var context = scope.attr('.'),
				options = options || {};

			// If key is called as a helper,
			if (isHelper) {
				// try to find a registered helper.
				if (mustacheHelpers.getHelper(key, options)) {
					return key;
				}
				// Support helper-like functions as anonymous helpers.
				// Check if there is a method directly in the "top" context.
				if (scope && can.isFunction(context[key])) {
					return context[key];
				}

			}

			// Get a compute (and some helper data) that represents key's value in the current scope
			var computeData = scope.computeData(key, {
				isArgument: isArgument,
				args: [context, scope]
			}),
				compute = computeData.compute;

			// Bind on the compute to cache its value. We will unbind in a timeout later.
			can.compute.temporarilyBind(compute);

			// computeData gives us an initial value
			var initialValue = computeData.initialValue;

			// Use helper over the found value if the found value isn't in the current context
			if ((initialValue === undefined) && mustacheHelpers.getHelper(key, options)) {
				return key;
			}

			// If there are no dependencies, just return the value.
			if (!compute.hasDependencies) {
				return initialValue;
			} else {
				return compute;
			}
		};
	
	var core = {
		makeLiveBindingPartialRenderer: function(partialName){
			partialName = can.trim(partialName);
			return function(scope, options){
				var partial = options.attr("partials." + partialName),
					res;
				if (partial) {
					res = partial.render ? partial.render(scope, options) :
						partial(scope, options);
				} else {
					res = can.view.render(partialName, scope /*, options*/ );
				}
				
				live.replace([this], res)
			}
			
		},
		makeStringBranchRenderer: function(mode, text){
			var arged = getStashArgsAndHash(text);
			return function processor(scope, options, truthyRenderer, falseyRenderer){
				// TODO: We should be able to cache the evaluators
				var evaluator = process( scope, options, mode, arged, truthyRenderer, falseyRenderer, true)
				var res = evaluator();
				return res == null ? "" : ""+res;
			}
		},
		makeLiveBindingBranchRenderer: function(mode, text, state){
			// lets find out what 
			var arged = getStashArgsAndHash(text);
			
			
			return function processor(scope, options, truthyRenderer, falseyRenderer){
				
				var result = process( scope, options, mode, arged, truthyRenderer, falseyRenderer, state.tag );
				
				var compute = can.compute(result, this, false);
				compute.bind("change", emptyHandler);
				var value = compute();
				
				if(typeof value === "function") {
					// make sure this does not read anything.
					var old = can.__clearReading();
					value(this)
					can.__setReading(old);
				} else if( compute.hasDependencies ) {
					
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} 
					else if( state.tag )  {
						live.attributes( this, compute );
					}
					else if(state.text && typeof value !== "object"){
						live.text(this, compute, this.parentNode);
					} 
					else {
						live.html(this, compute, this.parentNode);
					}
				} else {
					
					if(state.attr) {
						can.attr.set(this, state.attr, value);
					} 
					else if(state.tag) {
						live.setAttributes(this, value)
					} 
					else if(state.text && typeof value === "string") {
						this.nodeValue = value;
					} 
					else if( value ){
						live.replace([this], value)
					}
				}
				compute.unbind("change", emptyHandler);
			};
		},
		getModeAndText: function(text, state){
			var text = can.trim(text),
				mode = text[0];
	
			if( "#/{&^>!".indexOf(mode) >= 0 ) {
				text = can.trim( text.substr(1) );
			} else {
				mode = null;
			}
			// triple braces do nothing within a tag
			if(mode === "{" && state.node) {
				mode = null;
			}
			return {
				mode: mode,
				text: text
			};
		},
		cleanLineEndings: function(template){
			var stack = [];
			
			return template.replace( /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g, 
				function(whole, returnChar, spaceBefore, special,innerSpecial, spaceAfter,ending, spaceLessSpecial, spaceLessInnerSpecial, startLocation){
				
				var modeAndText = core.getModeAndText(innerSpecial || spaceLessInnerSpecial,{}),
					endingSectionType;
				
				if(modeAndText.mode == "#") {
					stack.push("#")
				} else if(modeAndText.mode === "^"){
					stack.push("^")
				} else if(modeAndText.mode === "/"){
					endingSectionType = stack.pop();
				}
				if(spaceLessSpecial || modeAndText.mode === ">" || modeAndText.mode === "{") {
					return whole;
				} if( modeAndText.mode === "^" || modeAndText.mode === "#" || modeAndText.mode === "!" || endingSectionType) {
					
					return special+
						
						(
							// If this was not first line and there was a \n, 
							startLocation != 0 && ending.length
							// keep the \n;
							? returnChar+"\n" : 
							// otherwise, remove it.
							"");
				} else {
					return spaceBefore+special+spaceAfter+(spaceBefore.length || startLocation != 0 ? returnChar+"\n" : "");
				}
				
			})
		},
		Options: Options
	};
	return core;
})
