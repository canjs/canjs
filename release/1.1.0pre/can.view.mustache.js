(function (can, window, undefined) {
	// ## can/view/mustache/mustache.js
	// Define the view extension
	can.view.ext = ".mustache";

	// internal helpers
	var CONTEXT = '___c0nt3xt',
		HASH = '___h4sh',
		STACK = '___st4ck',
		CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',

		isObserve = function (obj) {
			return can.isFunction(obj.attr) && obj.constructor && !! obj.constructor.canMakeObserve;
		},

		isArrayLike = function (obj) {
			return obj && obj.splice && typeof obj.length == 'number';
		},
		Mustache = function (options) {
			// Supports calling Mustache without the constructor
			// This returns a function that renders the template.
			if (this.constructor != Mustache) {
				var mustache = new Mustache(options);
				return function (data) {
					return mustache.render(data);
				};
			}

			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options == "function") {
				this.template = {
					fn: options
				};
				return;
			}

			// Set options on self.
			can.extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};

	// Put Mustache on the `can` object
	can.Mustache = window.Mustache = Mustache;


	Mustache.prototype.

	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, {
			_data: object
		});
	};

	can.extend(Mustache.prototype, {

		scanner: new can.view.Scanner({

			text: {
				start: 'var ' + CONTEXT + ' = []; ' + CONTEXT + '.' + STACK + ' = true;' + 'var ' + STACK + ' = function(context, self) {' + 'var s;' + 'if (arguments.length == 1 && context) {' + 's = !context.' + STACK + ' ? [context] : context;' + '} else {' + 's = context && context.' + STACK + ' ? context.concat([self]) : ' + STACK + '(context).concat([self]);' + '}' + 'return (s.' + STACK + ' = true) && s;' + '};'
			},


			tokens: [
			// Return unescaped
			["returnLeft", "{{{", "{{[{&]"],
			// Full line comments
			["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
			// Inline comments
			["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
			// Full line escapes
			// This is used for detecting lines with only whitespace and an escaped tag
			["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function (content) {
				return {
					before: /^\n.+?\n$/.test(content) ? '\n' : '',
					content: content.match(/\{\{(.+?)\}\}/)[1] || ''
				};
			}],
			// Return escaped
			["escapeLeft", "{{"],
			// Close return unescaped
			["returnRight", "}}}"],
			// Close tag
			["right", "}}"]],

			helpers: [

			{
				name: /^>[\s|\w]\w*/,
				fn: function (content, cmd) {
					// get the template name and call back into the render method
					// passing the name and the current context
					var templateName = can.trim(content.replace(/^>\s?/, ''));
					return "can.view.render('" + templateName + "', " + CONTEXT_STACK + ".pop())";
				}
			},


			{
				name: /^\s?data\s/,
				fn: function (content, cmd) {
					var attr = content.replace(/(^\s?data\s)|(["'])/g, '');

					// return a function which calls `can.data` on the element
					// with the attribute name with the current context.
					return "can.proxy(function(__){can.data(can.$(__),'" + attr + "', this.pop()); }, " + CONTEXT_STACK + ")";
				}
			},


			{
				name: /^.*$/,
				fn: function (content, cmd) {
					// Parse content
					var mode = false,
						result = [];

					// Trim the content so we don't have any trailing whitespace
					content = can.trim(content);

					// Try to determine the mode the token is such as a eval, inverting, or closing
					if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
						mode = mode[0];
						switch (mode) {
						case '#':
						case '^':
							result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
							break;
							// Close section
						case '/':
							return {
								raw: 'return ___v1ew.join("");}}])}));'
							};
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
						(can.trim(content) + ' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function (whole, part) {
							args.push(part);
						});

						// Start the content
						result.push('can.Mustache.txt(' + CONTEXT_STACK + ',' + (mode ? '"' + mode + '"' : 'null') + ',');

						// Iterate through the arguments
						for (; arg = args[i]; i++) {
							i && result.push(',');

							// Check for special helper arguments (string/number/boolean/hashes)
							if (i && (m = arg.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))) {
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
									result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g, '\\"') + '",' + CONTEXT_STACK + ')');

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
								arg.replace(/"/g, '\\"') + '",' +
								// Then the local and stack contexts
								CONTEXT_STACK +
								// Flag as a definite helper method
								(i == 0 && args.length > 1 ? ',true' : '') + ')');
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
					return mode ? {
						raw: result
					} : result;
				}
			}]
		})
	});




	var helpers = can.view.Scanner.prototype.helpers;
	for (var i = 0; i < helpers.length; i++) {
		Mustache.prototype.scanner.helpers.unshift(helpers[i]);
	};


	Mustache.registerHelper = function (name, fn) {
		this._helpers.push({
			name: name,
			fn: fn
		});
	};


	Mustache.getHelper = function (name) {
		for (var i = 0, helper; helper = this._helpers[i]; i++) {
			// Find the correct helper
			if (helper.name == name) {
				return helper;
			}
		}
		return null;
	};


	Mustache.txt = function (context, mode, name) {
		var args = Array.prototype.slice.call(arguments, 3),
			options = can.extend.apply(can, [{
				fn: function () {},
				inverse: function () {}
			}].concat(mode ? args.pop() : [])),
			validArgs = args.length ? args : [name],
			valid = true,
			result = [],
			i, helper;

		// Validate based on the mode if necessary
		if (mode) {
			for (i = 0; i < validArgs.length; i++) {
				if (isArrayLike(validArgs[i])) {
					valid = mode == '#' ? valid && !! validArgs[i].length : mode == '^' ? valid && !validArgs[i].length : valid;
				}
				else {
					valid = mode == '#' ? valid && !! validArgs[i] : mode == '^' ? valid && !validArgs[i] : valid;
				}
			}
		}

		// Check for a registered helper or a helper-like function
		if (helper = (Mustache.getHelper(name) || (can.isFunction(name) && {
			fn: name
		}))) {
			// Update the options with a function/inverse (the inner templates of a section)
			var context = (context[STACK] && context[context.length - 1]) || context,
				opts = {
					fn: can.proxy(options.fn, context),
					inverse: can.proxy(options.inverse, context)
				},
				lastArg = args[args.length - 1];
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
				// add + '' to convert things like 0 to strings
				// this can cause issues if you are trying to
				// eval on the length but I think this is the more
				// common case
				return '' + (name !== undefined ? name : '');
				break;
			}
		}

		return '';
	};


	Mustache.get = function (ref, contexts, isHelper) {
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
			for (i = contexts.length - 1; i >= 0; i--) {
				// Check the context for the reference
				value = contexts[i];

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

	{
		name: 'if',
		fn: function (expr, options) {
			if ( !! expr) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		}
	},


	{
		name: 'unless',
		fn: function (expr, options) {
			if (!expr) {
				return options.fn(this);
			}
		}
	},


	{
		name: 'each',
		fn: function (expr, options) {
			if ( !! expr && expr.length) {
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
		fn: function (expr, options) {
			if ( !! expr) {
				return options.fn(expr);
			}
		}
	}];


	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// returns a `function` that renders the view.
		script: function (id, src) {
			return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
				text: src,
				name: id
			}).template.out + " })";
		},

		renderer: function (id, text) {
			return Mustache({
				text: text,
				name: id
			});
		}
	});


})(can, this);