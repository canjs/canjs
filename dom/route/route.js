steal('jquery/lang/observe', 'jquery/event/hashchange', 'jquery/lang/deparam', 'jquery/lang/observe/delegate', function( $ ) {

	var globalDefaults, matcher = /\:([\w\.]+)/g,
		makeProps = function( props ) {
			var html = [],
				name, val;
			for ( name in props ) {
				val = props[name]
				if ( name === 'className' ) {
					name = 'class'
				}
				val && html.push(name, "=\"", escapeHTML(val), "\" ");
			}
			return html.join("")
		},
		escapeHTML = function( content ) {
			return content.replace(/"/g, '&#34;').replace(/'/g, "&#39;");
		};

	/**
	 * @parent dom
	 * @class jQuery.route
	 * @tag 3.2
	 * 
	 * jQuery.route helps manage browser history by
	 * synchronizing the window.location.hash with
	 * [jQuery.route.data].
	 * 
	 * Create changes in the route data like:
	 * 
	 *     $.route.data.attr('type','video');
	 * 
	 * Listen to changes in the route data like
	 * 
	 * $.route.data.delegate('type','add',function(ev, newVal, oldVal){
	 * 
	 * })
	 * 
	 * ## Creating a Route
	 * 
	 * $.route("", {type: "videos"});
	 * $.route(":type",{type: "videos"});
	 * 
	 * @param {String} url
	 * @param {Object} [defaults]
	 */
	var $route = $.route = function( url, defaults ) {
		// add route in a form that can be easily figured out
		// 
		var names = [],
			test = url.replace(matcher, function( whole, name ) {
				names.push(name)
				return "([\\w\\.]*)"
			});

		// need a regexp to match
		$route.routes[url] = {
			test: new RegExp("^" + test),
			route: url,
			names: names,
			defaults: defaults || {},
			length: url.split('/').length
		}
	};

	$.extend($route, {
		/**
		 * Parameterizes the raw JS object representation of 
		 * $.route.data.
		 * 
		 * 
		 * @param {Object} data
		 */
		param: function( data ) {
			// see what data is provided ...
			// check if it matches the names in any routes ...
			for ( var name in $route.routes ) {
				var route = $route.routes[name],
					ok = true;

				// check if data has props
				for ( var i = 0; i < route.names.length; i++ ) {
					if (!data.hasOwnProperty(route.names[i]) ) {
						ok = false;
						break;
					}
				}
				if ( ok ) {
					// create url ...
					var cpy = $.extend({}, data);

					var res = route.route.replace(matcher, function( whole, name ) {
						delete cpy[name];
						return data[name] === route.defaults[name] ? "" : data[name];
					});
					var after = $.param(cpy);
					return res + (after ? "&" + after : "")
				}
			}
			return $.param(data);
		},
		/**
		 * 
		 * @param {Object} url
		 */
		deparam: function( url ) {
			// see if there are any matches ... 
			var route = {
				length: -1
			};
			for ( var name in $route.routes ) {
				var temp = $route.routes[name]
				if ( temp.test.test(url) && temp.length > route.length ) {
					route = temp;
				}
			}
			if ( route.length > -1 ) {
				var parts = url.match(route.test),
					start = parts.shift(),
					remainder = url.substr(start.length + 1),
					obj = $.extend(true, remainder ? $.String.deparam(remainder) : {}, route.defaults);

				for ( var p = 0; p < parts.length; p++ ) {
					if ( parts[p] ) {
						obj[route.names[p]] = parts[p]
					}
				}
				return obj;
			}
			return $.String.deparam(url);
		},
		/**
		 * A $.Observe that represents the state of the 
		 * history.
		 */
		data: new $.Observe({}),
		routes: {},
		/**
		 * Indicates that all routes have been added
		 * and sets $.route.data based upon the routes.
		 */
		ready: function() {
			setState();
		},
		/**
		 * Returns a url from the options
		 * @param {Object} options
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String} 
		 */
		url: function( options, merge ) {
			//merges
			if (!merge ) {
				return "#!" + $route.param(options)
			} else {
				return "#!" + $route.param($.extend({}, curParams, options))
			}
		},
		/**
		 * Returns a link
		 * @param {Object} name
		 * @param {Object} options
		 * @param {Object} props
		 */
		link: function( name, options, props ) {
			return "<a " + makeProps(
			$.extend({
				href: $route.url(options)
			}, props)) + ">" + name + "</a>";
		},
		/**
		 * Returns if the options represent the current page.
		 * @param {Object} options
		 */
		current: function( options ) {
			return window.location.hash == "#!" + $route.param(options)
		}
	});

	var throttle = function( func, time ) {
		var timer;
		return function() {
			clearTimeout(timer);
			timer = setTimeout(func, time || 1);
		}
	},
		curParams, setState = function() {

			var hash = window.location.hash.substr(2); // everything after #!
			//deparam it
			var props = $route.deparam(hash);
			curParams = props;
			$route.data.attrs(props, true);

		};

	// update the state object
	$(window).bind('hashchange', setState);


	// update the page
	$route.data.bind("change", throttle(function() {
		// param and change the hash if necessary
		// throttle
		window.location.hash = "#!" + $route.param($route.data.serialize())
	}));
})