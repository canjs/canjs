// 1.18
steal("can/util").then(function( $ ) {

	// a path like string into something that's ok for an element ID
	var toId = function( src ) {
		return src.split(/\/|\./g).join("_");
	},
		isFunction = can.isFunction,
		makeArray = can.makeArray,
		// used for hookup ids
		hookupId = 1,
	// this might be useful for testing if html
	// htmlTest = /^[\s\n\r\xA0]*<(.|[\r\n])*>[\s\n\r\xA0]*$/
	/**
	 * @add can.view
	 */
	$view = can.view = function(view, data, helpers, callback){
		// get the result
		var result = $view.render(view, data, helpers, callback);
		if(can.isDeferred(result)){
			return result.pipe(function(result){
				return $view.frag(result);
			})
		}
		
		// convert it into a dom frag
		return $view.frag(result);
	};

	can.extend( $view, {
		frag: function(result){
			var frag = can.buildFragment([result],[document.body]).fragment;
			// if we have an empty frag
			if(!frag.childNodes.length) { 
				frag.appendChild(document.createTextNode(''))
			}
			return $view.hookup(frag);
		},
		hookup: function(fragment){
			var hookupEls = [],
				id, 
				func, 
				el,
				i=0;
			
			// get all childNodes
			can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(i, node){
				if(node.nodeType != 3){
					hookupEls.push(node)
					hookupEls.push.apply(hookupEls, can.makeArray( node.getElementsByTagName('*')))
				}
			});
			// filter by data-view-id attribute
			for (; el = hookupEls[i++]; ) {

				if ( el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id]) ) {
					func(el, id);
					delete $view.hookups[id];
					el.removeAttribute('data-view-id');
				}
			}
			return fragment;
		},
		/**
		 * @attribute hookups
		 * @hide
		 * A list of pending 'hookups'
		 */
		hookups: {},
		/**
		 * @function hook
		 * Registers a hookup function that can be called back after the html is 
		 * put on the page.  Typically this is handled by the template engine.  Currently
		 * only EJS supports this functionality.
		 * 
		 *     var id = can.View.hookup(function(el){
		 *            //do something with el
		 *         }),
		 *         html = "<div data-view-id='"+id+"'>"
		 *     $('.foo').html(html);
		 * 
		 * 
		 * @param {Function} cb a callback function to be called with the element
		 * @param {Number} the hookup number
		 */
		hook: function( cb ) {
			$view.hookups[++hookupId] = cb;
			return " data-view-id='"+hookupId+"'";
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
		 * 
		 * ## Example
		 * 
		 * @codestart
		 * can.View.register({
		 * 	suffix : "tmpl",
		 *  plugin : "jquery/view/tmpl",
		 * 	renderer: function( id, text ) {
		 * 		return function(data){
		 * 			return jQuery.render( text, data );
		 * 		}
		 * 	},
		 * 	script: function( id, text ) {
		 * 		var tmpl = can.tmpl(text).toString();
		 * 		return "function(data){return ("+
		 * 		  	tmpl+
		 * 			").call(jQuery, jQuery, data); }";
		 * 	}
		 * })
		 * @codeend
		 * Here's what each property does:
		 * 
		 *    * plugin - the location of the plugin
		 *    * suffix - files that use this suffix will be processed by this template engine
		 *    * renderer - returns a function that will render the template provided by text
		 *    * script - returns a string form of the processed template function.
		 * 
		 * @param {Object} info a object of method and properties 
		 * 
		 * that enable template integration:
		 * <ul>
		 *   <li>plugin - the location of the plugin.  EX: 'jquery/view/ejs'</li>
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
		registerScript: function() {},
		/**
		 * @hide
		 * Called by a production script to pre-load a renderer function
		 * into the view cache.
		 * @param {String} id
		 * @param {Function} renderer
		 */
		preload: function( ) {},
		render: function( view, data, helpers, callback ) {
			// if helpers is a function, it is actually a callback
			if ( isFunction( helpers )) {
				callback = helpers;
				helpers = undefined;
			}
	
			// see if we got passed any deferreds
			var deferreds = getDeferreds(data);
	
	
			if ( deferreds.length ) { // does data contain any deferreds?
				// the deferred that resolves into the rendered content ...
				var deferred = new can.Deferred();
	
				// add the view request to the list of deferreds
				deferreds.push(get(view, true))
	
				// wait for the view and all deferreds to finish
				can.when.apply(can, deferreds).then(function( resolved ) {
					// get all the resolved deferreds
					var objs = makeArray(arguments),
						// renderer is last [0] is the data
						renderer = objs.pop(),
						// the result of the template rendering with data
						result; 
	
					// make data look like the resolved deferreds
					if ( can.isDeferred(data) ) {
						data = usefulPart(resolved);
					}
					else {
						// go through each prop in data again,
						// replace the defferreds with what they resolved to
						for ( var prop in data ) {
							if ( can.isDeferred(data[prop]) ) {
								data[prop] = usefulPart(objs.shift());
							}
						}
					}
					// get the rendered result
					result = renderer(data, helpers);
	
					//resolve with the rendered view
					deferred.resolve(result); 
					// if there's a callback, call it back with the result
					callback && callback(result);
				});
				// return the deferred ....
				return deferred;
			}
			else {
				// no deferreds, render this bad boy
				var response, 
					// if there's a callback function
					async = isFunction( callback ),
					// get the 'view' type
					deferred = get(view, async);
	
				// if we are async, 
				if ( async ) {
					// return the deferred
					response = deferred;
					// and callback callback with the rendered result
					deferred.then(function( renderer ) {
						callback(renderer(data, helpers))
					})
				} else {
					// otherwise, the deferred is complete, so
					// set response to the result of the rendering
					deferred.then(function( renderer ) {
						response = renderer(data, helpers);
					});
				}
	
				return response;
			}
		}
	});
	// returns true if something looks like a deferred
	can.isDeferred = function( obj ) {
		return obj && isFunction(obj.then) && isFunction(obj.pipe) // check if obj is a can.Deferred
	} 
	// makes sure there's a template, if not, has steal provide a warning
	var	checkText = function( text, url ) {
			if ( ! text.length ) {
				//@steal-remove-start
				steal.dev.log("There is no template or an empty template at " + url);
				//@steal-remove-end
				throw "can.view: No template or empty template:" + url;
			}
		},
		// returns a 'view' renderer deferred
		// url - the url to the view template
		// async - if the ajax request should be synchronous
		// returns a deferred
		get = function( url, async ) {
			
			
			var suffix = url.match(/\.[\w\d]+$/),
			type, 
			// if we are reading a script element for the content of the template
			// el will be set to that script element
			el, 
			// a unique identifier for the view (used for caching)
			// this is typically derived from the element id or
			// the url for the template
			id, 
			// the AJAX request used to retrieve the template content
			jqXHR, 
			// used to generate the response 
			response = function( text ) {
				// get the renderer function
				var func = type.renderer(id, text),
					d = new can.Deferred();
				d.resolve(func)
				// cache if if we are caching
				if ( $view.cache ) {
					$view.cached[id] = d;
				}
				// return the objects for the response's dataTypes 
				// (in this case view)
				return d;
			};

			// if we have an inline template, derive the suffix from the 'text/???' part
			// this only supports '<script></script>' tags
			if ( el = document.getElementById(url) ) {
				suffix = "."+el.type.match(/\/(x\-)?(.+)/)[2];
			}
	
			// if there is no suffix, add one
			if (!suffix ) {
				url += ( suffix = $view.ext );
			}
			if(can.isArray(suffix)){
				suffix = suffix[0]
			}
	
			// convert to a unique and valid id
			id = toId(url);
	
			// if a absolute path, use steal to get it
			// you should only be using // if you are using steal
			if ( url.match(/^\/\//) ) {
				var sub = url.substr(2);
				url = window.steal ? 
					"/" + sub : 
					steal.root.mapJoin(sub);
			}
	
			//set the template engine type 
			type = $view.types[suffix];
	
			// if it is cached, 
			if ( $view.cached[id] ) {
				// return the cached deferred renderer
				return $view.cached[id];
			
			// otherwise if we are getting this from a script elment
			} else if ( el ) {
				// resolve immediately with the element's innerHTML
				return response(el.innerHTML);
			} else {
				// make an ajax request for text
				var d = new can.Deferred();
				can.ajax({
					async: async,
					url: url,
					dataType: "text",
					error: function(jqXHR) {
						checkText("", url);
						d.reject(jqXHR);
					},
					success: function( text ) {
						// make sure we got some text back
						checkText(text, url);
						d.resolve(type.renderer(id, text))
						// cache if if we are caching
						if ( $view.cache ) {
							$view.cached[id] = d;
						}
						
					}
				});
				return d;
			}
		},
		// gets an array of deferreds from an object
		// this only goes one level deep
		getDeferreds = function( data ) {
			var deferreds = [];

			// pull out deferreds
			if ( can.isDeferred(data) ) {
				return [data]
			} else {
				for ( var prop in data ) {
					if ( can.isDeferred(data[prop]) ) {
						deferreds.push(data[prop]);
					}
				}
			}
			return deferreds;
		},
		// gets the useful part of deferred
		// this is for Models and can.ajax that resolve to array (with success and such)
		// returns the useful, content part
		usefulPart = function( resolved ) {
			return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
		};
	
});
