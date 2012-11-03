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
						result.push('can.Mustache.txt(' + (mode ? '"'+mode+'"' : 'null') + ',');
						
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
								split = arg.split('.');
							
								/**
								 * Basic Context Miss Interpolation
								 *  {{cannot}}
								 * 	Failed context lookups should default to empty strings.
								 */
								result.push('(typeof ' + split[0] + ' != "undefined" ? ');

								/**
								 * Dotted Names - Broken Chains
								 *	{{a.b.c}}
								 * 	Any falsey value prior to the last part of the name should yield ''.
								 */
								if (split.length > 1) {
									result.push('(');
									for (var i = 1; i < split.length; i++) {
										i > 1 && result.push(' && ');
										result.push(split.slice(0, i+1).join('.'));
									}
									result.push(') || ""');
								}
								else {
									result.push(split[0]);
								}
								result.push(' : "")');
							}
						}
						
						// Handle sections
						mode && result.push(',[{');
						switch (mode) {
							// Truthy section
							case '#':
								result.push('},{fn:function(){');
								break;
							// Falsey section
							case '^':
								result.push('},{inverse:function(){');
								break;
							// Not a section
							default:
								result.push(')');
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
	Mustache.txt = function(mode, name) {
		var args = Array.prototype.slice.call(arguments, 2),
			options = mode && can.extend.apply(can, [{
					fn: function() {},
					inverse: function() {}
				}].concat(args.pop())),
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
							fn: function(context) {
								// TODO
								// Should render the code *within* the section
							},
							inverse: function() {
								// TODO
								// Should render the code *within* an else section
							}
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
								result.push(options.fn.call(name[i] || {}) || '');
							}
							return result.join('');
						}

						// Normal case.
						else {
							return options.fn.call(name || {}) || '';
						}
						break;
					case '^':
						return options.inverse.call(name || {}) || '';
						break;
					default:
						return name || '';
						break;
				}
			}
		}
		else {
			return '';
		}
	};

	Mustache._helpers = [
		/**
		 * {{#evalvariable}}
		 * 
		 * ## Sections
		 * Sections render blocks of text one or more times, depending on the value 
		 * of the key in the current context.
		 *
		 * A section begins with a pound and ends with a slash. That is, {{#person}} 
		 * begins a "person" section while {{/person}} ends it.
		 *
		 * The behavior of the section is determined by the value of the key.
		 *
		 * ### False Values or Empty Lists
		 * If the person key exists and has a value of false or an empty list, the HTML 
		 * between the pound and slash will not be displayed.
		 *
		 * ### Non-Empty Lists
		 * If the person key exists and has a non-false value, the HTML between the pound 
		 * and slash will be rendered and displayed one or more times.
		 *
		 * When the value is a non-empty list, the text in the block will be displayed once for 
		 * each item in the list. The context of the block will be set to the current item for each 
		 * iteration. In this way we can loop over collections.
		 *
		 * ### Lambdas
		 * When the value is a callable object, such as a function or lambda, the object will be 
		 * invoked and passed the block of text. The text passed is the literal block, unrendered. 
		 * {{tags}} will not have been expanded - the lambda should do that on its own. In this way you 
		 * can implement filters or caching.
		 *
		 * @param {String} content
		 */
		// {
		// 	name: /^#\w*$/,
		// 	fn: function(content){
		// 		return options.fn('if(' + content.substring(1, content.length) + '){');
		// 	}
		// },
		{
			name: 'if',
			fn: function(content){
				if (content) {
					return content;
				}
			}
		},
		
		/**
		 * {{#person?}}
		 * 
		 * ## Non-False Values
		 * When the value is non-false but not a list, it will be used as the context 
		 * for a single rendering of the block.
		 * 
		 * @param {String} content
		 */
		/*nonfalse: function(content){
			return content;
		},*/
		
		/**
		 * {{^ evalvariable }}
		 * 
		 * ## Inverted Sections
		 * An inverted section begins with a caret (hat) and ends with a slash. 
		 * That is {{^person}} begins a "person" inverted section while {{/person}} ends it.
		 * 
		 * @param {String} content
		 */
		/*inverted: function(content){
			return content;
		},*/
		
		/**
		 * {{/ evalvariable }}
		 * Closes sections.
		 * @param {String} content
		 */
		// { 
		// 	name: /^\/\w*$/,
		// 	fn: function(content, options){
		// 		return options.fn('};');
		// 	}
		// }
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