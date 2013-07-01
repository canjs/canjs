steal('can/util',
	  'can/view',
	  'can/view/scanner.js',
	  'can/observe/compute',
	  'can/view/render.js',
function( can ){
	
	// # mustache.js
	// `can.Mustache`: The Mustache templating engine.
	// 
	// See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
	// of the runtime render code design. The majority of the Mustache engine implementation 
	// occurs within the *Transformation* scanning helper.

	// ## Initialization
	//
	// Define the view extension.
	can.view.ext = ".mustache";

	// ### Setup internal helper variables and functions.
	//
	// An alias for the context variable used for tracking a stack of contexts.
	// This is also used for passing to helper functions to maintain proper context.
	var CONTEXT = '___c0nt3xt',
		// An alias for the variable used for the hash object that can be passed
		// to helpers via `options.hash`.
		HASH = '___h4sh',
		// An alias for the function that adds a new context to the context stack.
		STACK = '___st4ck',
		STACKED = '___st4ck3d',
		// An alias for the most used context stacking call.
		CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',
		CONTEXT_OBJ = '{context:' + CONTEXT_STACK + ',options:options}',
		
		/**
		 * Checks whether an object is a can.Observe.
		 * @param  {[can.Observe]}  observable
		 * @return {Boolean} returns if the object is an observable.
		 */
		isObserve = function(obj) {
			return obj !== null && can.isFunction(obj.attr) && obj.constructor && !!obj.constructor.canMakeObserve;
		},
		
		/**
		 * Tries to determine if the object passed is an array.
		 * @param  {Array}  obj The object to check.
		 * @return {Boolean} returns if the object is an array.
		 */
		isArrayLike = function(obj) {
			return obj && obj.splice && typeof obj.length == 'number';
		},
		
		// ## Mustache
		/**
		 * @hide
		 * The Mustache templating engine.
		 * @param {Object} options	Configuration options
		 */
		Mustache = function(options, helpers) {
			// Support calling Mustache without the constructor.
			// This returns a function that renders the template.
			if ( this.constructor != Mustache ) {
				var mustache = new Mustache(options);
				return function(data,options) {
					 return mustache.render(data,options);
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
			can.extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};

	/**
	 * @add can.Mustache
	 */
	// Put Mustache on the `can` object.
	can.Mustache = window.Mustache = Mustache;

	/** 
	 * @prototype
	 */
	Mustache.prototype.
	/**
	 * @function can.Mustache.prototype.render render
	 * @parent can.Mustache.prototype
	 * @signature `mustache.render( data [, helpers] )`
	 * @param {Object} data Data to interpolate into the template.
	 * @return {String} The template with interpolated data, in string form.
	 * 
	 * @body
	 * Renders an object with view helpers attached to the view.
	 * 
	 *		 new Mustache({text: "<%= message %>"}).render({
	 *			 message: "foo"
	 *		 })
	 */
	render = function( object, options ) {
		object = object || {};
		options = options || {};
		if(!options.helpers && !options.partials){
			options.helpers = options;
		}
		return this.template.fn.call(object, object, {
			_data: object,
			options: options
		});
	};

	can.extend(Mustache.prototype, {
		// Share a singleton scanner for parsing templates.
		scanner: new can.view.Scanner({
			// A hash of strings for the scanner to inject at certain points.
			text: {
				// This is the logic to inject at the beginning of a rendered template. 
				// This includes initializing the `context` stack.
				start: 'var ' + CONTEXT + ' = this && this.' + STACKED + ' ? this : [];' + CONTEXT + '.' + STACKED + ' = true;' +
					'var ' + STACK + ' = function(context, self) {' +
						'var s;' +
						'if (arguments.length == 1 && context) {' +
							's = !context.' + STACKED + ' ? [context] : context;' +
						// Handle helpers with custom contexts (#228)
						'} else if (!context.' + STACKED + ') {' +
							's = [self, context];' +
						'} else if (context && context === self && context.' + STACKED + ') {' +
							's = context.slice(0);' +
						'} else {' +
							's = context && context.' + STACKED + ' ? context.concat([self]) : ' + STACK + '(context).concat([self]);' +
						'}' +
						'return (s.' + STACKED + ' = true) && s;' +
					'};'
			},
			
			// An ordered token registry for the scanner.
			// This needs to be ordered by priority to prevent token parsing errors.
			// Each token follows the following structure:
			//
			//		[
			//			// Which key in the token map to match.
			//			"tokenMapName",
			//
			//			// A simple token to match, like "{{".
			//			"token",
			//
			//			// Optional. A complex (regexp) token to match that 
			//			// overrides the simple token.
			//			"[\\s\\t]*{{",
			//
			//			// Optional. A function that executes advanced 
			//			// manipulation of the matched content. This is 
			//			// rarely used.
			//			function(content){   
			//				return content;
			//			}
			//		]
			tokens: [
				/**
				 * @function can.Mustache.tags.escaped {{key}}
				 * 
				 * @description Insert the value of the [can.Mustache.key key] into the 
				 * output of the template.
				 * 
				 * @parent can.Mustache.tags 0
				 * 
				 * @signature `{{key}}`
				 * 
				 * @param {can.Mustache.key} key A key that references one of the following:
				 * 
				 *  - A [can.Mustache.registerHelper registered helper].
				 *  - A value within the current or parent 
				 *    [can.Mustache.context context]. If the value is a function or [can.compute], the 
				 *    function's return value is used.
				 * 
				 * @return {String|Function|*} 
				 * 
				 * After the key's value is found (and set to any function's return value), 
				 * it is passed to [can.view.txt] as the result of a call to its `func` 
				 * argument. There, if the value is a:
				 * 
				 *  - `null` or `undefined` - an empty string is inserted into the rendered template result.
				 *  - `String` or `Number` - the value is inserted into the rendered template result.
				 *  - `Function` - A [can.view.hook hookup] attribute or element is inserted so this function
				 *    will be called back with the DOM element after it is created.
				 * 
				 * @body
				 * 
				 * ## Use
				 * 
				 * `{{key}}` insert data into the template. It most commonly references 
				 * values within the current [can.Mustache.context context]. For example:
				 * 
				 * Rendering:
				 * 
				 *     <h1>{{name}}</h1>
				 * 
				 * With:
				 * 
				 *     {name: "Austin"}
				 * 
				 * Results in:
				 * 
				 *     <h1>Austin</h1>
				 * 
				 * If the key value is a String or Number, it is inserted into the template.  
				 * If it is `null` or `undefined`, nothing is added to the template.
				 * 
				 * 
				 * ## Nested Properties
				 * 
				 * Mustache supports nested paths, making it possible to 
				 * look up properties nested deep inside the current context. For example:
				 * 
				 * Rendering:
				 * 
				 *     <h1>{{book.author}}</h1>
				 * 
				 * With:
				 * 
				 *     {
				 *       book: {
				 *         author: "Ernest Hemingway"
				 *       }
				 *     }
				 * 
				 * Results in:
				 * 
				 *     <h1>Ernest Hemingway</h1>
				 * 
				 * ## Looking up values in parent contexts
				 * 
				 * Sections and block helpers can create their own contexts. If a key's value
				 * is not found in the current context, it will look up the key's value
				 * in parent contexts. For example:
				 * 
				 * Rendering:
				 * 
				 *     {{#chapters}}
				 *        <li>{{title}} - {{name}}</li>
				 *     {{chapters}}
				 * 
				 * With:
				 * 
				 *     {
				 *       title: "The Book of Bitovi"	
				 *       chapters: [{name: "Breakdown"}]
				 *     }
				 *   
				 * Results in:
				 * 
				 *     <li>The Book of Bitovi - Breakdown</li>
				 * 
				 * 
				 */
				// Return unescaped
				["returnLeft", "{{{", "{{[{&]"],
				// Full line comments
				["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
				// Inline comments
				["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
				/**
				 * @function can.Mustache.tags.unescaped {{{key}}}
				 * 
				 * @parent can.Mustache.tags 1
				 * 
				 * @description Insert the unescaped value of the [can.Mustache.key key] into the 
				 * output of the template.
				 * 
				 * @signature `{{{key}}}`
				 * 
				 * Behaves just like [can.Mustache.tags.escaped {{key}}] and [can.Mustache.helpers.helper {{helper}}] but does not
				 * escape the result. 
				 * 
				 * @param {can.Mustache.key} key A key that references a value within the current or parent 
				 * context. If the value is a function or can.compute, the function's return value is used.
				 * @return {String|Function|*} 
				 * 
				 * 
				 */
				// Full line escapes
				// This is used for detecting lines with only whitespace and an escaped tag
				["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function(content) {
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
				["right", "}}"]
			],
			
			// ## Scanning Helpers
			//
			// This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
			//
			//		{
			//			// The content pattern to match in order to execute.
			//			// Only the first matching helper is executed.
			//			name: /pattern to match/,
			//
			//			// The function to transform the content with.
			//			// @param {String} content   The content to transform.
			//			// @param {Object} cmd       Scanner helper data.
			//			//                           {
			//			//                             insert: "insert command",
			//			//                             tagName: "div",
			//			//                             status: 0
			//			//                           }
			//			fn: function(content, cmd) {
			//				return 'for text injection' || 
			//					{ raw: 'to bypass text injection' };
			//			}
			//		}
			helpers: [
				// ### Partials
				//
				// Partials begin with a greater than sign, like {{> box}}.
				// 
				// Partials are rendered at runtime (as opposed to compile time), 
				// so recursive partials are possible. Just avoid infinite loops.
				// 
				// For example, this template and partial:
				// 
				// 		base.mustache:
				// 			<h2>Names</h2>
				// 			{{#names}}
				// 				{{> user}}
				// 			{{/names}}
				// 			
				// 		user.mustache:
				// 			<strong>{{name}}</strong>
				{
					name: /^>[\s]*\w*/,
					fn:function(content, cmd){
						// Get the template name and call back into the render method,
						// passing the name and the current context.
						var templateName = can.trim(content.replace(/^>\s?/, '')).replace(/["|']/g, "");
						return "options.partials && options.partials['"+templateName+"'] ? can.Mustache.renderPartial(options.partials['"+templateName+"']," + 
							CONTEXT_STACK + ",options) : can.Mustache.render('" + templateName + "', " + CONTEXT_STACK + ")";
					}
				},

				// ### Data Hookup
				// 
				// This will attach the data property of `this` to the element
				// its found on using the first argument as the data attribute
				// key.
				// 
				// For example:
				// 	
				//		<li id="nameli" {{ data 'name' }}></li>
				// 
				// then later you can access it like:
				// 
				//		can.$('#nameli').data('name');
				/**
				 * @function can.Mustache.helpers.data {{data name}}
				 * @parent can.Mustache.tags
				 * @signature `{{data name}}`
				 * 
				 * Adds the current [can.Mustache.context context] to the
				 * element's [can.data].
				 * 
				 * @param {String} name The name of the data attribute to use for the
				 * context.
				 * 
				 * @body
				 * 
				 * ## Use 
				 * 
				 * Its common you want some data in the template to be available 
				 * on an element.  `{{data name}}` allows you to save the 
				 * context so it can later be retrieved by [can.data] or 
				 * `$.fn.data`. For example,
				 * 
				 * The template:
				 * 
				 *     <ul>
				 *       <li id="person" {{data 'person'}}>{{name}}</li>
				 *     </ul>
				 * 
				 * Rendered with:
				 * 
				 *     document.body.appendChild(
				 *       can.view.mustache(template,{ person: { name: 'Austin' } });
				 * 
				 * Retrieve the person data back with:
				 * 
				 *     $("#person").data("person")
				 * 
				 */
				{
					name: /^\s*data\s/,
					fn: function(content, cmd){
						var attr = content.match(/["|'](.*)["|']/)[1];
						// return a function which calls `can.data` on the element
						// with the attribute name with the current context.
						return "can.proxy(function(__){" +
							// "var context = this[this.length-1];" +
							// "context = context." + STACKED + " ? context[context.length-2] : context;" +
							"can.data(can.$(__),'" + attr + "', this.pop()); }, " + CONTEXT_STACK + ")";
					}
				},
				
				// ### Transformation (default)
				//
				// This transforms all content to its interpolated equivalent,
				// including calls to the corresponding helpers as applicable. 
				// This outputs the render code for almost all cases.
				//
				// #### Definitions
				// 
				// * `context` - This is the object that the current rendering context operates within. 
				//		Each nested template adds a new `context` to the context stack.
				// * `stack` - Mustache supports nested sections, 
				//		each of which add their own context to a stack of contexts.
				//		Whenever a token gets interpolated, it will check for a match against the 
				//		last context in the stack, then iterate through the rest of the stack checking for matches.
				//		The first match is the one that gets returned.
				// * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
				//		If this is a simple interpolation, only the interpolation lookup will be passed.
				//		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
				//		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
				//		exists to support the runtime context nesting that Mustache supports.
				// * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
				// * `options` - An object containing methods for executing the inner contents of sections or helpers.  
				//		`options.fn` - Contains the inner template logic for a truthy section.  
				//		`options.inverse` - Contains the inner template logic for a falsey section.  
				//		`options.hash` - Contains the merged hash object argument for custom helpers.
				//
				// #### Design
				//
				// This covers the design of the render code that the transformation helper generates.
				//
				// ##### Pseudocode
				// 
				// A detailed explanation is provided in the following sections, but here is some brief pseudocode
				// that gives a high level overview of what the generated render code does (with a template similar to  
				// `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
				//
				// *Initialize the render code.*
				// 
				// 		view = []
				// 		context = []
				// 		stack = fn { context.concat([this]) }
				// 		
				// *Render the root section.*
				//
				// 		view.push( "string" )
				// 		view.push( can.view.txt(
				//
				// *Render the nested section with `can.Mustache.txt`.*
				//
				// 			txt( 
				//
				// *Add the current context to the stack.*
				//
				// 				stack(), 
				//
				// *Flag this for truthy section mode.*
				//
				// 				"#",
				//
				// *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
				// 
				// 				get( "a", stack() ),
				//
				// *Include the nested section's inner logic.
				// The stack argument is usually the parent section's copy of the stack, 
				// but it can be an override context that was passed by a custom helper.
				// Sections can nest `0..n` times -- **NESTCEPTION**.*
				//
				// 				{ fn: fn(stack) {
				//
				// *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
				//
				// 					view = []
				// 					view.push( "string" )
				// 					view.push(
				//
				// *Add the current context to the stack.*
				//
				// 						stack(),
				//
				// *Flag this as interpolation-only mode.*
				//
				// 						null,
				//
				// *Interpolate the `b.c.d.e.name` variable using the stack.*
				//
				// 						get( "b.c.d.e.name", stack() ),
				// 					)
				// 					view.push( "string" )
				//
				// *Return the result for the nested section.*
				//
				// 					return view.join()
				// 				}}
				// 			)
				// 		))
				// 		view.push( "string" )
				//
				// *Return the result for the root section, which includes all nested sections.*
				//
				// 		return view.join()
				//
				// ##### Initialization
				//
				// Each rendered template is started with the following initialization code:
				//
				// 		var ___v1ew = [];
				// 		var ___c0nt3xt = [];
				// 		___c0nt3xt.___st4ck = true;
				// 		var ___st4ck = function(context, self) {
				// 			var s;
				// 			if (arguments.length == 1 && context) {
				// 				s = !context.___st4ck ? [context] : context;
				// 			} else {
				// 				s = context && context.___st4ck 
				//					? context.concat([self]) 
				//					: ___st4ck(context).concat([self]);
				// 			}
				// 			return (s.___st4ck = true) && s;
				// 		};
				//
				// The `___v1ew` is the the array used to serialize the view.
				// The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
				// The `___st4ck` function is used to more easily update the context stack in certain situations.
				// Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
				// However, custom helpers will occasionally pass override contexts that need their own context stack.
				//
				// ##### Sections
				//
				// Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
				// context in the resulting render code. The template itself is treated like a root section, with the 
				// same execution logic as any others. Each section can have `0..n` nested sections within it.
				//
				// Here's an example of a template without any descendent sections.  
				// Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
				// Would output the following render code:
				//
				//		___v1ew.push("\"");
				//		___v1ew.push(can.view.txt(1, '', 0, this, function() {
				// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), null, 
				//				can.Mustache.get("a.b.c.d.e.name", 
				//					___st4ck(___c0nt3xt, this))
				//			);
				//		}));
				//		___v1ew.push("\" == \"Phil\"");
				//
				// The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
				// will be pushed onto the view via `can.view.txt` in order to support live binding.
				// The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
				// a context lookup with `can.Mustache.get`.
				//
				// `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
				// This stack will grow larger as sections nest.
				//
				// The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
				// or `null` if it is an interpolation instead of a section.
				//
				// The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
				// context lookup and return the approriate string or object.
				//
				// Any additional arguments, if they exist, are used for passing arguments to custom helpers.
				//
				// For nested sections, the last argument is an `options` object that contains the nested section's logic.
				//
				// Here's an example of a template with a single nested section.  
				// Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
				// Would output the following render code:
				//
				//		___v1ew.push("\"");
				// 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
				// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), "#", 
				//				can.Mustache.get("a", ___st4ck(___c0nt3xt, this)), 
				//					[{
				// 					_: function() {
				// 						return ___v1ew.join("");
				// 					}
				// 				}, {
				// 					fn: function(___c0nt3xt) {
				// 						var ___v1ew = [];
				// 						___v1ew.push(can.view.txt(1, '', 0, this, 
				//								function() {
				//  								return can.Mustache.txt(
				// 									___st4ck(___c0nt3xt, this), 
				// 									null, 
				// 									can.Mustache.get("b.c.d.e.name", 
				// 										___st4ck(___c0nt3xt, this))
				// 								);
				// 							}
				// 						));
				// 						return ___v1ew.join("");
				// 					}
				// 				}]
				//			)
				// 		}));
				//		___v1ew.push("\" == \"Phil\"");
				//
				// This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
				// These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
				// The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
				// or both, but there isn't any way to determine that at compilation time).
				// 
				// Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
				// This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
				// aren't used, `___c0nt3xt` will be equivalent to the `___st4ck(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
				// works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
				// ensure that live binding in nested sections works properly.
				//
				// All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
				//
				// #### Implementation
				{
					name: /^.*$/,
					fn: function(content, cmd) {
						var mode = false,
							result = [];

						// Trim the content so we don't have any trailing whitespace.
						content = can.trim(content);

						// Determine what the active mode is.
						// 
						// * `#` - Truthy section
						// * `^` - Falsey section
						// * `/` - Close the prior section
						// * `else` - Inverted section (only exists within a truthy/falsey section)
						if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
							mode = mode[0];
							switch (mode) {
								/**
								 * @function can.Mustache.helpers.section {{#key}}
								 * @parent can.Mustache.tags 2
								 * 
								 * @signature `{{#key}}BLOCK{{/key}}`
								 * 
								 * Render blocks of text one or more times, depending 
								 * on the value of the key in the current context.
								 * 
								 * @param {can.Mustache.key} key A key that references a value within the current or parent 
								 * [can.Mustache.context context]. If the value is a function or [can.compute], the 
								 * function's return value is used.
								 * 
								 * 
								 * @return {String} 
								 * 
								 * Depending on the value's type, the following actions happen:
								 * 
								 * - `Array` or [can.Observe.List] - the block is rendered for 
								 *   each item in the array. The [can.Mustache.context context] is set to 
								 *   the item within each block rendering.
								 * - A `truthy` value - the block is rendered with the [can.Mustache.context context]
								 *   set to the value.
								 * - A `falsey` value - the block is not rendered.
								 * 
								 * The rendered result of the blocks, block or an empty string is returned.
								 * 
								 * @body
								 * 
								 * Sections contain text blocks and evaluate whether to render it or not.  If
								 * the object evaluates to an array it will iterate over it and render the block
								 * for each item in the array.  There are four different types of sections.
								 * 
								 * ## Falseys or Empty Arrays
								 * 
								 * If the value returns a `false`, `undefined`, `null`, `""` or `[]` we consider
								 * that a *falsey* value.
								 * 
								 * If the value is falsey, the section will **NOT** render the block.
								 * 
								 * 	{ 
								 * 		friends: false
								 * 	}
								 * 
								 * 	{{#friends}}
								 * 		Never shown!
								 * 	{{/friends}}
								 * 
								 * 
								 * ## Arrays
								 * 
								 * If the value is a non-empty array, sections will iterate over the 
								 * array of items, rendering the items in the block.
								 * 
								 * For example, a list of friends will iterate
								 * over each of those items within a section.
								 * 
								 *     { 
								 *         friends: [ 
								 *             { name: "Austin" }, 
								 *             { name: "Justin" } 
								 *         ] 
								 *     }
								 * 
								 *     <ul>
								 *         {{#friends}}
								 *             <li>{{name}}</li>
								 *         {{/friends}}
								 *     </ul>
								 * 
								 * would render:
								 * 
								 *     <ul>
								 *         <li>Austin</li>
								 *         <li>Justin</li>
								 *     </ul>
								 * 
								 * Reminder: Sections will reset the current context to the value for which its iterating.
								 * See the [basics of contexts](#Basics) for more information.
								 * 
								 * ## Truthys
								 * 
								 * When the value is a non-falsey object but not a list, it is considered truthy and will be used 
								 * as the context for a single rendering of the block.
								 * 
								 *     {
								 *         friends: { name: "Jon" }
								 *     }
								 * 
								 *     {{#friends}}
								 *         Hi {{name}}
								 *     {{/friends}}
								 * 
								 * would render:
								 * 
								 *     Hi Jon!
								 */
								// 
								/**
								 * @function can.Mustache.helpers.helper {{helper args hashes}}
								 * @parent can.Mustache.tags 5
								 * 
								 * @description Calls a mustache helper function and inserts its return value into
								 * the rendered template.
								 * 
								 * @signature `{{helper [args...] [hashProperty=hashValue...]}}`
								 * 
								 * Calls a mustache helper function or a function. For example:
								 * 
								 * The template:
								 * 
								 *     <p>{{madLib "Lebron James" verb 4 foo="bar"}}</p>
								 * 
								 * Rendered with:
								 * 
								 *     {verb: "swept"}
								 * 
								 * Will call a `madLib` helper with the following arguements:
								 * 
								 *     can.Mustache.registerHelper('madLib', 
								 *       function(subject, verb, number, options){
								 *         // subject -> "Lebron James"
								 *         // verb -> "swept"
								 *         // number -> 4
								 *         // options.hash.foo -> "bar"
								 *     });
								 * 
								 * @param {can.Mustache.key} helper A key that finds a [can.Mustache.helper helper function]
								 * that is either [can.Mustache.registerHelper registered] or found within the
								 * current or parent [can.Mustache.context context].
								 * 
								 * @param {...can.Mustache.key|String|Number} [args] Space seperated arguments
								 * that get passed to the helper function as arguments. If the key's value is a:
								 * 
								 *  - [can.Observe] - A getter/setter [can.compute] is passed.
								 *  - [can.compute] - The can.compute is passed.
								 *  - `function` - The function's return value is passed.
								 * 
								 * @param {String} hashProperty
								 * 
								 * A property name that gets added to a [can.Mustache.helperOptions helper options]'s 
								 * hash object.
								 * 
								 * @param {...can.Mustache.key|String|Number} hashValue A value that gets 
								 * set as a property value of the [can.Mustache.helperOptions helper option argument]'s 
								 * hash object.
								 * 
								 * @body
								 * 
								 * ## Use
								 * 
								 * The `{{helper}}` syntax is used to call out to Mustache [can.Mustache.helper helper functions] that may do
								 * more complex functionality. `helper` is a [can.Mustache.key key] that must match either:
								 * 
								 *  - a [can.Mustache.registerHelper registered helper function], or
								 *  - a function in the current or parent [can.Mustache.context contexts]
								 * 
								 * The following example shows both cases.
								 * 
								 * The Template:
								 * 
								 *     <p>{{greeting}} {{user}}</p>
								 * 
								 * Rendered with data:
								 * 
								 *     {
								 *       user: function(){ return "Justin" }
								 *     }
								 * 
								 * And a with a registered helper like:
								 * 
								 *     can.Mustache.registerHelper('greeting', function(){
								 *       return "Hello"
								 *     });
								 * 
								 * Results in:
								 * 
								 *     <p>Hello Justin</p>
								 * 
								 * ## Arguments
								 * 
								 * Arguments can be passed from the template to helper function by
								 * listing space seperated strings, numbers or other [can.Mustache.key keys] after the
								 * `helper` name.  For example:
								 * 
								 * The template:
								 * 
								 *     <p>{{madLib "Lebron James" verb 4}}</p>
								 * 
								 * Rendered with:
								 * 
								 *     {verb: "swept"}
								 * 
								 * Will call a `madLib` helper with the following arguements:
								 * 
								 *     can.Mustache.registerHelper('madLib', 
								 *       function(subject, verb, number, options){
								 *         // subject -> "Lebron James"
								 *         // verb -> "swept"
								 *         // number -> 4
								 *     });
								 * 
								 * If an argument `key` value is a [can.Observe] property, the Observe's 
								 * property is converted to a getter/setter [can.compute]. For example:
								 * 
								 * The template:
								 * 
								 *     <p>What! My name is: {{mr user.name}}</p>
								 * 
								 * Rendered with:
								 * 
								 *     {user: new can.Observe({name: "Slim Shady"})}
								 * 
								 * Needs the helper to check if name is a function or not:
								 * 
								 *     can.Mustache.registerHelper('mr',function(name){
								 *       return "Mr. "+ (typeof name === "function" ?
								 *                       name():
								 *                       name)
								 *     })
								 * 
								 * This behavior enables two way binding helpers and is explained in more detail 
								 * on the [can.Mustache.helper helper functions] docs.
								 * 
								 * ## Hash
								 * 
								 * If enumerated arguments isn't an appropriate way to configure the behavior
								 * of a helper, it's possible to pass a hash of key-value pairs to the
								 * [can.Mustache.helperOptions helper option argument]'s 
								 * hash object.  Properties and values are specified 
								 * as `hashProperty=hashValue`.  For example:
								 * 
								 * The template:
								 * 
								 *     <p>My {{excuse who=pet how="shreded"}}</p>
								 * `
								 * And the helper:
								 * 
								 *     can.Mustache.registerHelper("excuse",function(options){
								 *       return ["My",
								 *         options.hash.who || "dog".
								 *         options.hash.how || "ate",
								 *         "my",
								 *         options.hash.what || "homework"].join(" ")
								 *     })
								 * 
								 * Render with:
								 * 
								 *     {pet: "cat"}
								 * 
								 * Results in:
								 * 
								 *     <p>My cat shareded my homework</p>
								 * 
								 * ## Returning an element callback function
								 * 
								 * If a helper returns a function, that function is called back after
								 * the template has been rendered into DOM elements. This can 
								 * be used to create mustache tags that have rich behavior. Read about it
								 * on the [can.Mustache.helper helper function] page.
								 * 
								 */
								// 
								/**
								 * @function can.Mustache.helpers.sectionHelper {{#helper args hashes}}
								 * @parent can.Mustache.tags 6
								 * 
								 * Calls a mustache helper function with a block, and optional inverse 
								 * block.
								 * 
								 * @signature `{{#helper [args...] [hashName=hashValue...]}}BLOCK{{/helper}}`
								 * 
								 * Calls a mustache helper function or a function with a block to 
								 * render.
								 * 
								 * The template:
								 * 
								 *     <p>{{countTo number}}{{num}}{{/countTo}}</p>
								 * 
								 * Rendered with:
								 * 
								 *     {number: 5}
								 * 
								 * Will call the `countTo` helper:
								 * 
								 *     can.Mustache.registerHelper('madLib', 
								 *       function(number, options){
								 * 	       var out = []
								 *         for(var i =0; i < number; i++){
								 *           out.push( options.fn({num: i+1}) )
								 *         }
								 *         return out.join(" ")
								 *     });
								 * 
								 * Results in:
								 * 
								 *     <p>1 2 3 4 5</p>
								 * 
								 * @param {can.Mustache.key} helper A key that finds a [can.Mustache.helper helper function]
								 * that is either [can.Mustache.registerHelper registered] or found within the
								 * current or parent [can.Mustache.context context].
								 * 
								 * @param {...can.Mustache.key|String|Number} [args] Space seperated arguments
								 * that get passed to the helper function as arguments. If the key's value is a:
								 * 
								 *  - [can.Observe] - A getter/setter [can.compute] is passed.
								 *  - [can.compute] - The can.compute is passed.
								 *  - `function` - The function's return value is passed.
								 * 
								 * @param {String} hashProperty
								 * 
								 * A property name that gets added to a [can.Mustache.helperOptions helper options]'s 
								 * hash object.
								 * 
								 * @param {...can.Mustache.key|String|Number} hashValue A value that gets 
								 * set as a property value of the [can.Mustache.helperOptions helper option argument]'s 
								 * hash object.
								 * 
								 * @param {mustache} BLOCK A mustache template that gets compiled and
								 * passed to the helper function as the [can.Mustache.helperOptions options argument's] `fn`
								 * property.
								 * 
								 * 
								 * @signature `{{#helper [args...] [hashName=hashValue...]}}BLOCK{{else}}INVERSE{{/helper}}`
								 * 
								 * Calls a mustache helper function or a function with a `fn` and `inverse` block to
								 * render.
								 * 
								 * The template:
								 * 
								 *     <p>The bed is 
								 *        {{isJustRight firmness}}
								 *           pefect!
								 *        {{else}}
								 *           uncomfortable.
								 *        {{/justRight}}</p>
								 * 
								 * Rendered with:
								 * 
								 *     {firmness: 45}
								 * 
								 * Will call the `isJustRight` helper:
								 * 
								 *     can.Mustache.registerHelper('isJustRight', 
								 *       function(number, options){
								 * 	       if(number > 50){
								 *           return options.fn(this)  
								 *         } else {
								 *           return options.inverse(this)  
								 *         }
								 *         return out.join(" ")
								 *     });
								 * 
								 * Results in:
								 * 
								 *     <p>The bed is uncomfortable.</p>
								 * 
								 * @param {can.Mustache.key} helper A key that finds a [can.Mustache.helper helper function]
								 * that is either [can.Mustache.registerHelper registered] or found within the
								 * current or parent [can.Mustache.context context].
								 * 
								 * @param {...can.Mustache.key|String|Number} [args] Space seperated arguments
								 * that get passed to the helper function as arguments. If the key's value is a:
								 * 
								 *  - [can.Observe] - A getter/setter [can.compute] is passed.
								 *  - [can.compute] - The can.compute is passed.
								 *  - `function` - The function's return value is passed.
								 * 
								 * @param {String} hashProperty
								 * 
								 * A property name that gets added to a [can.Mustache.helperOptions helper options]'s 
								 * hash object.
								 * 
								 * @param {...can.Mustache.key|String|Number} hashValue A value that gets 
								 * set as a property value of the [can.Mustache.helperOptions helper option argument]'s 
								 * hash object.
								 * 
								 * @param {mustache} BLOCK A mustache template that gets compiled and
								 * passed to the helper function as the [can.Mustache.helperOptions options argument's] `fn`
								 * property.
								 * 
								 * @param {mustache} INVERSE A mustache template that gets compiled and
								 * passed to the helper function as the [can.Mustache.helperOptions options argument's] `inverse`
								 * property.
								 * 
								 * 
								 * @body
								 * 
								 * ## Use
								 * 
								 * Read the [use section of {{helper}}](can.Mustache.helpers.helper.html#section_Use) to better understand how:
								 * 
								 *  - [Helper functions are found](can.Mustache.helpers.helper.html#section_Arguments)
								 *  - [Arguments are passed to the helper](can.Mustache.helpers.helper.html#section_Arguments)
								 *  - [Hash values are passed to the helper](can.Mustache.helpers.helper.html#section_Hash)
								 * 
								 * Read how [helpers that return functions](can.Mustache.helper.html#section_Returninganelementcallbackfunction) can
								 * be used for rich behavior like 2-way binding.
								 * 
								 */
								// Open a new section.
								case '#':
								/**
								 * @function can.Mustache.helpers.inverse {{^key}}
								 * @parent can.Mustache.tags 4
								 * 
								 * @signature `{{^key}}BLOCK{{/key}}`
								 * 
								 * Render blocks of text if the value of the key
								 * is falsey.  An inverted section syntax is similar to regular 
								 * sections except it begins with a caret rather than a 
								 * pound. If the value referenced is falsey, the section will render.
								 * 
								 * @param {can.Mustache.key} key A key that references a value within the current or parent 
								 * [can.Mustache.context context]. If the value is a function or [can.compute], the 
								 * function's return value is used.
								 * 
								 * @return {String} 
								 * 
								 * Depending on the value's type, the following actions happen:
								 * 
								 * - A `truthy` value - the block is not rendered.
								 * - A `falsey` value - the block is rendered.
								 * 
								 * The rendered result of the block or an empty string is returned.
								 * 
								 * @body
								 * 
								 * ## Use
								 * 
								 * Inverted sections match falsey values. An inverted section 
								 * syntax is similar to regular sections except it begins with a caret 
								 * rather than a pound. If the value referenced is falsey, the section 
								 * will render. For example:
								 * 
								 * 
								 * The template:
								 * 
								 *     <ul>
								 *         {{#friends}}
								 *             </li>{{name}}</li>
								 *         {{/friends}}
								 *         {{^friends}}
								 *             <li>No friends.</li>
								 *         {{/friends}}
								 *     </ul>
								 * 
								 * And data:
								 * 
								 *     {
								 *         friends: []
								 *     }
								 * 
								 * Results in:
								 * 
								 * 
								 *     <ul>
								 *         <li>No friends.</li>
								 *     </ul>
								 */
								case '^':
									result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
									break;
								// Close the prior section.
								/**
								 * @function can.Mustache.helpers.close {{/key}}
								 * @parent can.Mustache.tags 3
								 * 
								 * @signature `{{/key}}`
								 * 
								 * Ends a [can.Mustache.helpers.section {{#key}}] or [can.Mustache.helpers.sectionHelper {{#helper}}]
								 * block.
								 * 
								 * @param {can.Mustache.key} [key] A key that matches the opening key or helper name. It's also
								 * possible to simply write `{{/}}` to end a block.
								 */
								case '/':
									return { raw: 'return ___v1ew.join("");}}])}));' };
									break;
							}
							
							// Trim the mode off of the content.
							content = content.substring(1);
						}
						
						// `else` helpers are special and should be skipped since they don't 
						// have any logic aside from kicking off an `inverse` function.
						if (mode != 'else') {
							var args = [],
								i = 0,
								hashing = false,
								arg, split, m;
							
							// Parse the helper arguments.
							// This needs uses this method instead of a split(/\s/) so that 
							// strings with spaces can be correctly parsed.
							(can.trim(content)+' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function(whole, part) {
								args.push(part);
							});

							// Start the content render block.
							result.push('can.Mustache.txt('+CONTEXT_OBJ+',' + (mode ? '"'+mode+'"' : 'null') + ',');
						
							// Iterate through the helper arguments, if there are any.
							for (; arg = args[i]; i++) {
								i && result.push(',');
								
								// Check for special helper arguments (string/number/boolean/hashes).
								if (i && (m = arg.match(/^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/))) {
									// Found a native type like string/number/boolean.
									if (m[2]) {
										result.push(m[0]);
									}
									// Found a hash object.
									else {
										// Open the hash object.
										if (!hashing) {
											hashing = true;
											result.push('{' + HASH + ':{');
										}
										
										// Add the key/value.
										result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g,'\\"') + '",' + CONTEXT_OBJ + ')');
										
										// Close the hash if this was the last argument.
										if (i == args.length - 1) {
											result.push('}}');
										}
									}
								}
								// Otherwise output a normal interpolation reference.
								else {
									result.push('can.Mustache.get("' + 
										// Include the reference name.
										arg.replace(/"/g,'\\"') + '",' +
										// Then the stack of context.
										CONTEXT_OBJ +
										// Flag as a helper method to aid performance, 
										// if it is a known helper (anything with > 0 arguments).
										(i == 0 && args.length > 1 ? ',true' : ',false') +
										(i > 0 ? ',true' : ',false') +
										')');
								}
							}
						}
						
						// Create an option object for sections of code.
						mode && mode != 'else' && result.push(',[{_:function(){');
						switch (mode) {
							// Truthy section
							case '#':
								result.push('return ___v1ew.join("");}},{fn:function(' + CONTEXT + '){var ___v1ew = [];');
								break;
							// If/else section
							// Falsey section
							/**
							 * @function can.Mustache.helpers.else {{else}}
							 * @parent can.Mustache.tags 8
							 *
							 * @signature `{{#helper}}BLOCK{{else}}INVERSE{{/helper}}`
							 * 
							 * Creates an `inverse` block for a [can.Mustache.helper helper function]'s 
							 * [can.Mustache.helperOptions options argument]'s `inverse` property.
							 * 
							 * @param {can.Mustache} INVERSE a mustache template coverted to a
							 * function and set as the [can.Mustache.helper helper function]'s 
							 * [can.Mustache.helperOptions options argument]'s `inverse` property.
							 * 
							 * @body
							 * 
							 * ## Use
							 * 
							 * For more information on how `{{else}}` is used checkout:
							 * 
							 *  - [can.Mustache.helpers.if {{if key}}]
							 *  - [can.Mustache.helpers.sectionHelper {{#helper}}]
							 * 
							 */
							case 'else':
							case '^':
								result.push('return ___v1ew.join("");}},{inverse:function(' + CONTEXT + '){var ___v1ew = [];');
								break;
							// Not a section
							default:
								result.push(');');
								break;
						}
						
						// Return a raw result if there was a section, otherwise return the default string.
						result = result.join('');
						return mode ? { raw: result } : result;
					}
				}
			]
		})
	});

	// Add in default scanner helpers first.
	// We could probably do this differently if we didn't 'break' on every match.
	var helpers = can.view.Scanner.prototype.helpers;
	for (var i = 0; i < helpers.length; i++) {
		Mustache.prototype.scanner.helpers.unshift(helpers[i]);
	};

	/**
	 * @function can.Mustache.txt
	 * @hide
	 * 
	 * Evaluates the resulting string based on the context/name.
	 *
	 * @param {Object|Array} context	The context stack to be used with evaluation.
	 * @param {String} mode		The mode to evaluate the section with: # for truthy, ^ for falsey
	 * @param {String|Object} name	The string (or sometimes object) to pass to the given helper method.
	 */
	Mustache.txt = function(context, mode, name) {
		// Grab the extra arguments to pass to helpers.
		var args = Array.prototype.slice.call(arguments, 3),
			// Create a default `options` object to pass to the helper.
			options = can.extend.apply(can, [{
					fn: function() {},
					inverse: function() {}
			}].concat(mode ? args.pop() : []));
			
			
		var extra = {};
		if(context.context) {
			extra = context.options;
			context = context.context;
		}

		// Check for a registered helper or a helper-like function.
		if (helper = (Mustache.getHelper(name,extra) || (can.isFunction(name) && !name.isComputed && { fn: name }))) {
			// Use the most recent context as `this` for the helper.
			var stack = context[STACKED] && context,
				context = (stack && context[context.length - 1]) || context,
				// Update the options with a function/inverse (the inner templates of a section).
				opts = {
					fn: can.proxy(options.fn, context),
					inverse: can.proxy(options.inverse, context)
				}, 
				lastArg = args[args.length-1];
			
			// Store the context stack in the options if one exists
			if (stack) {
				opts.contexts = stack;
			}
			// Add the hash to `options` if one exists
			if (lastArg && lastArg[HASH]) {
				opts.hash = args.pop()[HASH];
			}
			args.push(opts);

			// Call the helper.
			return helper.fn.apply(context, args) || '';
		}

		// if a compute, get the value
		if( can.isFunction(name) && name.isComputed ){
			name = name();
		}

		// An array of arguments to check for truthyness when evaluating sections.
		var validArgs = args.length ? args : [name],
			// Whether the arguments meet the condition of the section.
			valid = true,
			result = [],
			i, helper, argIsObserve, arg;
		// Validate the arguments based on the section mode.
		if (mode) {
			for (i = 0; i < validArgs.length; i++) {
				arg          = validArgs[i];
				argIsObserve = typeof arg !== 'undefined' && isObserve(arg);
				// Array-like objects are falsey if their length = 0.
				if (isArrayLike(arg)) {
					// Use .attr to trigger binding on empty lists returned from function
					if(mode == '#'){
						valid = valid && !!(argIsObserve ? arg.attr('length') : arg.length);
					} else if(mode == '^'){
						valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
					}
				}
				// Otherwise just check if it is truthy or not.
				else {
					valid = mode == '#' ? valid && !!arg
						: mode == '^' ? valid && !arg
						: valid;
				}
			}
		}
		
		// Otherwise interpolate like normal.
		if (valid) {
			switch (mode) {
				// Truthy section.
				case '#':
					// Iterate over arrays
					if (isArrayLike(name)) {
						var isObserveList = isObserve(name);
						
						// Add the reference to the list in the contexts.
						for (i = 0; i < name.length; i++) {
							result.push(options.fn.call(name[i], context) || '');
							
							// Ensure that live update works on observable lists
							isObserveList && name.attr(''+i);
						}
						return result.join('');
					}
					// Normal case.
					else {
						return options.fn.call(name || {}, context) || '';
					}
					break;
				// Falsey section.
				case '^':
					return options.inverse.call(name || {}, context) || '';
					break;
				default:
					// Add + '' to convert things like numbers to strings.
					// This can cause issues if you are trying to
					// eval on the length but this is the more
					// common case.
					return '' + (name !== undefined ? name : '');
					break;
			}
		}
		
		return '';
	};
	
	/**
	 * @function can.Mustache.get
	 * @hide
	 *
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
	Mustache.get = function(ref, contexts, isHelper, isArgument) {
		var options = contexts.options || {};
		contexts = contexts.context || contexts;
		// Assume the local object is the last context in the stack.
		var obj = contexts[contexts.length - 1],
			// Assume the parent context is the second to last context in the stack.
			context = contexts[contexts.length - 2],
			// Split the reference (like `a.b.c`) into an array of key names.
			names = ref.indexOf('\\.') == -1 
				// Reference doesn't contain escaped periods
				? ref.split('.')
				// Reference contains escaped periods (`a.b\c.foo` == `a["b.c"].foo)
				: (function() {
						var names = [], last = 0;
						ref.replace(/(\\)?\./g, function($0, $1, index) {
							if (!$1) {
								names.push(ref.slice(last, index).replace(/\\\./g,'.'));
								last = index + $0.length;
							}
						});
						names.push(ref.slice(last).replace(/\\\./g,'.'));
						return names;
					})(),
			namesLength = names.length,
			value, lastValue, name, i, j,
			// if we walk up and don't find a property, we default
			// to listening on an undefined property of the first
			// context that is an observe
			defaultObserve,
			defaultObserveName;

		// Handle `this` references for list iteration: {{.}} or {{this}}
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
		// Handle object resolution (like `a.b.c`).
		else if (!isHelper) {
			// Reverse iterate through the contexts (last in, first out).
			for (i = contexts.length - 1; i >= 0; i--) {
				// Check the context for the reference
				value = contexts[i];
			
				// Is the value a compute?
				if(can.isFunction(value) && value.isComputed) {
					value = value();
				}
			
				// Make sure the context isn't a failed object before diving into it.
				if (typeof value !== 'undefined' && value !== null) {
					var isHelper = Mustache.getHelper(ref, options);
					for (j = 0; j < namesLength; j++) {
						// Keep running up the tree while there are matches.
						if (typeof value[names[j]] !== 'undefined' && value[names[j]] !== null) {
							lastValue = value;
							value = value[name = names[j]];
						}
						// if there's a name conflict between property and helper
						// property wins
						else if(isHelper) {
							return ref;
						}
						// If it's undefined, still match if the parent is an Observe.
						else if ( isObserve(value) ) {
							defaultObserve = value;
							defaultObserveName = names[j];
							lastValue = value = undefined;
							break;
						}
						else {
							lastValue = value = undefined;
							break;
						}
					}
				}
			
				// Found a matched reference.
				if (value !== undefined ) {
					return Mustache.resolve(value, lastValue, name, isArgument);
				}
			}
		}

		if( defaultObserve && 
			// if there's not a helper by this name and no attribute with this name
			!(Mustache.getHelper(ref) &&
				can.inArray(defaultObserveName, can.Observe.keys(defaultObserve)) === -1) ) {
			return defaultObserve.compute(defaultObserveName);
		}
		// Support helpers without arguments, but only if there wasn't a matching data reference.
		// Helpers have priority over local function, see https://github.com/bitovi/canjs/issues/258
		if (value = Mustache.getHelper(ref,options)) {
			return ref;
		} else if (typeof obj !== 'undefined' && obj !== null && can.isFunction(obj[ref])) {
			// Support helper-like functions as anonymous helpers
			return obj[ref];
		}

		return '';
	};
	
	/**
	 * @hide
	 *
	 * Resolves an object to its truthy equivalent.
	 *
	 * @param {Object} value    The object to resolve.
	 * @param {Object} [lastValue]  	Only used with Mustache.get.
	 * @param {Object} [name]  				Only used with Mustache.get.
	 * @param {Boolean} [isArgument]  Only used with Mustache.get.
	 * @return {Object} The resolved object.
	 */
	Mustache.resolve = function(value, lastValue, name, isArgument) {
		if(lastValue && can.isFunction(lastValue[name]) && isArgument) {
			if(lastValue[name].isComputed){
				return lastValue[name];
			}
			// Don't execute functions if they are parameters for a helper and are not a can.compute
			// Need to bind it to the original context so that that information doesn't get lost by the helper
			return function() { 
				return lastValue[name].apply(lastValue, arguments); 
			};
		}
		// Support attributes on compute objects
		else if(lastValue && can.isFunction(lastValue) && lastValue.isComputed) {
			return lastValue()[name];
		}
		// Support functions stored in objects.
		else if (lastValue && can.isFunction(lastValue[name])) {
			return lastValue[name]();
		} 
		// Invoke the length to ensure that Observe.List events fire.
		else if (isObserve(value) && isArrayLike(value) && value.attr('length')){
			return value;
		}
		// Add support for observes
		else if (lastValue && isObserve(lastValue)) {
			return lastValue.compute(name);
		} 
		else if (can.isFunction(value)) {
			return value();
		}
		else {
			return value;
		}
	};
	
	/**
	 * @static
	 */
	// ## Helpers
	//
	// Helpers are functions that can be called from within a template.
	// These helpers differ from the scanner helpers in that they execute
	// at runtime instead of during compilation.
	//
	// Custom helpers can be added via `can.Mustache.registerHelper`,
	// but there are also some built-in helpers included by default.
	// Most of the built-in helpers are little more than aliases to actions 
	// that the base version of Mustache simply implies based on the 
	// passed in object.
	// 
	// Built-in helpers:
	// 
	// * `data` - `data` is a special helper that is implemented via scanning helpers. 
	//		It hooks up the active element to the active data object: `<div {{data "key"}} />`
	// * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
	// * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
	// * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
	// * `with` - Opens a context section: `{{#with var}} render {{/with}}`
	Mustache._helpers = {};
	/**
	 * @description Register a helper.
	 * @function can.Mustache.registerHelper registerHelper
	 * @signature `Mustache.registerHelper(name, helper)`
	 * @param {String} name The name of the helper.
	 * @param {can.Mustache.helper} helper The helper function.
	 * 
	 * @body
	 * Registers a helper with the Mustache system.
	 * Pass the name of the helper followed by the
	 * function to which Mustache should invoke.
	 * These are run at runtime.
	 */
	Mustache.registerHelper = function(name, fn){
		this._helpers[name]={ name: name, fn: fn };
	};
	
	/**
	 * @hide
	 * @function can.Mustache.getHelper getHelper
	 * @description Retrieve a helper.
	 * @signature `Mustache.getHelper(name)`
	 * @param {String} name The name of the helper.
	 * @return {Function|null} The helper, or `null` if
	 * no helper by that name is found.
	 *
	 * @body 
	 * Returns a helper given the name.
	 */
	Mustache.getHelper = function(name,options) {
		return options && options.helpers && options.helpers[name] && {
			fn: options.helpers[name]
		} || this._helpers[name]
		for (var i = 0, helper; helper = [i]; i++) {
			// Find the correct helper
			if (helper.name == name) {
				return helper;
			}
		}
		return null;
	};

	/**
	 * @function can.Mustache.static.render render
	 * @hide
	 * @parent can.Mustache.static
	 * @signature `Mustache.render(partial, context)`
	 * @param {Object} partial
	 * @param {Object} context
	 *
	 * @body
	 * `Mustache.render` is a helper method that calls
	 * into `can.view.render` passing the partial 
	 * and the context object.  
	 * 
	 * Its purpose is to determine if the partial object 
	 * being passed represents a template like:
	 *
	 * 		partial === "movember.mustache"
	 *
	 * or if the partial is a variable name that represents
	 * a partial on the context object such as:
	 *
	 * 		context[partial] === "movember.mustache"
	 */
	Mustache.render = function(partial, context){
		// Make sure the partial being passed in
		// isn't a variable like { partial: "foo.mustache" }
		if(!can.view.cached[partial] && context[partial]){
			partial = context[partial];
		}

		// Call into `can.view.render` passing the
		// partial and context.
		return can.view.render(partial, context);
	};

	Mustache.renderPartial = function(partial,context,options) {
		return partial.render ? partial.render(context,options) :
			partial(context,options);
	};

	// The built-in Mustache helpers.
	can.each({
		// Implements the `if` built-in helper.
		/**
		 * @function can.Mustache.helpers.if {{#if key}}
		 * @parent can.Mustache.tags 7
		 * @signature `{{#if key}}BLOCK{{/if}}`
	 	 * 
	 	 * Renders the `BLOCK` template within the current template.
	 	 * 
	 	 * @param {can.Mustache.key} key A key that references a value within the current or parent 
	 	 * context. If the value is a function or can.compute, the function's return value is used.
	 	 * 
	 	 * @param {can.Mustache} BLOCK A mustache template.
	 	 * 
	 	 * @return {String} If the key's value is truthy, the `BLOCK` is rendered with the
	 	 * current context and its value is returned; otherwise, an empty string.
	 	 * 
	 	 * @body
	 	 * 
	 	 * ## Use
	 	 * 
		 * `{{#if key}}` provides explicit conditional truthy tests. For example,
		 * 
		 * The template:
		 * 
		 *     {{#if user.isFemale}}
		 *       {{#if user.isMarried}}
		 *         Mrs 
		 *       {{/if}}
		 *       {{#if user.isSingle}}
		 *         Miss 
		 *       {{/if}}
		 *     {{/if}}
		 * 
		 * Rendered with:
		 * 
		 *     {user: {isFemale: true, isMarried: true}}
		 *     
		 * Results in:
		 * 
		 *     Mrs
		 * 
		 * If can be used with [can.Mustache.helpers.else {{else}}] too. For example,
		 * 
		 *     {{#if user.isFemale}}
		 *       {{#if user.isMarried}}
		 *         Mrs 
		 *       {{else}}
		 *         Miss 
		 *       {{/if}}
		 *     {{/if}}
		 * 
		 * Rendered with:
		 * 
		 *     {user: {isFemale: true, isMarried: false}}
		 *     
		 * Results in:
		 * 
		 *     Miss
		 */
		'if': function(expr, options){
			if (!!Mustache.resolve(expr)) {
				return options.fn(options.contexts || this);
			}
			else {
				return options.inverse(options.contexts || this);
			}
		},
		// Implements the `unless` built-in helper.
		/**
		 * @function can.Mustache.helpers.unless {{#unless key}}
		 * @parent can.Mustache.tags 10
		 * 
	 	 * @signature `{{#unless key}}BLOCK{{/unless}}`
	 	 * 
	 	 * Render the block of text if the key's value is falsey.
	 	 * 
	 	 * @param {can.Mustache.key} key A key that references a value within the current or parent 
		 * context. If the value is a function or can.compute, the function's 
		 * return value is used.
		 * 
	 	 * @param {can.Mustache} BLOCK A template that is rendered 
	 	 * if the `key`'s value is falsey.
	 	 * 
	 	 * @body
	 	 * 
		 * The `unless` helper evaluates the inverse of the value
		 * of the key and renders the block between the helper and the slash.
		 * 
		 *     {{#unless expr}}
		 *       // unless
		 *     {{/unless}}
		 */
		'unless': function(expr, options){
			if (!Mustache.resolve(expr)) {
				return options.fn(options.contexts || this);
			}
		},
		
		// Implements the `each` built-in helper.
		/**
		 * @function can.Mustache.helpers.each {{#each key}}
	 	 * @parent can.Mustache.tags 9
	 	 * 
	 	 * @signature `{{#each key}}BLOCK{{/each}}`
	 	 * 
	 	 * Render the block of text for each item in key's value.
	 	 * 
	 	 * @param {can.Mustache.key} key A key that references a value within the current or parent 
		 * context. If the value is a function or can.compute, the function's 
		 * return value is used.
		 * 
		 * If the value of the key is a [can.Observe.List], the resulting HTML is updated when the
		 * list changes. When a change in the list happens, only the minimum amount of DOM
		 * element changes occur.
	 	 * 
	 	 * @param {can.Mustache} BLOCK A template that is rendered for each item in 
	 	 * the `key`'s value. The `BLOCK` is rendered with the context set to the item being rendered.
	 	 * 
	 	 * @body
	 	 * 
	 	 * ## Use
	 	 * 
	 	 * Use the `each` helper to itterate over a array 
		 * of items and render the block between the helper and the slash. For example,
		 * 
		 * The template:
		 * 
		 *     <ul>
		 *       {{#each friends}}
		 *         <li>{{name}}</li>
		 *       {{/each}}
		 *     </ul>
		 * 
		 * Rendered with:
		 * 
		 *     {friends: [{name: "Austin"},{name: "Justin"}]}
		 * 
		 * Renders:
		 * 
		 *     <ul>
		 *       <li>Austin</li>
		 *       <li>Justin</li>
		 *     </ul>
		 * 
		 */
		'each': function(expr, options) {
      		expr = Mustache.resolve(expr);
			if (!!expr && isArrayLike(expr)) {
				if (isObserve(expr) && typeof expr.attr('length') !== 'undefined') {
					return can.view.lists && can.view.lists(expr, function(item) {
						return options.fn(item);
					});
				}
				else {
					var result = [];
					for (var i = 0; i < expr.length; i++) {
						result.push(options.fn(expr[i]));
					}
					return result.join('');
				}
			}
		},
		// Implements the `with` built-in helper.
		/**
		 * @function can.Mustache.helpers.with {{#with key}}
		 * @parent can.Mustache.tags 11
		 * 
		 * @signature `{{#with key}}BLOCK{{/with}}`
		 * 
		 * Changes the context within a block.
		 * 
		 * @param {can.Mustache.key} key A key that references a value within the current or parent 
		 * context. If the value is a function or can.compute, the function's 
		 * return value is used.
		 * 
	 	 * @param {can.Mustache} BLOCK A template that is rendered 
	 	 * with the context of the `key`'s value.
		 * 
		 * @body
	 	 * 
		 * Mustache typically applies the context passed in the section 
		 * at compiled time.  However, if you want to override this 
		 * context you can use the `with` helper.
		 * 
		 *     {{#with arr}}
		 *       // with
		 *     {{/with}}
		 */
		'with': function(expr, options){
			var ctx = expr;
			expr = Mustache.resolve(expr);
			if (!!expr) {
				return options.fn(ctx);
			}
		}
		
		/**
		 * @function can.Mustache.helpers.elementCallback {{(el)->CODE}}
		 * @parent can.Mustache.tags
		 * @hide
		 * @signature `{{(el) -> CODE}}`
		 * 
		 * Runs a callback on the element.
		 * 
		 * 
		 */
		//
	}, function(fn, name){
		Mustache.registerHelper(name, fn);
	});
	
	// ## Registration
	//
	// Registers Mustache with can.view.
	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// Returns a `function` that renders the view.
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

	return can;
});