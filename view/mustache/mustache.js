steal('can/util',
	  'can/view',
	  'can/view/scanner.js',
	  'can/observe/compute',
	  'can/view/render.js',
function( can ){

	can.view.ext = ".mustache";

	var extend = can.extend,
		Mustache = function( options ) {
			// Supports calling Mustache without the constructor
			// This returns a function that renders the template.
			if ( this.constructor != Mustache ) {
				var mustache = new Mustache(options);
				return function( data, helpers ) {
					 return mustache.render(data, helpers);
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
	 *		 },{helper: function(){ ... }})
	 *		 
	 * @param {Object} object data to be rendered
	 * @param {Object} [extraHelpers] an object with view helpers
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, new Mustache.Helpers(object, extraHelpers || {}));
	};

	extend(Mustache.prototype, {
		/**
		 * Singleton scanner instance for parsing templates.
		 */
		scanner: new can.view.Scanner({
			/**
			 * An ordered token registry for the scanner.
			 * This needs to be ordered by priority to prevent token parsing errors.
			 * Each token is defined as: ["token-name", "string representation", "optional regexp override"]
			 */
			tokens: [
				["templateLeft", "{{$"], // Template	 ---- Not supported
				["templateRight", "$}}"], // Right Template	---- Not supported
				["returnLeft", "{{{", "{{[{&]"], // Return Unescaped
				// ["commentFull", "{{!}}", "[\\s\\t]*{{!.+?}}\\n?"], // Comment
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
						return "can.view.render('" + content.replace(/^>\s?/, '').trim() + "', _CONTEXT)";
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
							result = [];
						if (content[0] && (mode = content[0].match(/^([#^/]|else$)/))) {
							mode = mode[0];
							switch (mode) {
								case '#':
								case '^':
									result.push(cmd.insert + 'can.view.txt(0,"",0,this,function(){ return ');
									break;
								// Close section
								case '/':
									return { raw: '}}])}));' };
									break;
							}
							content = content.substring(1);
						}
						var args = content.replace(/^\s*/,'').replace(/\s*$/,'').split(/\s/),
							i = 0,
							arg, split;
						result.push('can.Mustache.txt(can.extend({}, typeof ___c0nt3xt == "undefined" ? {} : ___c0nt3xt, this),' + (mode ? '"'+mode+'"' : 'null') + ',');
						
						// Append helper requests as a name string
						if (args.length > 1) {
							i = 1;
							result.push('"' + args[0] + '"');
						}
						
						// Iterate through the arguments
						for (; arg = args[i]; i++) {
							i > 0 && result.push(',');
														
							/**
							 * Implicit Iterator
							 *  {{#list}}({{.}}){{/list}}
							 * 	Implicit iterators should directly interpolate strings.
							 */
							if (arg == '.') {
								result.push('this');
							}
							else {
								/**
								 * Deeply Nested Contexts
								 *	{{#bool}}B {{#bool}}C{{/bool}} D{{/bool}}
								 *	All elements on the context stack should be accessible.
								 */
								var objs = ['this','___c0nt3xt'],
									j;
								split = arg.split('.');
								
								for (j = 0; j < objs.length; j++) {
									if (j > 0) {
										result.push(': (typeof ' + objs[j] + ' != "undefined" && ');
									}
									else {
										result.push('(');
									}
															
									/**
									 * Basic Context Miss Interpolation
									 *  {{cannot}}
									 * 	Failed context lookups should default to empty strings.
									 */
									result.push('typeof ' + objs[j] + '.' + split[0] + ' != "undefined" ? ');

									/**
									 * Dotted Names - Broken Chains
									 *	{{a.b.c}}
									 * 	Any falsey value prior to the last part of the name should yield ''.
									 */
									if (split.length > 1) {
										result.push('(');
										for (var i = 1; i < split.length; i++) {
											i > 1 && result.push(' && ');
											result.push(objs[j] + '.' + split.slice(0, i+1).join('.'));
										}
										result.push(') || ""');
									}
									else {
										result.push(objs[j] + '.' + split[0]);
									}
									
									if (j == objs.length - 1) {
										result.push(' : ""))');
									}
								}
							}
						}
						
						// Handle sections
						mode && result.push(',[{');
						switch (mode) {
							// Truthy section
							case '#':
								result.push('},{fn:function(___c0nt3xt){');
								break;
							// Falsey section
							case '^':
								result.push('},{inverse:function(___c0nt3xt){');
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
	
	Mustache.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};

	Mustache.registerHelper = function(name, fn){
		this._helpers.push({ name: name, fn: fn });
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
				if (can.isArray(validArgs[i])) {
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
		
		if (!mode || (mode && valid)) {
			// If there is more than one argument, it's a helper
			if (args.length > 0) {
				for (i = 0; helper = this._helpers[i]; i++) {
					// Find the correct helper
					if (helper.name == name) {
						args.push({
							fn: can.proxy(options.fn, context),
							inverse: can.proxy(options.inverse, context)
						});
						return helper.fn.apply(helper, args) || '';
					}
				}
				return '';
			}
			// Otherwise interpolate like normal
			else {
				// Handle truthyness
				switch (mode) {
					case '#':
						// Iterate over arrays
						if (can.isArray(name)) {
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
		}
		else {
			return '';
		}
	};

	Mustache._helpers = [
		// if, else, unless, each, with
		
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
			fn: function(expr, options){
				if (!!expr && expr.length) {
					for (var i = 0; i < expr.length; i++) {
						return options.fn(expr[i]);
					}
				}
			}
		},
		
		{
			name: 'with',
			fn: function(expr, options){
				if (!!expr) {
					return options.fn.call(expr, this);
				}
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

});