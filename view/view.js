if ( window.jQuery && jQuery.Controller ) {
	steal.plugins("jquery/controller/view");
}
steal.plugins("jquery").then(function( $ ) {

	// converts to an ok dom id
	var toId = function( src ) {
		return src.replace(/^\/\//, "").replace(/[\/\.]/g, "_");
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
	 *   [jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
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
	 * Steal can package processed views in the production 
	 * file. Because 'stolen' views are already
	 * processed, they don't rely on eval and are much faster. Here's 
	 * how to steal them:
	 * 
	 * @codestart
	 * steal.views('//views/tasks/show.ejs');
	 * @codeend
	 * 
	 * Read more about [steal.static.views steal.views].
	 * 
	 * 
	 * <h2>$.View</h2>
	 * 
	 * Looks up a template, processes it, caches it, then renders the template
	 * with data and optional helpers.
	 * 
	 * With [stealjs StealJS], views are typically bundled in the production build.
	 * This makes it ok to use views synchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"})
	 * @codeend
	 * 
	 * If you aren't using StealJS, it's best to use views asynchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"}, function(result){
	 *   // do something with result
	 * })
	 * @codeend
	 * 
	 * @param {String} view The url or id of an element to use as the template's source.
	 * @param {Object} data The data to be passed to the view.
	 * @param {Object} [helpers] Optional helper functions the view might use. Not all
	 * templates support helpers.
	 * @param {Object} [callback] Optional callback function.  If present, the template is 
	 * retrieved asynchronously.  This is a good idea if you aren't compressing the templates
	 * into your view.
	 * @return {String} The rendered result of the view.
	 */

	var $view, render, checkText, get;

	$view = $.View = function( view, data, helpers, callback ) {
		var suffix = view.match(/\.[\w\d]+$/),
			type, el, id, renderer, url = view;
		if ( typeof helpers === 'function' ) {
			callback = helpers;
			helpers = undefined;
		}
		//if there is no suffix, add one
		if (!suffix ) {
			suffix = $.View.ext;
			url = url + $.View.ext;
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
		renderer =
		$.View.cached[id] ? // is it cached?
		$.View.cached[id] : // use the cached version
		((el = document.getElementById(view)) ? //is it in the document?
		type.renderer(id, el.innerHTML) : //use the innerHTML of the elemnt
		get(type, id, url, data, helpers, callback) //do an ajax request for it
		);
		// we won't always get a renderer (if async ajax)
		return renderer && render(renderer, type, id, data, helpers, callback);
	};
	// caches the template, renders the content, and calls back if it should
	render = function( renderer, type, id, data, helpers, callback ) {
		var res, stub;
		if ( $.View.cache ) {
			$.View.cached[id] = renderer;
		}
		res = renderer.call(type, data, helpers);
		stub = callback && callback(res);
		return res;
	};
	// makes sure there's a template
	checkText = function( text, url ) {
		if (!text.match(/[^\s]/) ) {
			throw "$.View ERROR: There is no template or an empty template at " + url;
		}
	};
	// gets a template, if there's a callback, renders and calls back its;ef
	get = function( type, id, url, data, helpers, callback ) {
		if ( callback ) {
			$.ajax({
				url: url,
				dataType: "text",
				error: function() {
					checkText("", url);
				},
				success: function( text ) {
					checkText(text, url);
					render(type.renderer(id, text), type, id, data, helpers, callback);
				}
			});
		} else {
			var text = $.ajax({
				async: false,
				url: url,
				dataType: "text",
				error: function() {
					checkText("", url);
				}
			}).responseText;
			checkText(text, url);
			return type.renderer(id, text);
		}

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
		 *   <li>suffix - the view extension.  EX: 'ejs'</li>
		 *   <li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
		 *    used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
		 *   <li>renderer(id, text) - a function that takes the id of the template and the text of the template and
		 *    returns a render function.</li>
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
				return renderer.call(data, data, helpers);
			};
		}

	});


	//---- ADD jQUERY HELPERS -----
	//converts jquery functions to use views	
	var convert, modify, isTemplate, getCallback, hookupView, funcs;

	convert = function( func_name ) {
		var old = jQuery.fn[func_name];

		jQuery.fn[func_name] = function() {
			var args = $.makeArray(arguments),
				callbackNum, callback, self = this;

			//check if a template
			if ( isTemplate(args) ) {

				// if we should operate async
				if ((callbackNum = getCallback(args))) {
					callback = args[callbackNum];
					args[callbackNum] = function( result ) {
						modify.call(self, [result], old);
						callback.call(self, result);
					};
					$.View.apply($.View, args);
					return this;
				}

				//otherwise do the template now
				args = [$.View.apply($.View, args)];
			}

			return modify.call(this, args, old);
		};
	};
	// modifies the html of the element
	modify = function( args, old ) {
		var res, stub;

		//check if there are new hookups
		for ( var hasHookups in jQuery.View.hookups ) {
			// Having arbitrary code in here makes JSLint pass
			if ( true ) {
				stub = true;
			}
		}

		//if there are hookups, get jQuery object
		if ( hasHookups ) {
			args[0] = $(args[0]);
		}
		res = old.apply(this, args);

		//now hookup hookups
		if ( hasHookups ) {
			hookupView(args[0]);
		}
		return res;
	};

	// returns true or false if the args indicate a template is being used
	isTemplate = function( args ) {
		var secArgType = typeof args[1];

		return typeof args[0] == "string" && (secArgType == 'object' || secArgType == 'function') && !args[1].nodeType && !args[1].jquery;
	};

	//returns the callback if there is one (for async view use)
	getCallback = function( args ) {
		return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
	};

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
				hookupEls[i].removeAttribute('data-view-id');
			}
		}
		//copy remaining hooks back
		$.extend(jQuery.View.hookups, hooks);
	};

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

});