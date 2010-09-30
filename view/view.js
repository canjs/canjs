if ( window.jQuery && jQuery.Controller ) {
	steal.plugins("jquery/controller/view")
}
steal.plugins("jquery").then(function( $ ) {

	// converts to an ok dom id
	var toId = function( src ) {
		return src.replace(/^\/\//, "").replace(/[\/\.]/g, "_")
	},
		// used for hookup ids
		id = 1;

	/**
	 * @constructor jQuery.View
	 * @tag core
	 * View provides a uniform interface for using templates in JavaScriptMVC.  When templates 
	 * [jQuery.View.static.register register] themselves, you are able to:
	 * <ul>
	 * 	
	 *  <li>Use views with jQuery extensions [jQuery.fn.after after], [jQuery.fn.append append],
	 *  	[jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
	 *      [jQuery.fn.replace replace], [jQuery.fn.text text] like:
	 * @codestart
	 * $('.foo').html("//path/to/view.ejs",{})
	 * @codeend
	 *  </li>
	 *  <li>Compress your views with [steal.static.views].</li>
	 *  <li>Use the [jQuery.Controller.prototype.view controller/view] plugin to auto-magically
	 *  lookup views.</li>
	 *  <li>Hookup Controllers and other code on elements after render.</li>
	 *  
	 * </ul>
	 * 
	 * <h2>Supported Templates</h2>
	 * <ul>
	 * 	<li>[jQuery.View.EJS EJS] - provides an ERB like syntax: <code>&lt;%= %&gt;</code></li>
	 *  <li>[Jaml] - A functional approach to JS templates.</li>
	 *  <li>[Micro] - A very lightweight template similar to EJS.</li>
	 * </ul>
	 * @iframe jquery/view/view.html 700
	 *
	 * 
	 * <h2>Compress Views with Steal</h2>
	 * Steal can package processed views in the production file. Because 'stolen' views are already
	 * processed, they don't rely on eval.  Here's how to steal them:
	 * @codestart
	 * steal.views('//views/tasks/show.ejs');
	 * @codeend
	 * Read more about [steal.static.views steal.views].
	 * <h2>Hooking up controllers</h2>
	 * After drawing some html, you often want to add other widgets and plugins inside that html.
	 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
	 * @codestart
	 * &lt;ul &lt;%= Phui.Tabs%>>...&lt;ul>
	 * @codeend
	 * You can even hook up multiple controllers:
	 * @codestart
	 * &lt;ul &lt;%= [Phui.Tabs, Phui.Filler]%>>...&lt;ul>
	 * @codeend
	 * @init Looks up a template, processes it, caches it, then renders the template
	 * with data and optional helpers.
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"})
	 * @codeend
	 * @param {String} view The url or id of an element to use as the template's source.
	 * @param {Object} data The data to be passed to the view.
	 * @param {Object} [helpers] Optional helper functions the view might use.
	 * @return {String} The rendered result of the view.
	 */
	$.View = function( view, data, helpers ) {
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
		type.get(id, url) //do an ajax request for it
		);

		//if we should cache templates
		if ( $.View.cache ) {
			$.View.cached[id] = renderer;
		}
		return renderer.call(type, data, helpers)
	};

	/* @Static */
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
			jQuery.View.hookups[myid] = cb;
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
		 * Registers a template engine to be used with view helpers and compression.  
		 * @param {Object} info a object of method and properties that enable template integration:
		 * <ul>
		 * 		<li>suffix - the view extension.  EX: 'ejs'</li>
		 * 		<li>get(id, url) - a function that returns the 'render' function of processed template.  <b>get</b>
		 * 			function is called with an id for the template and the url where the view can be loaded.
		 * 			The returned function's signiture should look like:
		 * 			<pre>renderer(data, helpers)</pre>
		 * 		</li>
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
		 *  @tag view
		 *  abc
		 */
		"prepend",
		/**
		 *  @function append
		 *  @tag view
		 *  abc
		 */
		"append",
		/**
		 *  @function after
		 *  @tag view
		 *  abc
		 */
		"after",
		/**
		 *  @function before
		 *  @tag view
		 *  abc
		 */
		"before",
		/**
		 *  @function replace
		 *  @tag view
		 *  abc
		 */
		"replace",
		/**
		 *  @function text
		 *  @tag view
		 *  abc
		 */
		"text",
		/**
		 *  @function html
		 *  @tag view
		 *  abc
		 */
		"html",
		/**
		 *  @function replaceWith
		 *  @tag view
		 *  abc
		 */
		"replaceWith"];

	//go through helper funcs and convert
	for ( var i = 0; i < funcs.length; i++ ) {
		convert(funcs[i]);
	}

})