steal("can/view/parser","can/view/target", "can/view/live","can/view/scope",function(parser, target, live, Scope){
	
	var argumentsRegExp = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
		literalNumberStringBooleanRegExp = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,
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
		isArrayLike = function (obj) {
			return obj && obj.splice && typeof obj.length === 'number';
		},
		isObserveLike = function (obj) {
			return obj instanceof can.Map || (obj && !! obj._get);
		},
		emptyHandler = function(){},
		getStashArgsAndHash = function(text){
			var args = [],
				hashes = {},
				i = 0;
			
			(can.trim(text) + ' ').replace(argumentsRegExp, function (whole, arg) {
				var m;
				// Check for special helper arguments (string/number/boolean/hashes).
				if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
					// Found a native type like string/number/boolean.
					if (m[2]) {
						args.push(m[0]);
					}
					// Found a hash object.
					else {
						// Addd to the hash object.
						hashes[m[4]] =  (m[6] ? m[6] : {get: m[5]});
					}
				}
				// Otherwise output a normal interpolation reference.
				else {
					args.push({get: arg});
				}
				i++;
			});
			return {
				args: args,
				hash: hashes
			};
		},
		stashValueProcessor = function(mode, text){
			var arged = getStashArgsAndHash(text),
				evaluator;
			return function processor(scope, options, truthyRenderer){
				if(!evaluator) {
					evaluator = process( scope, options, mode, arged.args, arged.hash, truthyRenderer )
				}
				return evaluator();
			}
		},
		// Given some mustache mode, text, and state, returns a function that 
		stashProcessor = function(mode, text, state){
			// lets find out what 
			var arged = getStashArgsAndHash(text);
			
			
			return function processor(scope, options, truthyRenderer){
				var result = process( scope, options, mode, arged.args, arged.hash, truthyRenderer );
				
				var compute = can.compute(result, this, false);
				compute.bind("change", emptyHandler);
				var value = compute();
				
				if(typeof value === "function") {
					value(this)
				} else if( compute.hasDependencies ) {
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} else {
						live.html(this, compute, this.parentNode);
					}
				} else {
					if(state.attr) {
						can.attr.set(this, state.attr, value);
						
					} else {
						live.replace([this], value)
					}
				}
				compute.unbind("change", emptyHandler);
			};
		},
		getKey = function (key, scope, options, isHelper, isArgument) {

			// Cache a reference to the current context and options, we will use them a bunch.
			var context = scope.attr('.'),
				options = options || {};

			// If key is called as a helper,
			if (isHelper) {
				// try to find a registered helper.
				if (stash.getHelper(key, options)) {
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
			if ((initialValue === undefined) && stash.getHelper(key, options)) {
				return key;
			}

			// If there are no dependencies, just return the value.
			if (!compute.hasDependencies) {
				return initialValue;
			} else {
				return compute;
			}
		},
		process = function (scope, options, mode, argLookups, hashLookups, renderer) {

			// here we are going to cache the lookup values so future calls are much faster
			var args = [],
				helperOptions = {
					fn: function () {},
					inverse: function () {}
				},
				hash = {},
				context = scope.attr("."),
				getHelper = true,
				helper,
				name = argLookups.shift();

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
			
			// overwrite fn and inverse to always convert to scopes
			if(renderer) {
				helperOptions.fn = makeConvertToScopes(renderer, scope, options);
			}
			
			//helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);

			// Check for a registered helper or a helper-like function.
			if (helper = (getHelper && (typeof name === "string" && stash.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
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
				// An array of arguments to check for truthyness when evaluating sections.
				var validArgs = args.length ? args : [value],
					// Whether the arguments meet the condition of the section.
					valid = true,
					result = [],
					i, argIsObserve, arg;
				// Validate the arguments based on the section mode.
				if (mode) {
					for (i = 0; i < validArgs.length; i++) {
						arg = validArgs[i];
						argIsObserve = typeof arg !== 'undefined' && isObserveLike(arg);
						// Array-like objects are falsey if their length = 0.
						if (isArrayLike(arg)) {
							// Use .attr to trigger binding on empty lists returned from function
							if (mode === '#') {
								valid = valid && !! (argIsObserve ? arg.attr('length') : arg.length);
							} else if (mode === '^') {
								valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
							}
						}
						// Otherwise just check if it is truthy or not.
						else {
							valid = mode === '#' ? valid && !! arg : mode === '^' ? valid && !arg : valid;
						}
					}
				}

				// Otherwise interpolate like normal.
				if (valid) {

					if (mode === "#") {
						if (isArrayLike(value)) {
							var isObserveList = isObserveLike(value);

							// Add the reference to the list in the contexts.
							for (i = 0; i < value.length; i++) {
								result.push(helperOptions.fn(
									isObserveList ? value.attr('' + i) : value[i]));
							}
							return result.join('');
						}
						// Normal case.
						else {
							return helperOptions.fn(value || {}) || '';
						}
					} else if (mode === "^") {
						return helperOptions.inverse(value || {}) || '';
					} else {
						return '' + (value != null ? value : '');
					}
				}

				return '';
			};
		};
	
	
	Section = function(process){
		this.targetData = [];
		this.stack = [];
		var self = this;
		this.targetCallback = function(scope, options){
			process.call(this, scope, options, can.proxy(self.compiled.hydrate, self.compiled));
		};
	};
	can.extend(Section.prototype,{
		push: function(data){
			this.add(data);
			this.stack.push(data);
		},
		pop: function(){
			this.stack.pop();
		},
		add: function(data){
			if(this.stack.length) {
				this.stack[this.stack.length-1].children.push(data)
			} else {
				this.targetData.push(data);
			}
		},
		compile: function(){
			this.compiled = target(this.targetData);
			delete this.targetData;
			delete this.stack;
		}
	});
	
	TextSection = function(){
		this.stack = [new TextSubSection()]
	}
	can.extend(TextSection.prototype,{
		addChars: function(chars){
			this.last().addChars(chars)
		},
		addStash: function(mode, stash, state){
			if( !mode ) {
				this.last().addStash(mode, stash, state)
			} else if(mode === "#") {
				var truthySection = new TextSubSection();
				
				this.last()
					.addStash(mode, stash, state)
					.subSection("truthy", truthSection);

				
				this.stack.push(truthySection);
				
			} else if(mode === "/") {
				this.stack.pop();
			} else if(mode === "else") {
				this.stack.pop();
				var falseySection = new TextSubSection();
				this.last().subSection("falsey", falseySection);
				this.stack.push(falseySection);
			}
		},
		last: function(){
			return this.stack[this.stack.length - 1];
		},
		compile: function(state){
			
			console.log("compiling", state.attr)
			var renderer = this.stack[0].compile(),
				compute;
			
			return function(scope, options){
				
				console.log("getting compute", scope.attr(".").attr());
				
				
				var compute = can.compute(function(){
					return renderer(scope, options)
				}, this, false);
				
				compute.bind("change", emptyHandler);
				var value = compute();
				
				if( compute.hasDependencies ) {
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} 
					compute.unbind("change", emptyHandler);
				} else {
					if(state.attr) {
						can.attr.set(this, state.attr, value);
					} 
				}
			}
		}
	})
	
	
	var TextSubSection = function(){
		this.values = [];
	}
	can.extend( TextSubSection.prototype, {
		addChars: function(chars){
			this.values.push(chars)
		},
		addStash: function(mode, stash, state){
			this.values.push({
				mode: mode,
				stash: stash,
				state: state
			});
			return this;
		},
		subSection: function(name, section){
			this.last()[name] = section;
			return this;
		},
		last: function(){
			return this.values[this.values.length - 1];
		},
		compile: function(){
			var values = this.values,
				len = values.length;
			for(var i = 0 ; i < len; i++) {
				var value = this.values[i];
				if(typeof value !== "string") {
					values[i] = (function(process, truthy, falsey){
						return function(scope, options){
							return process.call(this, scope, options, truthy, falsey)
						}
					})( stashValueProcessor(value.mode, value.stash, value.state),
					    value.truthy && value.truthy.compile(), 
					    value.falsey && value.falsey.compile());
				}
			}
			return function(scope, options){
				var txt = "",
					value;
				for(var i = 0; i < len; i++){
					value = values[i];
					txt += typeof value === "string" ? value : value.call(this, scope, options);
				}
				return txt;
			}
		}
	});
	
	var stash = can.stash = function(template){
		var section = new Section();
		var stack = [],
			startSection = function(process){
				var newSection = new Section(process);
				section.add(newSection.targetCallback);
				stack.push(section);
				return section = newSection;
			};
			endSection = function(){
				section.compile();
				section = stack.pop();
			}
		var state = {
			node: null,
			attr: null,
			section: null
		},
			copyState = function(){
				return {
					tag: state.node && state.node.name,
					attr: state.attr && state.attr.name
				}
			}
		
		parser(template,{
			start: function(tagName, unary){
				state.node = {
					tag: tagName,
					children: []
				};
			},
			end: function(tagName, unary){
				if(unary){
					section.add(state.node);
				} else {
					section.push(state.node);
				}
				state.node =null;
			},
			close: function( tag ) {
				section.pop();
			},
			attrStart: function(attrName){
				state.attr = {
					name: attrName,
					value: ""
				};
			},
			attrEnd: function(){
				if(!state.node.attrs) {
					state.node.attrs = {};
				}
				
				state.node.attrs[state.attr.name] = 
					state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;
						
				state.attr = null;
			},
			attrValue: function(value){
				if(state.attr.section) {
					state.attr.section.addChars(value);
				} else {
					state.attr.value += value;
				}
			},
			chars: function( text ) {
				section.add(text);
			},
			special: function( text ){
				
				var first = text[0];
				if(first == "#" || first == "/") {
					text = text.substr(1);
				} else {
					first = null;
				}
				
				if(state.attr) {
					
					if(!state.attr.section) {
						state.attr.section = new TextSection();
						if(state.attr.value) {
							state.attr.section.addChars(state.attr.value)
						}
					}
					state.attr.section.addStash(first, text, copyState())
					
					
				} else {
					
					if(first === "#" ) {
					
						if( state.attr ) {
							
							// state.attr.value = 
							
						} else if( state.tag ) {
							
							
						} else {
							startSection(stashProcessor("#",text, copyState()  ));
						}
						
						// section
						
						
					} else if( first === "/") {
						
						endSection();
						
					} else {
						
						section.add(function(scope, options){
							live.text(this, scope.compute(text), this.parentNode);
						});
					}
				}
				
			},
			comment: function( text ) {
				// create comment node
			}
		});
		
		
		section.compile();
		
		var compiled = section.compiled;
		return function(scope, options){
			if ( !(scope instanceof can.view.Scope) ) {
				scope = new can.view.Scope(scope || {});
			}
			if ( !(options instanceof Options) ) {
				options = new Options(options || {});
			}
			return compiled.hydrate(scope, options);
		};
	};
	
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
	
	var helpers = {};
	can.stash.registerHelper = function(name, callback){
		helpers[name] = callback;
	}
	can.stash.getHelper = function(name, options){
		var helper = options.attr("helpers." + name);
		if(!helper) {
			helper = helpers[name];
		}
		if(helper) {
			return {fn: helper};
		}
	}
	
	can.stash.registerHelper("each", function(items, options){
		return function(el){
			var cb = function (item, index) {
						
						return options.fn(options.scope.add({
								"@index": index
							}).add(item));
							
					};
			live.list(el, items, cb, options.context, el.parentNode);
		}
	})
	
	
	return can.stash;
	
})
