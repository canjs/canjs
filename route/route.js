// 1.14
steal('can/observe', 'can/util/string/deparam',
function( $ ) {

    // Helper methods used for matching routes.
	var 
		// RegEx used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
        // Regular expression for identifying &amp;key=value lists.
        paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
        // Converts a JS Object into a list of parameters that can be 
        // inserted into an html element tag.
		makeProps = function( props ) {
			var html = [],
				name, val;
			each(props, function(name, val){
				if ( name === 'className' ) {
					name = 'class'
				}
				val && html.push(escapeHTML(name), "=\"", escapeHTML(val), "\" ");
			})
			return html.join("")
		},
        // Escapes ' and " for safe insertion into html tag parameters.
		escapeHTML = function( content ) {
			return content.replace(/"/g, '&#34;').replace(/'/g, "&#39;");
		},
		// Checks if a route matches the data provided. If any route variable
        // is not present in the data the route does not match. If all route
        // variables are present in the data the number of matches is returned 
        // to allow discerning between general and more specific routes. 
		matchesData = function(route, data) {
			var count = 0;
			for ( var i = 0; i < route.names.length; i++ ) {
				if (!data.hasOwnProperty(route.names[i]) ) {
					return -1;
				}
				count++;
			}
			return count;
		},
        // 
		onready = true,
		location = window.location,
		encode = encodeURIComponent,
		decode = decodeURIComponent,
		each = Can.each,
		extend = Can.extend;

	/**
	 * @class jQuery.route
	 * @inherits Can.Control
	 * @plugin jquery/dom/route
	 * @parent dom
	 * @tag 3.2
	 * 
	 * jQuery.route helps manage browser history (and
	 * client state) by
	 * synchronizing the window.location.hash with
	 * an [Can.Control].
	 * 
	 * ## Background Information
	 * 
	 * To support the browser's back button and bookmarking
	 * in an Ajax application, most applications use
	 * the <code>window.location.hash</code>.  By
	 * changing the hash (via a link or JavaScript), 
	 * one is able to add to the browser's history 
	 * without changing the page.  The [jQuery.event.special.hashchange event] allows
	 * you to listen to when the hash is changed.
	 * 
	 * Combined, this provides the basics needed to
	 * create history enabled Ajax websites.  However,
	 * jQuery.Route addresses several other needs such as:
	 * 
	 *   - Pretty Routes
	 *   - Keeping routes independent of application code
	 *   - Listening to specific parts of the history changing
	 *   - Setup / Teardown of widgets.
	 * 
	 * ## How it works
	 * 
	 * <code>Can.route</code> is a [Can.Control Can.Observe] that represents the
	 * <code>window.location.hash</code> as an 
	 * object.  For example, if the hash looks like:
	 * 
	 *     #!type=videos&id=5
	 *     
	 * the data in <code>Can.route</code> would look like:
	 * 
	 *     { type: 'videos', id: 5 }
	 * 
	 * 
	 * Can.route keeps the state of the hash in-sync with the data in
	 * Can.route.
	 * 
	 * ## Can.Observe
	 * 
	 * Can.route is a [Can.Control Can.Observe]. Understanding
	 * Can.Observe is essential for using Can.route correctly.
	 * 
	 * You can
	 * listen to changes in an Observe with bind and
	 * delegate and change Can.route's properties with 
	 * attr and attrs.
	 * 
	 * ### Listening to changes in an Observable
	 * 
	 * Listen to changes in history 
	 * by [Can.Control.prototype.bind bind]ing to
	 * changes in <code>Can.route</code> like:
	 * 
	 *     Can.route.bind('change', function(ev, attr, how, newVal, oldVal) {
	 *     
	 *     })
	 * 
     *  - attr - the name of the changed attribute
     *  - how - the type of Observe change event (add, set or remove)
     *  - newVal/oldVal - the new and old values of the attribute
     * 
	 * You can also listen to specific changes 
	 * with [Can.Control.prototype.delegate delegate]:
	 * 
	 *     Can.route.delegate('id','change', function(){ ... })
	 * 
	 * Observe lets you listen to the following events:
	 * 
	 *  - change - any change to the object
	 *  - add - a property is added
	 *  - set - a property value is added or changed
	 *  - remove - a property is removed
	 * 
	 * Listening for <code>add</code> is useful for widget setup
	 * behavior, <code>remove</code> is useful for teardown.
	 * 
	 * ### Updating an observable
	 * 
	 * Create changes in the route data like:
	 * 
	 *     Can.route.attr('type','images');
	 * 
	 * Or change multiple properties at once with
	 * [Can.Control.prototype.attrs attrs]:
	 * 
	 *     Can.route.attr({type: 'pages', id: 5}, true)
	 * 
	 * When you make changes to Can.route, they will automatically
	 * change the <code>hash</code>.
	 * 
	 * ## Creating a Route
	 * 
	 * Use <code>Can.route(url, defaults)</code> to create a 
	 * route. A route is a mapping from a url to 
	 * an object (that is the Can.route's state).
	 * 
	 * If no routes are added, or no route is matched, 
	 * Can.route's data is updated with the [jQuery.String.deparam deparamed]
	 * hash.
	 * 
	 *     location.hash = "#!type=videos";
	 *     // Can.route -> {type : "videos"}
	 *     
	 * Once routes are added and the hash changes,
	 * Can.route looks for matching routes and uses them
	 * to update Can.route's data.
	 * 
	 *     Can.route( "content/:type" );
	 *     location.hash = "#!content/images";
	 *     // Can.route -> {type : "images"}
	 *     
	 * Default values can also be added:
	 * 
	 *     Can.route("content/:type",{type: "videos" });
	 *     location.hash = "#!content/"
	 *     // Can.route -> {type : "videos"}
	 *     
	 * ## Delay setting Can.route
	 * 
	 * By default, <code>Can.route</code> sets its initial data
	 * on document ready.  Sometimes, you want to wait to set 
	 * this data.  To wait, call:
	 * 
	 *     Can.route.ready(false);
	 * 
	 * and when ready, call:
	 * 
	 *     Can.route.ready(true);
	 * 
	 * ## Changing the route.
	 * 
	 * Typically, you never want to set <code>location.hash</code>
	 * directly.  Instead, you can change properties on <code>Can.route</code>
	 * like:
	 * 
	 *     Can.route.attr('type', 'videos')
	 *     
	 * This will automatically look up the appropriate 
	 * route and update the hash.
	 * 
	 * Often, you want to create links.  <code>Can.route</code> provides
	 * the [jQuery.route.link] and [jQuery.route.url] helpers to make this 
	 * easy:
	 * 
	 *     Can.route.link("Videos", {type: 'videos'})
	 * 
	 * @param {String} url the fragment identifier to match.  
	 * @param {Object} [defaults] an object of default values
	 * @return {jQuery.route}
	 */
	Can.route = function( url, defaults ) {
        // Extract the variable names and replace with regEx that will match an atual URL with values.
		var names = [],
			test = url.replace(matcher, function( whole, name ) {
				names.push(name)
				// TODO: I think this should have a +
				return "([^\\/\\&]*)"  // The '\\' is for string-escaping giving single '\' for regEx escaping
			});

		// Add route in a form that can be easily figured out
		Can.route.routes[url] = {
            // A regular expression that will match the route when variable values 
            // are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
            // will match for any value of :page and :type (word chars or period).
			test: new RegExp("^" + test+"($|&)"),
            // The original URL, same as the index for this entry in routes.
			route: url,
            // An array of all the variable names in this route
			names: names,
            // Default values provided for the variables.
			defaults: defaults || {},
            // The number of parts in the URL separated by '/'.
			length: url.split('/').length
		}
		return Can.route;
	};

	extend(Can.route, {
		/**
		 * Parameterizes the raw JS object representation provided in data.
		 * If a route matching the provided data is found that URL is built
         * from the data. Any remaining data is added at the end of the
         * URL as &amp; separated key/value parameters.
		 * 
		 * @param {Object} data
         * @return {String} The route URL and &amp; separated parameters.
		 */
		param: function( data ) {
			// Check if the provided data keys match the names in any routes;
			// get the one with the most matches.
			delete data.route;
			var route,
				// need it to be at least 1 match
				matches = 0,
				matchCount,
				routeName = data.route;
			
			delete data.route;
			// if we have a route name in our Can.route data, use it
			if(routeName && (route = Can.route.routes[routeName])){
				
			} else {
				// otherwise find route
				each(Can.route.routes, function(name, temp){
					matchCount = matchesData(temp, data);
					if ( matchCount > matches ) {
						route = temp;
						matches = matchCount
					}
				});
			}
			// if this is match

			
			if ( route ) {
				var cpy = extend({}, data),
                    // Create the url by replacing the var names with the provided data.
                    // If the default value is found an empty string is inserted.
				    res = route.route.replace(matcher, function( whole, name ) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? "" : encode( data[name] );
                    }),
                    after;
					// remove matching default values
					each(route.defaults, function(name,val){
						if(cpy[name] === val) {
							delete cpy[name]
						}
					})
					
					// The remaining elements of data are added as 
					// $amp; separated parameters to the url.
				    after = Can.param(cpy);
				return res + (after ? "&" + after : "")
			}
            // If no route was found there is no hash URL, only paramters.
			return Can.isEmptyObject(data) ? "" : "&" + Can.param(data);
		},
		/**
		 * Populate the JS data object from a given URL.
		 * 
		 * @param {Object} url
		 */
		deparam: function( url ) {
			// See if the url matches any routes by testing it against the route.test regEx.
            // By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each(Can.route.routes, function(name, temp){
				if ( temp.test.test(url) && temp.length > route.length ) {
					route = temp;
				}
			});
            // If a route was matched
			if ( route.length > -1 ) { 
				var // Since RegEx backreferences are used in route.test (round brackets)
                    // the parts will contain the full matched string and each variable (backreferenced) value.
                    parts = url.match(route.test),
                    // start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
                    // The remainder will be the &amp;key=value list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length-1] === "&" ? 1 : 0) ),
                    // If there is a remainder and it contains a &amp;key=value list deparam it.
                    obj = (remainder && paramsMatcher.test(remainder)) ? Can.String.deparam( remainder.slice(1) ) : {};

                // Add the default values for this route
				obj = extend(true, {}, route.defaults, obj);
                // Overwrite each of the default values in obj with those in parts if that part is not empty.
				each(parts,function(i, part){
					if ( part && part !== '&') {
						obj[route.names[i]] = decode( part );
					}
				});
				obj.route = route.route;
				return obj;
			}
            // If no route was matched it is parsed as a &amp;key=value list.
			if ( url.charAt(0) !== '&' ) {
				url = '&' + url;
			}
			return paramsMatcher.test(url) ? Can.String.deparam( url.slice(1) ) : {};
		},
		/**
		 * @hide
		 * A Can.Observe that represents the state of the history.
		 */
		data: new Can.Observe({}),
        /**
         * @attribute
         * @type Object
		 * @hide
		 * 
         * A list of routes recognized by the router indixed by the url used to add it.
         * Each route is an object with these members:
         * 
 		 *  - test - A regular expression that will match the route when variable values 
         *    are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
         *    will match for any value of :page and :type (word chars or period).
		 * 
         *  - route - The original URL, same as the index for this entry in routes.
         * 
		 *  - names - An array of all the variable names in this route
         * 
		 *  - defaults - Default values provided for the variables or an empty object.
         * 
		 *  - length - The number of parts in the URL separated by '/'.
         */
		routes: {},
		/**
		 * Indicates that all routes have been added and sets Can.route.data
		 * based upon the routes and the current hash.
		 * 
		 * By default, ready is fired on jQuery's ready event.  Sometimes
		 * you might want it to happen sooner or earlier.  To do this call
		 * 
		 *     Can.route.ready(false); //prevents firing by the ready event
		 *     Can.route.ready(true); // fire the first route change
		 * 
		 * @param {Boolean} [start]
		 * @return Can.route
		 */
		ready: function(val) {
			if( val === false ) {
				onready = false;
			}
			if( val === true || onready === true ) {
				setState();
			}
			return Can.route;
		},
		/**
		 * Returns a url from the options
		 * @param {Object} options
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String} 
		 */
		url: function( options, merge ) {
			if (merge) {
				return "#!" + Can.route.param(extend({}, curParams, options))
			} else {
				return "#!" + Can.route.param(options)
			}
		},
		/**
		 * Returns a link
		 * @param {Object} name The text of the link.
		 * @param {Object} options The route options (variables)
		 * @param {Object} props Properties of the &lt;a&gt; other than href.
         * @param {Boolean} merge true if the options should be merged with the current options
		 */
		link: function( name, options, props, merge ) {
			return "<a " + makeProps(
			extend({
				href: Can.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},
		/**
		 * Returns true if the options represent the current page.
		 * @param {Object} options
         * @return {Boolean}
		 */
		current: function( options ) {
			return location.hash == "#!" + Can.route.param(options)
		}
	});
	
	
    // The functions in the following list applied to Can.route (e.g. Can.route.attr('...')) will
    // instead act on the Can.route.data Observe.
	each(['bind','unbind','delegate','undelegate','attr','serialize','removeAttr'], function(i, name){
		Can.route[name] = function(){
			return Can.route.data[name].apply(Can.route.data, arguments)
		}
	})

	var // A throttled function called multiple times will only fire once the
        // timer runs down. Each call resets the timer.
        throttle = function( func ) {
            var timer;
            return function() {
				var args = arguments,
					self = this;
                clearTimeout(timer);
                timer = setTimeout(function(){
					func.apply(self, args)
				}, 1);
            }
        },
        // Intermediate storage for Can.route.data.
        curParams,
        // Deparameterizes the portion of the hash of interest and assign the
        // values to the Can.route.data removing existing values no longer in the hash.
        setState = function() {
			var hash = location.hash.substr(1, 1) === '!' ? 
				location.hash.slice(2) : 
				location.hash.slice(1); // everything after #!
			curParams = Can.route.deparam( hash );
			Can.route.attr(curParams, true);
		};

	// If the hash changes, update the Can.route.data
	Can.bind.call(window,'hashchange', setState);

	// If the Can.route.data changes, update the hash.
    // Using .serialize() retrieves the raw data contained in the observable.
    // This function is throttled so it only updates once even if multiple values changed.
	Can.route.bind("change", throttle(function() {
		location.hash = "#!" + Can.route.param(Can.route.serialize())
	}));
	// onready
	$(function() {
		Can.route.ready();
	});
})