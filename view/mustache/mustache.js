steal('can/util',
	  'can/view',
	  'can/view/scanner.js',
	  'can/observe/compute',
	  'can/view/render.js',
function( can ){

	can.view.ext = ".mustache";

	var extend = can.extend,
		CONTEXT = '___c0nt3xt',
		HASH = '___h4sh',
		STACK = '___st4ck',
		// CONTEXT_STACK = '(can.isArray(' + CONTEXT + ') && ' + CONTEXT + '.concat([this])) || [' + CONTEXT + ']',
		CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',
		isObserve = function(obj) {
			return can.isFunction(obj.attr) && obj.constructor && !!obj.constructor.canMakeObserve;
		},
		isArrayLike = function(obj) {
			return obj && obj.splice && typeof obj.length == 'number';
		},
		Mustache = function(options) {
			// Supports calling Mustache without the constructor
			// This returns a function that renders the template.
			if ( this.constructor != Mustache ) {
				var mustache = new Mustache(options);
				return function(data) {
					 return mustache.render(data);
				};
			}

			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}

			// Set options on self.
			extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};

	can.Mustache = window.Mustache = Mustache;

	/** 
	 * @Prototype
	 */
	Mustache.prototype.	 
	/**
	 * Renders an object with view helpers attached to the view.
	 * 
	 *		 new Mustache({text: "<%= message %>"}).render({
	 *			 message: "foo"
	 *		 })
	 *		 
	 * @param {Object} object data to be rendered
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, { _date: object });
	};

	extend(Mustache.prototype, {
		/**
		 * Singleton scanner instance for parsing templates.
		 */
		scanner: new can.view.Scanner({
			/**
			 * Text for injection by the scanner.
			 */
			text: {
				start: 'var ' + CONTEXT + ' = []; ' + CONTEXT + '.' + STACK + ' = true;\
					var ' + STACK + ' = function(context, self) {\
						var s = context && context.' + STACK + ' ? context.concat([self]) : [context];\
						return (s.' + STACK + ' = true) && s;\
					};'
			},
			
			/**
			 * An ordered token registry for the scanner.
			 * This needs to be ordered by priority to prevent token parsing errors.
			 * Each token is defined as: ["token-name", "string representation", "optional regexp override"]
			 */
			tokens: [
				["templateLeft", "{{$"], // Template	 ---- Not supported
				["templateRight", "$}}"], // Right Template	---- Not supported
				["returnLeft", "{{{", "{{[{&]"], // Return Unescaped
				["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"], // Full line comment
				["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"], // Comment
				["left", "{{~"], // Run
				["escapeLeft", "{{"], // Return Escaped
				["returnRight", "}}}"],
				["right", "}}"] // Right -> All have same FOR Mustache ...
			],

			helpers: [
				/**
				 * Partials
				 * Partials begin with a greater than sign, like {{> box}}.
				 *
				 * Partials are rendered at runtime (as opposed to compile time), 
				 * so recursive partials are possible. Just avoid infinite loops.
				 *
				 * For example, this template and partial:
				 * 
				 * 		base.mustache:
				 * 			<h2>Names</h2>
				 * 			{{#names}}
				 * 				{{> user}}
				 * 			{{/names}}
				 * 			
				 * 		user.mustache:
				 * 			<strong>{{name}}</strong>
				 */
				{
					name: /^>[\s|\w]\w*/,
					fn:function(content, cmd){
						return "can.view.render('" + can.trim(content.replace(/^>\s?/, '')) + "', can.extend({}, " + CONTEXT + ", this))";
					}
				},

				/**
				 * Convert the expression for use with interpolation/helpers.
				 */
				{
					name: /^.*$/,
					fn: function(content, cmd) {
						// Parse content
						var mode = false,
							result = [],
							content = can.trim(content);
						if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
							mode = mode[0];
							switch (mode) {
								case '#':
								case '^':
									result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
									break;
								// Close section
								case '/':
									return { raw: 'return ___v1ew.join("");}}])}));' };
									break;
							}
							content = content.substring(1);
						}
						
						if (mode != 'else') {
							var args = [],
								i = 0,
								hashing = false,
								arg, split, m;
							
							// Parse the arguments
							// Needs to use this method of a split(/\s/) so that strings with spaces can be parsed
							(can.trim(content)+' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function(whole, part) {
								args.push(part);
							});
								
							// Start the content
							result.push('can.Mustache.txt(' + CONTEXT_STACK + ',' + (mode ? '"'+mode+'"' : 'null') + ',');
						
							// Iterate through the arguments
							for (; arg = args[i]; i++) {
								i > 0 && result.push(',');
								
								// Check for special helper arguments (string/number/boolean/hashes)
								if (i > 0 && (m = arg.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))) {
									// Found a string/number/boolean
									if (m[2]) {
										result.push(m[0]);
									}
									// Found a hash
									else {
										// Open the hash
										if (!hashing) {
											hashing = true;
											result.push('{' + HASH + ':{');
										}
										
										// Add the key/value
										result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g,'\\"') + '",' + CONTEXT_STACK + ')');
										
										// Close the hash
										if (i == args.length - 1) {
											result.push('}}');
										}
									}
								}
								// Otherwise output a normal reference
								else {
									result.push('can.Mustache.get("' + 
										// Include the reference
										arg.replace(/"/g,'\\"') + '",' +
										// Then the local and stack contexts
										CONTEXT_STACK +
										// Flag as a definite helper method
										(i == 0 && args.length > 1 ? ',true' : '') +
										')');
								}
							}
						}
						
						// Handle sections
						mode && mode != 'else' && result.push(',[{_:function(){');
						switch (mode) {
							// Truthy section
							case '#':
								result.push('return ___v1ew.join("");}},{fn:function(' + CONTEXT + '){var ___v1ew = [];');
								break;
							// If/else section
							// Falsey section
							case 'else':
							case '^':
								result.push('return ___v1ew.join("");}},{inverse:function(' + CONTEXT + '){var ___v1ew = [];');
								break;
							// Not a section
							default:
								result.push(');');
								break;
						}
						
						result = result.join('');
						return mode ? { raw: result } : result;
					}
				}
			]
		})
	});

	/**
	 * Addin default helpers first.  We could prob do this
	 * differently if we didn't 'break' on every match.
	 */
	var helpers = can.view.Scanner.prototype.helpers;
	for (var i = 0; i < helpers.length; i++) {
		Mustache.prototype.scanner.helpers.unshift(helpers[i]);
	};

	Mustache.registerHelper = function(name, fn){
		this._helpers.push({ name: name, fn: fn });
	};
	
	Mustache.getHelper = function(name) {		
		for (var i = 0, helper; helper = this._helpers[i]; i++) {
			// Find the correct helper
			if (helper.name == name) {
				return helper;
			}
		}
		return null;
	};

	Mustache.registerPartial = function(id, text) {
		// Get the renderer function.
		var d = new can.Deferred(),
			type = can.view.types['.mustache'],
			func = type.renderer(id, text);
		
		// Cache if we are caching.
		if ( can.view.cache ) {
			can.view.cached[id] = d;
			d.__view_id = id;
			can.view.cachedRenderers[id] = func;
		}

		d.resolve(func);
	};
	
	/**
	 * @param {String} [mode]	The mode to evaluate the section with: # for truthy, ^ for falsey
	 */
	Mustache.txt = function(context, mode, name) {
		var args = Array.prototype.slice.call(arguments, 3),
			options = can.extend.apply(can, [{
					fn: function() {},
					inverse: function() {}
				}].concat(mode ? args.pop() : [])),
			validArgs = args.length > 0 ? args : [name],
			valid = true,
			result = [],
			i, helper;
		
		// Validate based on the mode if necessary
		if (mode) {
			for (i = 0; i < validArgs.length; i++) {
				if (isArrayLike(validArgs[i])) {
					valid = mode == '#' ? valid && !!validArgs[i].length
						: mode == '^' ? valid && !validArgs[i].length
						: valid;
				}
				else {
					valid = mode == '#' ? valid && !!validArgs[i]
						: mode == '^' ? valid && !validArgs[i]
						: valid;
				}
			}
		}
		
		// Check for a registered helper or a helper-like function
		if (helper = (Mustache.getHelper(name) || (can.isFunction(name) && { fn: name }))) {
			// Update the options with a function/inverse (the inner templates of a section)
			var opts = {
				fn: can.proxy(options.fn, context),
				inverse: can.proxy(options.inverse, context)
			}, lastArg = args[args.length-1];
			// Add the hash if one exists
			if (lastArg && lastArg[HASH]) {
				opts.hash = args.pop()[HASH];
			}
			args.push(opts);
			
			// Call the helper
			return helper.fn.apply(context, args) || '';
		}
		
		// Otherwise interpolate like normal
		if (valid) {
			// Handle truthyness
			switch (mode) {
				case '#':
					// Iterate over arrays
					if (isArrayLike(name)) {
						for (i = 0; i < name.length; i++) {
							result.push(options.fn.call(name[i] || {}, context) || '');
						}
						return result.join('');
					}
					// Normal case.
					else {
						return options.fn.call(name || {}, context) || '';
					}
					break;
				case '^':
					return options.inverse.call(name || {}, context) || '';
					break;
				default:
					return '' + (name || '');
					break;
			}
		}
		
		return '';
	};
	
	/**
	 * Resolves a reference for a given object (and then a context if that fails).
	 *	obj = this
	 *	context = { a: true }
	 *	ref = 'a.b.c'
	 *		=> obj.a.b.c || context.a.b.c || ''
	 *
	 * This implements the following Mustache specs:
	 * 	Deeply Nested Contexts
	 *	All elements on the context stack should be accessible.
	 *		{{#bool}}B {{#bool}}C{{/bool}} D{{/bool}}
	 *		{ bool: true }
	 *		=> "B C D"
	 * 	Basic Context Miss Interpolation
	 * 	Failed context lookups should default to empty strings.
	 *  	{{cannot}}
	 *		=> ""
	 * 	Dotted Names - Broken Chains
	 * 	Any falsey value prior to the last part of the name should yield ''.
	 *		{{a.b.c}}
	 *		{ a: { d: 1 } }
	 *		=> ""
	 *
	 * @param {String} ref      The reference to check for on the obj/context.
	 * @param {Object} obj  		The object to use for checking for a reference.
	 * @param {Object} context  The context to use for checking for a reference if it doesn't exist in the object.
	 * @param {Boolean} [isHelper]  Whether the reference is a helper.
	 */
	Mustache.get = function(ref, contexts, isHelper) {
		var names = ref.split('.'),
			obj = contexts[contexts.length - 1],
			context = contexts[contexts.length - 2],
			lastValue, value, name, i, j;
		
		// Handle "this" references for list iteration: {{.}} or {{this}}
		if (/^\.|this$/.test(ref)) {
			// If context isn't an object, then it was a value passed by a helper so use it as an override.
			if (!/^object|undefined$/.test(typeof context)) {
				return context || '';
			}
			// Otherwise just return the closest object.
			else {
				while (value = contexts.pop()) {
					if (typeof value !== 'undefined') {
						return value;
					} 
				}
				return '';
			}
		}
		// Handle object resolution.
		else if (!isHelper) {
			while (value = contexts.pop()) {
			// for (i = 0; i < contexts.length; i++) {
				// Check the context for the reference
				// value = contexts[i];

				// Make sure the context isn't a failed object before diving into it.
				if (value !== undefined) {
					for (j = 0; j < names.length; j++) {
						// Keep running up the tree while there are matches.
						if (typeof value[names[j]] != 'undefined') {
							lastValue = value;
							value = value[name = names[j]];
						}
						// If it's undefined, still match if the parent is an Observe.
						else if (isObserve(value)) {
							lastValue = value;
							name = names[j];
							break;
						}
						else {
							lastValue = value = undefined;
							break;
						}
					}
				}

				// Found a matched reference
				if (value !== undefined) {
					// Support functions stored in objects
					if (can.isFunction(lastValue[name])) {
						return lastValue[name]();
					}
					// Add support for observes
					if (isObserve(lastValue)) {
						return lastValue.attr(name);
					} else {
						// Invoke the length to ensure that Observe.List events fire.
						isObserve(value) && isArrayLike(value) && value.attr('length');
						return value;
					}
				}
			}
		}
		
		// Support helper-like functions as anonymous helpers
		if (obj !== undefined && can.isFunction(obj[ref])) {
			return obj[ref];
		}
		// Support helpers without arguments, but only if there wasn't a matching data reference.
		else if (value = Mustache.getHelper(ref)) {
			return ref;
		}
		
		return '';
	};

	Mustache._helpers = [
		/**
		 * {{#if expr}}
		 *   Do {{something}}
		 * {{else}}
		 *   Do {{nothing}}
		 * {{/if}}
		 */
		{
			name: 'if',
			fn: function(expr, options){
				if (!!expr) {
					return options.fn(this);
				}
				else {
					return options.inverse(this);
				}
			}
		},
		
		{
			name: 'unless',
			fn: function(expr, options){
				if (!expr) {
					return options.fn(this);
				}
			}
		},
		
		{
			name: 'each',
			fn: function(expr, options) {
				if (!!expr && expr.length) {
					var result = [];
					for (var i = 0; i < expr.length; i++) {
						result.push(options.fn(expr[i]));
					}
					return result.join('');
				}
			}
		},
		
		{
			name: 'with',
			fn: function(expr, options){
				if (!!expr) {
					return options.fn(expr);
				}
			}
		},

		{
			name: 'data',
			fn: function(attr, options){
				var obj = this;
				return can.view.hook(function(el){
					can.$(el).data(attr, obj);
				}).replace(/\'/g, '');
			}
		}
	];

	/**
	 * Register the view.
	 */
	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// returns a `function` that renders the view.
		script: function( id, src ) {
			return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
				text: src,
				name: id
			}).template.out + " })";
		},

		renderer: function( id, text ) {
			return Mustache({
				text: text,
				name: id
			});
		}
	});

	return can.Mustache;
});