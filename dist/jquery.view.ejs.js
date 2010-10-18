// jquery/view/view.js

(function($){


	// converts to an ok dom id
	var toId = function( src ) {
		return src.replace(/^\/\//, "").replace(/[\/\.]/g, "_")
	},
		// used for hookup ids
		id = 1;

	/**
	 * @class jQuery.View
	 * @tag core
	 * @plugin jquery/view
	 * @test jquery/view/qunit.html
	 * 
	 * View provides a uniform interface for using templates with 
	 * jQuery. When template engines [jQuery.View.register register] 
	 * themselves, you are able to:
	 * 
	 * <ul>
	 *  <li>Use views with jQuery extensions [jQuery.fn.after after], [jQuery.fn.append append],
	 *  	[jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
	 *      [jQuery.fn.replace replace], [jQuery.fn.replaceWith replaceWith], [jQuery.fn.text text] like:
	 * @codestart
	 * $('.foo').html("//path/to/view.ejs",{})
	 * @codeend
	 *  </li>
	 *  <li>Compress processed views with [steal.static.views].</li>
	 *  <li>Use the [jQuery.Controller.prototype.view controller/view] plugin to auto-magically
	 *  lookup views.</li>
	 *  <li>Hookup jquery plugins directly in the template.</li>
	 *  
	 * </ul>
	 * 
	 * ## Supported Template Engines
	 * 
	 * JavaScriptMVC comes with the following template languages:
	 * 
	 *  - [jQuery.EJS EJS] - provides an ERB like syntax: <code>&lt;%= %&gt;</code>
	 *  - [Jaml] - A functional approach to JS templates.
	 *  - [Micro] - A very lightweight template similar to EJS.
	 *  - [jQuery.tmpl] - A very lightweight template similar to EJS.
	 * 
	 * There are 3rd party plugins that provide other template
	 * languages.
	 * 
	 * ## Use
	 * 
	 * Views provide client side templating.  When you use a view, you're
	 * almost always wanting to insert the rendered content into the page.
	 * 
	 * For this reason, the most common way to use a views is through
	 * jQuery modifier functions like [jQuery.fn.html html].  The view
	 * plugin overwrites these functions so you can render a view and
	 * insert its contents into the page with one convenient step.
	 * 
	 * The following renders the EJS template at 
	 * <code>//app/view/template.ejs</code> with the second parameter used as data.
	 * It inserts the result of the template into the 
	 * <code>'#foo'</code> element.
	 * 
	 * @codestart
	 * $('#foo').html('//app/view/template.ejs',
	 *                {message: "hello world"})
	 * @codeend
	 * 
	 * <code>//app/view/template.ejs</code> might look like:
	 * 
	 * @codestart xml
	 * &lt;h2>&lt;%= message %>&lt;/h2>&lt;/div>
	 * @codeend
	 * 
	 * The resulting output would be:
	 * 
	 * @codestart xml
	 * &lt;div id='foo'>&lt;h2>hello world&lt;/h2>&lt;/div>
	 * @codeend
	 * 
	 * The specifics of each templating languages are covered in their
	 * individual documentation pages.
	 * 
	 * ### Template Locations
	 * 
	 * In the example above, we used 
	 * <code>//app/view/template.ejs</code> as the location of
	 * our template file. Using // at the start of a path
	 * references the template from the root JavaScriptMVC directory.
	 * 
	 * If there is no // at the start of the path, the view is looked up
	 * relative to the current page.
	 * 
	 * It's recommended that you use paths rooted from the JavaScriptMVC
	 * directory.  This will make your code less likely to change.
	 * 
	 * You can also use the [jQuery.Controller.prototype.view controller/view]
	 * plugin to make looking up templates a little easier.
	 * 
	 * ### Using $.View
	 * 
	 * Sometimes you want to get the string result of a view and not
	 * insert it into the page right away.  Nested templates are a good
	 * example of this.  For this, you can use $.View.  The following
	 * iterates through a list of contacts, and inserts the result of a
	 * sub template in each:
	 * 
	 * @codestart xml
	 * &lt;% for(var i =0 ; i < contacts.length; i++) { %>
	 *   &lt;%= $.View("//contacts/contact.ejs",contacts[i]) %>
	 * &lt;% } %>
	 * @codeend
	 * 
	 * ## Compress Views with Steal
	 * 
	 * Steal can package processed views in the production file. Because 'stolen' views are already
	 * processed, they don't rely on eval. Here's how to steal them:
	 * 
	 * @codestart
	 * steal.views('//views/tasks/show.ejs');
	 * @codeend
	 * 
	 * Read more about [steal.static.views steal.views].
	 * 
	 * ## Hooking up controllers
	 * 
	 * After drawing some html, you often want to add other widgets and plugins inside that html.
	 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
	 * 
	 * @codestart
	 * &lt;ul &lt;%= Phui.Tabs%>>...&lt;ul>
	 * @codeend
	 * 
	 * You can even hook up multiple controllers:
	 * 
	 * @codestart
	 * &lt;ul &lt;%= [Phui.Tabs, Phui.Filler]%>>...&lt;ul>
	 * @codeend
	 * 
	 * @constructor 
	 * 
	 * Looks up a template, processes it, caches it, then renders the template
	 * with data and optional helpers.
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"})
	 * @codeend
	 * 
	 * @param {String} view The url or id of an element to use as the template's source.
	 * @param {Object} data The data to be passed to the view.
	 * @param {Object} [helpers] Optional helper functions the view might use.
	 * @return {String} The rendered result of the view.
	 */
	var $view = $.View = function( view, data, helpers ) {
		var suffix = view.match(/\.[\w\d]+$/),
			type, 
			el, 
			url, 
			id, 
			renderer,
			url = view;

		//if there is no suffix, add one
		if (!suffix ) {
			suffix = $.View.ext;
			url = url + $.View.ext
		}

		//convert to a unique and valid id
		id = toId(url);

		//if a absolute path, use steal to get it
		if ( url.match(/^\/\//) ) {
			url = steal.root.join(url.substr(2)); //can steal be removed?
		}

		//get the template engine
		type = $.View.types[suffix];

		//get the renderer function
		var renderer =
		$.View.cached[id] ? // is it cached?
			$.View.cached[id] : // use the cached version
			((el = document.getElementById(view)) ? //is it in the document?
				type.renderer(id, el.innerHTML) : //use the innerHTML of the elemnt
				get(type, id, url) //do an ajax request for it
		);

		//if we should cache templates
		if ( $.View.cache ) {
			$.View.cached[id] = renderer;
		}
		return renderer.call(type, data, helpers)
	},
		get = function(type, id, url){
			var text = $.ajax({
				async: false,
				url: url,
				dataType: "text",
				error: function() {
					throw "$.View ERROR: There is no template or an empty template at " + url;
				}
			}).responseText
			if (!text.match(/[^\s]/) ) {
				throw "$.View ERROR: There is no template or an empty template at " + url;
			}
			return type.renderer(id, text);
		};


	$.extend($.View, {
		/**
		 * @attribute hookups
		 * @hide
		 * A list of pending 'hookups'
		 */
		hookups: {},
		/**
		 * @function hookup
		 * Registers a hookup function to be called back after the html is put on the page
		 * @param {Function} cb a callback function to be called with the element
		 * @param {Number} the hookup number
		 */
		hookup: function( cb ) {
			var myid = ++id;
			$view.hookups[myid] = cb;
			return myid;
		},
		/**
		 * @attribute cached
		 * @hide
		 * Cached are put in this object
		 */
		cached: {},
		/**
		 * @attribute cache
		 * Should the views be cached or reloaded from the server. Defaults to true.
		 */
		cache: true,
		/**
		 * @function register
		 * Registers a template engine to be used with 
		 * view helpers and compression.  
		 * @param {Object} info a object of method and properties 
		 * that enable template integration:
		 * <ul>
		 * 		<li>suffix - the view extension.  EX: 'ejs'</li>
		 * 		<li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
		 * 			used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
		 * 		<li>renderer(id, text) - a function that takes the id of the template and the text of the template and
		 * 			returns a render function.</li>
		 * </ul>
		 */
		register: function( info ) {
			this.types["." + info.suffix] = info;
		},
		types: {},
		/**
		 * @attribute ext
		 * The default suffix to use if none is provided in the view's url.  
		 * This is set to .ejs by default.
		 */
		ext: ".ejs",
		/**
		 * Returns the text that 
		 * @hide 
		 * @param {Object} type
		 * @param {Object} id
		 * @param {Object} src
		 */
		registerScript: function( type, id, src ) {
			return "$.View.preload('" + id + "'," + $.View.types["." + type].script(id, src) + ");";
		},
		/**
		 * @hide
		 * Called by a production script to pre-load a renderer function
		 * into the view cache.
		 * @param {String} id
		 * @param {Function} renderer
		 */
		preload: function( id, renderer ) {
			$.View.cached[id] = function( data, helpers ) {
				return renderer.call(data, data, helpers)
			}
		}

	})


	//---- ADD jQUERY HELPERS -----
	var
	//converts jquery functions to use views	
	convert = function( func_name ) {
		var old = jQuery.fn[func_name];

		jQuery.fn[func_name] = function() {
			var args = arguments,
				res, hasHookup, secArgType = typeof arguments[1];

			//check if a template
			if ( typeof arguments[0] == "string" && (secArgType == 'object' || secArgType == 'function') && !arguments[1].nodeType && !arguments[1].jquery ) {
				args = [$.View.apply($.View, $.makeArray(arguments))];
			}

			//check if there are new hookups
			for ( var hasHookups in jQuery.View.hookups ) {};

			//if there are hookups, get jQuery object
			if ( hasHookups ) {
				args[0] = $(args[0])
			}
			res = old.apply(this, args)

			//now hookup hookups
			if ( hasHookups ) {
				hookupView(args[0])
			}
			return res;
		}
	},
		hookupView = function( els ) {
			//remove all hookups
			var hooks = jQuery.View.hookups,
				hookupEls, len, i = 0,
				id, func;
			jQuery.View.hookups = {};
			hookupEls = els.add("[data-view-id]", els);
			len = hookupEls.length;
			for (; i < len; i++ ) {
				if ( hookupEls[i].getAttribute && (id = hookupEls[i].getAttribute('data-view-id')) && (func = hooks[id]) ) {
					func(hookupEls[i], id);
					delete hooks[id];
					hookupEls[i].removeAttribute('data-view-id')
				}
			}
			//copy remaining hooks back
			$.extend(jQuery.View.hookups, hooks);
		},
		/**
		 *  @add jQuery.fn
		 */
		funcs = [
		/**
		 *  @function prepend
		 *  @parent jQuery.View
		 *  abc
		 */
		"prepend",
		/**
		 *  @function append
		 *  @parent jQuery.View
		 *  abc
		 */
		"append",
		/**
		 *  @function after
		 *  @parent jQuery.View
		 *  abc
		 */
		"after",
		/**
		 *  @function before
		 *  @parent jQuery.View
		 *  abc
		 */
		"before",
		/**
		 *  @function replace
		 *  @parent jQuery.View
		 *  abc
		 */
		"replace",
		/**
		 *  @function text
		 *  @parent jQuery.View
		 *  abc
		 */
		"text",
		/**
		 *  @function html
		 *  @parent jQuery.View
		 *  abc
		 */
		"html",
		/**
		 *  @function replaceWith
		 *  @parent jQuery.View
		 *  abc
		 */
		"replaceWith"];

	//go through helper funcs and convert
	for ( var i = 0; i < funcs.length; i++ ) {
		convert(funcs[i]);
	}


})(true);

// jquery/lang/lang.js

(function($){

	// Several of the methods in this plugin use code adapated from Prototype
	//  Prototype JavaScript framework, version 1.6.0.1
	//  (c) 2005-2007 Sam Stephenson
	var regs = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowerUpper: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g
	};

	/** 
	 * @class jQuery.String
	 */
	var str = ($.String = /* @Static*/ {
		/**
		 * @function strip
		 * @param {String} s returns a string with leading and trailing whitespace removed.
		 */
		strip: function( string ) {
			return string.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		/**
		 * Capitalizes a string
		 * @param {String} s the string to be lowercased.
		 * @return {String} a string with the first character capitalized, and everything else lowercased
		 */
		capitalize: function( s, cache ) {
			return s.charAt(0).toUpperCase() + s.substr(1);
		},

		/**
		 * Returns if string ends with another string
		 * @param {String} s String that is being scanned
		 * @param {String} pattern What the string might end with
		 * @return {Boolean} true if the string ends wtih pattern, false if otherwise
		 */
		endsWith: function( s, pattern ) {
			var d = s.length - pattern.length;
			return d >= 0 && s.lastIndexOf(pattern) === d;
		},
		/**
		 * Capitalizes a string from something undercored. Examples:
		 * @codestart
		 * jQuery.String.camelize("one_two") //-> "oneTwo"
		 * "three-four".camelize() //-> threeFour
		 * @codeend
		 * @param {String} s
		 * @return {String} a the camelized string
		 */
		camelize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 1;
			parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].substr(1);
			for (; i < parts.length; i++ )
			parts[i] = str.capitalize(parts[i]);
			return parts.join('');
		},
		/**
		 * Like camelize, but the first part is also capitalized
		 * @param {String} s
		 * @return {String} the classized string
		 */
		classize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ )
			parts[i] = str.capitalize(parts[i]);
			return parts.join('');
		},
		/**
		 * Like [jQuery.String.static.classize|classize], but a space separates each 'word'
		 * @codestart
		 * jQuery.String.niceName("one_two") //-> "One Two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the niceName
		 */
		niceName: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ )
			parts[i] = str.capitalize(parts[i]);
			return parts.join(' ');
		},

		/**
		 * Underscores a string.
		 * @codestart
		 * jQuery.String.underscore("OneTwo") //-> "one_two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the underscored string
		 */
		underscore: function( s ) {
			return s.replace(regs.colons, '/').
			replace(regs.words, '$1_$2').
			replace(regs.lowerUpper, '$1_$2').
			replace(regs.dash, '_').toLowerCase()
		}
	});


})(true);

// jquery/lang/rsplit/rsplit.js

(function($){

	/**
	 * @add jQuery.String.static
	 */
	$.String.
	/**
	 * Splits a string with a regex correctly cross browser
	 * @param {Object} string
	 * @param {Object} regex
	 */
	rsplit = function( string, regex ) {
		var result = regex.exec(string),
			retArr = [],
			first_idx, last_idx;
		while ( result != null ) {
			first_idx = result.index;
			last_idx = regex.lastIndex;
			if ( first_idx != 0 ) {
				retArr.push(string.substring(0, first_idx));
				string = string.slice(first_idx);
			}
			retArr.push(result[0]);
			string = string.slice(result[0].length);
			result = regex.exec(string);
		}
		if ( string != '' ) {
			retArr.push(string);
		}
		return retArr;
	}

})(true);

// jquery/view/ejs/ejs.js

(function($){


	//helpers we use 
	var chop = function( string ) {
		return string.substr(0, string.length - 1);
	},
		extend = $.extend,
		isArray = $.isArray,
		EJS = function( options ) {
			//returns a renderer function
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers)
				};
			}
			
			if ( typeof options == "function" ) {
				this.template = {};
				this.template.process = options;
				return;
			}
			//set options on self
			$.extend(this, EJS.options, options)

			var template = new EJS.Compiler(this.text, this.type);

			template.compile(options, this.name);

			this.template = template;
		},
		defaultSplitter = /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/;
	/**
	 * @class jQuery.EJS
	 * @plugin jquery/view/ejs
	 * @parent jQuery.View
	 * @download jquery/dist/jquery.view.ejs.js
	 * @test jquery/view/ejs/qunit.html
	 * Ejs provides <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a> 
	 * style client side templates.  Use them with controllers to easily build html and inject
	 * it into the DOM.
	 * <h3>Example</h3>
	 * The following generates a list of tasks:
	 * @codestart html
	 * &lt;ul>
	 * &lt;% for(var i = 0; i < tasks.length; i++){ %>
	 *     &lt;li class="task &lt;%= tasks[i].identity %>">&lt;%= tasks[i].name %>&lt;/li>
	 * &lt;% } %>
	 * &lt;/ul>
	 * @codeend
	 * For the following examples, we assume this view is in <i>'views\tasks\list.ejs'</i>
	 * <h2>Use</h2>
	 * There are 2 common ways to use Views: 
	 * <ul>
	 *     <li>Controller's [jQuery.Controller.prototype.view view function]</li>
	 *     <li>The jQuery Helpers: [jQuery.fn.after after], 
	 *                             [jQuery.fn.append append], 
	 *                             [jQuery.fn.before before], 
	 *                             [jQuery.fn.before html], 
	 *                             [jQuery.fn.before prepend], 
	 *                             [jQuery.fn.before replace], and 
	 *                             [jQuery.fn.before text].</li>
	 * </ul>
	 * <h3>View</h3>
	 * jQuery.Controller.prototype.view is the preferred way of rendering a view.  
	 * You can find all the options for render in 
	 * its [jQuery.Controller.prototype.view documentation], but here is a brief example of rendering the 
	 * <i>list.ejs</i> view from a controller:
	 * @codestart
	 * $.Controller.extend("TasksController",{
	 *     init: function( el ) {
	 *         Task.findAll({},this.callback('list'))
	 *     },
	 *     list: function( tasks ) {
	 *         this.element.html(
	 *         	this.view("list", {tasks: tasks})
	 *        )
	 *     }
	 * })
	 * @codeend
	 * 
	 * 
	 * <h2>View Helpers</h2>
	 * View Helpers return html code.  View by default only comes with 
	 * [jQuery.EJS.Helpers.prototype.view view] and [jQuery.EJS.Helpers.prototype.text text].
	 * You can include more with the view/helpers plugin.  But, you can easily make your own!
	 * Learn how in the [jQuery.EJS.Helpers Helpers] page.
	 * 
	 * @constructor Creates a new view
	 * @param {Object} options A hash with the following options
	 * <table class="options">
	 * 				<tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
	 * 				<tr>
	 * 					<td>url</td>
	 * 					<td>&nbsp;</td>
	 * 					<td>loads the template from a file.  This path should be relative to <i>[jQuery.root]</i>.
	 * 					</td>
	 * 				</tr>
	 * 				<tr>
	 * 					<td>text</td>
	 * 					<td>&nbsp;</td>
	 * 					<td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
	 * 					</td>
	 * 				</tr>
	 * 				<tr>
	 * 					<td>element</td>
	 * 					<td>&nbsp;</td>
	 * 					<td>loads a template from the innerHTML or value of the element.
	 * 					</td>
	 * 				</tr>
	 * 				<tr>
	 * 					<td>type</td>
	 * 					<td>'<'</td>
	 * 					<td>type of magic tags.  Options are '&lt;' or '['
	 * 					</td>
	 * 				</tr>
	 * 				<tr>
	 * 					<td>name</td>
	 * 					<td>the element ID or url </td>
	 * 					<td>an optional name that is used for caching.
	 * 					</td>
	 * 				</tr>
	 * 				<tr>
	 * 					<td>cache</td>
	 * 					<td>true in production mode, false in other modes</td>
	 * 					<td>true to cache template.
	 * 					</td>
	 * 				</tr>
	 * 				
	 * 			</tbody></table>
	 */
	$.EJS = EJS;
	/** 
	 * @Prototype
	 */
	EJS.prototype = {
		constructor: EJS,
		/**
		 * Renders an object with extra view helpers attached to the view.
		 * @param {Object} object data to be rendered
		 * @param {Object} extra_helpers an object with additonal view helpers
		 * @return {String} returns the result of the string
		 */
		render: function( object, extraHelpers ) {
			object = object || {};
			this._extra_helpers = extraHelpers;
			var v = new EJS.Helpers(object, extraHelpers || {});
			return this.template.process.call(object, object, v);
		},
		out: function() {
			return this.template.out;
		}
	};


	// given a value in <%= %> do something with it
	EJS.text = function( input ) {
		var myid;
		if (input == null || input === undefined) {
			return '';
		}
		if (input instanceof Date) {
			return input.toDateString();
		}
		if ( input.hookup ) {
			myid = $.View.hookup(function( el, id ) {
				input.hookup.call(input, el, id)
			});
			return "data-view-id='" + myid + "'"
		}
		if (typeof input == 'function') {
			return "data-view-id='" + $.View.hookup(input) + "'";
		}

		if ( isArray(input) ) {
			myid = $.View.hookup(function( el, id ) {
				for ( var i = 0; i < input.length; i++ ) {
					input[i].hookup ? input[i].hookup(el, id) : input[i](el, id)
				}
			});
			return "data-view-id='" + myid + "'"
		}
		if ( input.nodeName || input.jQuery ) {
			throw "elements in views are not supported"
		}

		if (input.toString) {
			return myid ? input.toString(myid) : input.toString();
		}
		return '';
	};


	/* @Static*/
	
	// used to break text into tolkens
	EJS.Scanner = function( source, left, right ) {
		
		// add these properties to the scanner
		extend(this, {
			leftDelimiter: left + '%',
			rightDelimiter: '%' + right,
			doubleLeft: left + '%%',
			doubleRight: '%%' + right,
			leftEqual: left + '%=',
			leftComment: left + '%#'
		});
		
		
		// make a regexp that can split on these token
		this.splitRegexp = (left == '[' ? 
							defaultSplitter 
							: new RegExp("("+
								[this.doubleLeft,
								 this.doubleRight,
								 this.leftEqual, 
								 this.leftComment,
								 this.leftDelimiter,
								 this.rightDelimiter + '\n',
								 this.rightDelimiter,
								 '\n'].join(")|(")+")") )
							
		this.source = source;
		this.lines = 0;
	};
	

	EJS.Scanner.prototype = {
		// calls block with each token
		scan: function( block ) {
			var regex = this.splitRegexp;
			if (!this.source == '' ) {
				var source_split = $.String.rsplit(this.source, /\n/);
				for ( var i = 0; i < source_split.length; i++ ) {
					var item = source_split[i];
					this.scanline(item, regex, block);
				}
			}
		},
		scanline: function( line, regex, block ) {
			this.lines++;
			var line_split = $.String.rsplit(line, regex),
				token;
			for ( var i = 0; i < line_split.length; i++ ) {
				token = line_split[i];
				if ( token != null ) {
					try {
						block(token, this);
					} catch (e) {
						throw {
							type: 'jQuery.EJS.Scanner',
							line: this.lines
						};
					}
				}
			}
		}
	};

	// a line and script buffer
	// we use this so we know line numbers when there
	// is an error.  
	// pre and post are setup and teardown for the buffer
	EJS.Buffer = function( pre_cmd, post_cmd ) {
		this.line = [];
		this.script = [];
		this.post_cmd = post_cmd;
		
		// add the pre commands to the first line
		this.push.apply(this, pre_cmd);
	};
	EJS.Buffer.prototype = {
		//need to maintain your own semi-colons (for performance)
		push: function( ) {
			this.line.push.apply(this.line, arguments);
		},

		cr: function() {
			this.script.push( this.line.join(''), "\n");
			this.line = [];
		},
		//returns the script too
		close: function() {
			if ( this.line.length > 0 ) {
				this.script.push(this.line.join(''))
				line = null;
			}
			this.post_cmd.length && this.push.apply(this, this.post_cmd)
			
			this.script.push(";"); //makes sure we always have an ending /
			return this.script.join("")
		}

	};
	// compiles a template
	EJS.Compiler = function( source, left ) {
		//normalize line endings
		this.source = source.replace(/\r\n/g, "\n")
							.replace(/\r/g, "\n");

		left = left || '<';
		var right = '>';
		switch ( left ) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left + ' is not a supported deliminator';
			break;
		}
		this.scanner = new EJS.Scanner(this.source, left, right);
		this.out = '';
	};
	EJS.Compiler.prototype = {
		compile: function( options, name ) {
			
			options = options || {};
			
			this.out = '';
			
			var put_cmd = "___v1ew.push(",
				insert_cmd = put_cmd,
				buff = new EJS.Buffer(['var ___v1ew = [];'], []),
				content = '',
				clean = function( content ) {
					return content.replace(/\\/g, '\\\\')
									  .replace(/\n/g, '\\n')
									  .replace(/"/g, '\\"');
				},
				put = function(content){
					buff.push(put_cmd , '"' , clean(content) , '");');
				}
				startTag = null;
			
			this.scanner.scan(function( token, scanner ) {
				// if we don't have a start pair
				if ( startTag == null ) {
					switch ( token ) {
					case '\n':
						content = content + "\n";
						put(content);
						//buff.push(put_cmd , '"' , clean(content) , '");');
						buff.cr();
						content = '';
						break;
					case scanner.leftDelimiter:
					case scanner.leftEqual:
					case scanner.leftComment:
						startTag = token;
						if ( content.length > 0 ) {
							put(content);
						}
						content = '';
						break;
					
					// replace <%% with <%
					case scanner.doubleLeft:
						content = content + scanner.leftDelimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
				else {
					switch ( token ) {
					case scanner.rightDelimiter:
						switch ( startTag ) {
						case scanner.leftDelimiter:
							if ( content[content.length - 1] == '\n' ) {
								content = chop(content);
								buff.push(content,";");
								buff.cr();
							}
							else {
								buff.push(content,";");
							}
							break;
						case scanner.leftEqual:
							buff.push(insert_cmd , "(jQuery.EJS.text(" , content , ")));");
							break;
						}
						startTag = null;
						content = '';
						break;
					case scanner.doubleRight:
						content = content + scanner.rightDelimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
			});
			if ( content.length > 0 ) {
				// Should be content.dump in Ruby
				buff.push(put_cmd , '"' , clean(content) + '");');
			}
			this.out = '/*' + name + '*/  try { with(_VIEW) { with (_CONTEXT) {' + buff.close() + " return ___v1ew.join('');}}}catch(e){e.lineNumber=null;throw e;}";
			this.process = new Function("_CONTEXT","_VIEW",this.out)
		}
	};


	//type, cache, folder
	/**
	 * @attribute options
	 * Sets default options for all views
	 * <table class="options">
	 * <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
	 * <tr>
	 * <td>type</td>
	 * <td>'<'</td>
	 * <td>type of magic tags.  Options are '&lt;' or '['
	 * </td>
	 * </tr>
	 * <tr>
	 * <td>cache</td>
	 * <td>true in production mode, false in other modes</td>
	 * <td>true to cache template.
	 * </td>
	 * </tr>
	 * </tbody></table>
	 * 
	 */
	EJS.options = {
		cache: true,
		type: '<',
		ext: '.ejs'
	}




	/**
	 * @class jQuery.EJS.Helpers
	 * By adding functions to jQuery.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * @constructor Creates a view helper.  This function is called internally.  You should never call it.
	 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	}; /* @prototype*/
	EJS.Helpers.prototype = {
		/**
		 * Makes a plugin
		 * @param {String} name the plugin name
		 */
		plugin: function( name ) {
			var args = $.makeArray(arguments),
				widget = args.shift();
			return function( el ) {
				var jq = $(el)
				jq[widget].apply(jq, args);
			}
		},
		/**
		 * Renders a partial view.  This is deprecated in favor of <code>$.View()</code>.
		 */
		view: function( url, data, helpers ) {
			helpers = helpers || this._extras
			data = data || this._data;
			return $.View(url, data, helpers) //new EJS(options).render(data, helpers);
		}
	};


	$.View.register({
		suffix: "ejs",
		//returns a function that renders the view
		
		script: function( id, src ) {
			return "jQuery.EJS(function(_CONTEXT,_VIEW) { " + 
				new EJS({ text: src}).out() + 
				" })";
		},
		renderer: function( id, text ) {
			var ejs = new EJS({
				text: text,
				name: id
			})
			return function( data, helpers ) {
				return ejs.render.call(ejs, data, helpers)
			}
		}
	})


})(true);

