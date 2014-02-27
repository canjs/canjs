steal("can/view/parser","can/view/target", "can/view/live","can/view/scope",function(parser, target, live, Scope){
	
	var argumentsRegExp = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
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
		// Decodes &amp; to & because we always set TextNode content.
		decodeHTML = (function(){
			var el = document.createElement('div');
			return function(html){
			  el.innerHTML = html;
			  return el.childNodes.length === 0 ? "" : el.childNodes[0].nodeValue;
			};
		})(),
		isArrayLike = function (obj) {
			return obj && obj.splice && typeof obj.length === 'number';
		},
		isObserveLike = function (obj) {
			return obj instanceof can.Map || (obj && !! obj._get);
		},
		emptyHandler = function(){},
		last = function(arr){
			return arr[arr.length -1]
		},
		updateLast =  function(arr, value){
			return (arr[arr.length - 1] = value);
		},
		jsonParse = function(str){
			if(str === "undefined") {
				return undefined;
			} else if(window.JSON) {
				return JSON.parse(str);
			} else {
				return eval("("+str+")");
			}
		},
		removeQuotes = function(str){
			return str.substr(1, str.length -2);
		},
		getStashArgsAndHash = function(text){
			var args = [],
				hashes = {},
				i = 0;
			
			(can.trim(text) + ' ').replace(argumentsRegExp, function (whole, arg) {
				var m;
				// Check for special helper arguments (string/number/boolean/hashes).
				if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
					
					// Found a native string.
					if(m[1]) {
						args.push(removeQuotes(m[1]));
					} else if (m[2]) {
						// Found a native type like null, number, or undefined
						args.push(jsonParse(m[2]));
					}
					// Found a hash object.
					else {
						// Addd to the hash object.
						hashes[m[3]] =  (m[6] ?  {get: m[6]} : (
							m[4] ? removeQuotes(m[4]) : jsonParse(m[5])
						));
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
		stashValueProcessor = function(mode, text){
			var arged = getStashArgsAndHash(text),
				evaluator;
			return function processor(scope, options, truthyRenderer, falseyRenderer){
				// TODO: FIGURE OUT A FASTER WAY!
				//if(!evaluator) {
					evaluator = process( scope, options, mode, arged, truthyRenderer, falseyRenderer, true)
				//}
				var res = evaluator();
				return res == null ? "" : ""+res;
			}
		},
		// Given some mustache mode, text, and state, returns a function that 
		// mode = "#"
		// text = "each todos"
		// state = {tag: "ul"}
		stashProcessor = function(mode, text, state){
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
		getKey = function (key, scope, options, isHelper, isArgument) {

			// Cache a reference to the current context and options, we will use them a bunch.
			var context = scope.attr('.'),
				options = options || {};

			// If key is called as a helper,
			if (isHelper) {
				// try to find a registered helper.
				if (stache.getHelper(key, options)) {
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
			if ((initialValue === undefined) && stache.getHelper(key, options)) {
				return key;
			}

			// If there are no dependencies, just return the value.
			if (!compute.hasDependencies) {
				return initialValue;
			} else {
				return compute;
			}
		},
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
			if (helper = (getHelper && (typeof name === "string" && stache.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
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
			/*if( !mode && !args.length && name && name.isComputed ) {
				//if(!scopeAndOptions.special) {
				//	name.canReadForChangeEvent = false;
				//}
				return name;
			}*/
			return function () {

				var value;
				if (can.isFunction(name) && name.isComputed) {
					value = name();
				} else {
					value = name;
				}
				if (mode === "#" || mode === "^") {
					if (isArrayLike(value) ) {
						var isObserveList = isObserveLike(value),
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
		makePartialRenderer = function(partialName){
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
			
		};
		
	
	
	Section = function(process){
		this.data = "targetData";
		this.targetData = [];
		this.stack = [];
		var self = this;
		this.targetCallback = function(scope, options){
			process.call(this, 
				scope, 
				options, 
				can.proxy(self.compiled.hydrate, self.compiled),
				self.inverseCompiled && can.proxy(self.inverseCompiled.hydrate, self.inverseCompiled)  ) ;
		};
	};
	can.extend(Section.prototype,{
		inverse: function(){
			this.inverseData = [];
			this.data = "inverseData"
		},
		push: function(data){
			this.add(data);
			this.stack.push(data);
		},
		pop: function(){
			this.stack.pop();
		},
		add: function(data){
			if(typeof data === "string"){
				data = decodeHTML(data);
			}
			
			
			if(this.stack.length) {
				this.stack[this.stack.length-1].children.push(data)
			} else {
				this[this.data].push(data);
			}
		},
		compile: function(){
			this.compiled = target(this.targetData);
			if(this.inverseData) {
				this.inverseCompiled = target(this.inverseData);
				delete this.inverseData;
			}
			delete this.targetData;
			delete this.stack;
		},
		children: function(){
			if(this.stack.length) {
				return this.stack[this.stack.length-1].children
			} else {
				return this[this.data];
			}
		},
		updateLast: function(handler){
			var children = this.children();
			var lastChild = last(children);
			if(typeof lastChild === "string"){
				updateLast(children, handler( lastChild ) );			
			} else {
				throw "problem"
			}
		},
		cleanLast: function(regExp, replacement){
			var children = this.children();
			var lastChild = last(children);
			if(typeof lastChild === "string"){
				updateLast(children, lastChild.replace(regExp,replacement)  );			
			} else {
				throw "problem"
			}
		}
	});
	
	TextSection = function(){
		this.stack = [new TextSubSection()]
	}
	can.extend(TextSection.prototype,{
		addChars: function(chars){
			this.last().addChars(chars)
		},
		addStash: function(mode, stache, state){
			if( !mode || mode === "{") {
				this.last().addStash(mode, stache, state)
			} else if(mode === "#") {
				var truthySection = new TextSubSection();
				
				this.last()
					.addStash(mode, stache, state)
					.subSection("truthy", truthySection);

				
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
		subSectionDepth: function(){
			return this.stack.length - 1;
		},
		last: function(){
			return this.stack[this.stack.length - 1];
		},
		compile: function(state){
			
			var renderer = this.stack[0].compile(),
				compute;
			
			return function(scope, options){
				
				var compute = can.compute(function(){
					return renderer(scope, options)
				}, this, false);
				
				compute.bind("change", emptyHandler);
				var value = compute();
				
				if( compute.hasDependencies ) {
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} else {
						live.attributes( this, compute );
					}
					compute.unbind("change", emptyHandler);
				} else {
					if(state.attr) {
						can.attr.set(this, state.attr, value);
					} else {
						live.setAttributes(this, value);
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
		addStash: function(mode, stache, state){
			this.values.push({
				mode: mode,
				stache: stache,
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
					})( stashValueProcessor(value.mode, value.stache, value.state),
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
	
	
	// {{{}}}
	
	
	var getModeAndText = function(text, state){
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
	}
	
	var stache = can.stache = function(template){
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
			section: null,
			// True if the previous chars ended the previous line.
			endLine: false,
			// True if the previous character started the previous line.
			startLine: false,
			lastSpecial: false,
			// True if the last token was a special
			lastComment: false,
			// True while we are on the first line.
			firstLine: true,
			// If text should be inserted and HTML escaped
			text: false
		},
			copyState = function(){
				return {
					tag: state.node && state.node.tag,
					attr: state.attr && state.attr.name,
					text: state.text
				}
			},
			clearLines = function(){
				state.lastSpecial = state.text = state.firstLine = state.lastComment = state.startLine = state.endLine = false;
			}
		
		parser(template,{
			start: function(tagName, unary){
				state.node = {
					tag: tagName,
					children: []
				};
				clearLines();
			},
			end: function(tagName, unary){
				if(unary){
					section.add(state.node);
				} else {
					section.push(state.node);
				}
				state.node =null;
				clearLines();
			},
			close: function( tag ) {
				section.pop();
				clearLines();
			},
			attrStart: function(attrName){
				if(state.node.section) {
					state.node.section.addChars(attrName+"=\"")
				} else {
					state.attr = {
						name: attrName,
						value: ""
					};
				}
				
				
				
				clearLines();
			},
			attrEnd: function(){
				if(state.node.section) {
					state.node.section.addChars("\" ");
				} else {
					if(!state.node.attrs) {
						state.node.attrs = {};
					}
					
					state.node.attrs[state.attr.name] = 
						state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;
							
					state.attr = null;
				}
				
				
				
				clearLines();
			},
			attrValue: function(value){
				if(state.node.section) {
					state.node.section.addChars(value)
				} else {
					if(state.attr.section) {
						state.attr.section.addChars(value);
					} else {
						state.attr.value += value;
					}
				}
				

				clearLines();
			},
			chars: function( text ) {
				// If the last thing was a comment, and the thing
				// before that ended the line.
				if(state.lastComment ) {
					// Remove its newLine.
					/*section.cleanLast(/\r?\n?[\s]*$/,"");
					
					// If we are starting another line right away, truncate that.
					var returnCharacterLength = (text[0] === "\n" && 1) || (text.substr(0,2) === "\r\n"  && 2)
					if(returnCharacterLength) {
						state.removeIfLast = returnCharacterLength;
						text = text.substr(returnCharacterLength);
					}*/
					section.updateLast(function(lastChars){
						if(state.firstLine && !/[^\s\n\r]/.test(lastChars)) {
							return lastChars.replace(/[\s]*$/,"") + text.replace(/^\r?\n?[\s]*/,"")
						} else {
							return lastChars + text;
						}
						;
					});
				} else {
					if(state.firstLine && /^\n.+/.test(text) ) {
						text = text.substr(1);
					}
					section.add(text);
				}
				
				
				state.startLine =  text[0] === "\n";
				// if this is the first line and only has spaces, treat like an end line
				state.endLine = !state.lastComment && (
						( state.firstLine && /^[\s]+$/.test(text) )|| /\n[\s]*$/.test(text) );
				// still on first line if only spaces are found (or ! anything other than space)
				state.firstLine = state.firstLine && !/[^\s]/.test(text);
				state.lastComment = false;
			},
			special: function( text ){
				
				// If the previous char ended the line,
				// remove the line break.
				if(state.endLine) {
					section.cleanLast(/(\r?\n)[\s]*$/,"");
				}
				
				
				var firstAndText = getModeAndText(text, state),
					first = firstAndText.mode,
					text = firstAndText.text;
				
				
				if(text === "else") {
					section.inverse();
					return;
				}
				
				if(first === "!") {
					
					
					var firstLine = state.firstLine;
					var endLine = state.endLine;
					clearLines();
					state.firstLine = firstLine;
					state.endLine = endLine;
					state.lastSpecial = state.lastComment = true;
					return;
				}

				if(state.node && state.node.section) {
					
					state.node.section.addStash(first, text , copyState());
					
					if(state.node.section.subSectionDepth() === 0){
						state.node.attributes.push( state.node.section.compile(copyState()) );
						delete state.node.section;
					}
					
				}
				// `{{}}` in an attribute like `class="{{}}"`
				else if(state.attr) {
					
					if(!state.attr.section) {
						state.attr.section = new TextSection();
						if(state.attr.value) {
							state.attr.section.addChars(state.attr.value)
						}
					}
					state.attr.section.addStash(first, text , copyState())
					
				} 
				// `{{}}` in a tag like `<div {{}}>`
				else if(state.node) {
					
					if(!state.node.attributes) {
						state.node.attributes = [];
					}
					if(!first) {
						state.node.attributes.push( stashProcessor( null,text, copyState() ) );
					} else if( first === "#" ) {
						if(!state.node.section) {
							state.node.section = new TextSection();
						}
						state.node.section.addStash(first, text , copyState())
					} else {
						throw first+" is currently not supported within a tag."
					}
					
					
					
				} else {
					if(first === ">") {
						
						section.add(makePartialRenderer(text));
						
					}else if(first === "{" || first === "&") {
						section.add(stashProcessor(null,text, copyState() ));
					} else if(first === "#" || first === "^") {
					
						startSection(stashProcessor(first,text, copyState()  ));
						
					} else if( first === "/") {
						
						endSection();
						
					} else {
						state.text = true;
						section.add(stashProcessor(null,text, copyState() ));
					}
				}
				// Maintain firstLine state
				var firstLine = state.firstLine;
				clearLines();
				state.lastSpecial = true;
				state.firstLine = firstLine;
				//state.lastComment = true;
			},
			comment: function( text ) {
				// create comment node
				section.add({
					comment: text
				})
			},
			done: function(){
				if(state.lastComment && state.endLine ) {
					section.cleanLast(/(\r?\n)[\s]*$/,"");
				}
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
	
	var resolve = function (value) {
		if (isObserveLike(value) && isArrayLike(value) && value.attr('length')) {
			return value;
		} else if (can.isFunction(value)) {
			return value();
		} else {
			return value;
		}
	};
	
	var helpers = {
		"each": function(items, options){
			var resolved = resolve(items),
				result = [],
				keys,
				key,
				i;
			
			if( resolved instanceof can.List || (items && items.isComputed && resolved === undefined)) {
				return function(el){
					var cb = function (item, index) {
								
						return options.fn(options.scope.add({
								"@index": index
							}).add(item));
							
					};
					live.list(el, items, cb, options.context, el.parentNode);
				};
			}
			
			var expr = resolved;

			if ( !! expr && isArrayLike(expr)) {
				for (i = 0; i < expr.length; i++) {
					result.push(options.fn(options.scope.add({
							"@index": i
						})
						.add(expr[i])));
				}
			} else if (isObserveLike(expr)) {
				keys = can.Map.keys(expr);
				// listen to keys changing so we can livebind lists of attributes.

				for (i = 0; i < keys.length; i++) {
					key = keys[i];
					result.push(options.fn(options.scope.add({
							"@key": key
						})
						.add(expr[key])));
				}
			} else if (expr instanceof Object) {
				for (key in expr) {
					result.push(options.fn(options.scope.add({
							"@key": key
						})
						.add(expr[key])));
				}
				
			}
			return result;
			
		},
		'if': function (expr, options) {
			var value;
			// if it's a function, wrap its value in a compute
			// that will only change values from true to false
			if (can.isFunction(expr)) {
				value = can.compute.truthy(expr)();
			} else {
				value = !! resolve(expr);
			}

			if (value) {
				return options.fn(options.scope || this);
			} else {
				return options.inverse(options.scope || this);
			}
		},
		'unless': function (expr, options) {
			if (!resolve(expr)) {
				return options.fn(options.scope || this);
			}
		},
		'with': function (expr, options) {
			var ctx = expr;
			expr = resolve(expr);
			if ( !! expr) {
				return options.fn(ctx);
			}
		},
		'log': function (expr, options) {
			if (console !== undefined) {
				if (!options) {
					console.log(expr.context);
				} else {
					console.log(expr, options.context);
				}
			}
		},
		data: function(attr){
			// options will either be the second or third argument.
			// Get the argument before that.
			var data = arguments.length == 2 ? this : arguments[1];
			
			
			return function(el){
				
				can.data( can.$(el), attr, data || this.context );
			}
		}
	};
	
	can.stache.registerHelper = function(name, callback){
		helpers[name] = callback;
	}
	can.stache.getHelper = function(name, options){
		var helper = options.attr("helpers." + name);
		if(!helper) {
			helper = helpers[name];
		}
		if(helper) {
			return {fn: helper};
		}
	}
	
	stache.safeString = function(text){
		return {
				toString: function () {
					return text;
				}
			};
	}
	
	can.view.register({
		suffix: "stache",

		contentType: "x-stache-template",

		// Returns a `function` that renders the view.

		renderer: function (id, text) {
			return stache(text);
		}
	});
	can.view.ext = ".stache";
	
	return can.stache;
	
})
