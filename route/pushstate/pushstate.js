steal('can/util', 'can/route', function(can) {
    "use strict";

    if(window.history && history.pushState) {
		can.route.bindings.pushstate = {
			/**
        	 * @property can.route.pushstate.root
        	 * @parent can.route.pushstate
        	 * 
        	 */
        	root: "/",
        	paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,
	        querySeparator: '?',
	        bind: function() {
                // intercept routable links
                can.delegate.call(can.$(document.documentElement),'click', 'a', anchorClickFix);
                
                // popstate only fires on back/forward.
		        // To detect when someone calls push/replaceState, we need to wrap each method.
		        can.each(['pushState','replaceState'],function(method) {
		            originalMethods[method] = window.history[method];
		            window.history[method] = function(state) {
		                var result = originalMethods[method].apply(window.history, arguments);
		                can.route.setState();
		                return result;
		            };
		        });
		        
		        // Bind to popstate for back/forward
		        can.bind.call(window, 'popstate', can.route.setState);
            },
	        unbind: function(){
        		can.undelegate.call(can.$(document.documentElement),'click', 'a', anchorClickFix);
        	
            	can.each(['pushState','replaceState'],function(method) {
		            window.history[method] = originalMethods[method];
		        });
            	can.unbind.call(window, 'popstate', can.route.setState);
            },
	        matchingPartOfURL: function(){
            	var root = cleanRoot(),
            		loc = (location.pathname + location.search),
            		index = loc.indexOf(root);
            	
            	return loc.substr(index+root.length);
            },
            setURL: function(path) {
            	window.history.pushState(null, null, can.route._call("root")+path);
                return path;
            }
		}
		
		
        var anchorClickFix = function(e) {
        	if(!e.isDefaultPrevented()) {
                // Fix for ie showing blank host, but blank host means current host.
                var linksHost = this.host || window.location.host;
                // if link is within the same domain
                if(window.location.host == linksHost){
                	// check if a route matches
                    var curParams = can.route.deparam(this.pathname+this.search);
                    // if a route matches
                    if(curParams.route) {
                    	// update the data
                    	can.route.attr(curParams, true);
                    	e.preventDefault();
                	}
                }
        	}
		},
			cleanRoot = function(){
        		var domain = location.protocol+"//"+location.host,
        			root = can.route._call("root"),
        			index = root.indexOf( domain );
        		if( index == 0 ) {
        			return can.route.root.substr(domain.length)
        		}
        		return root
	        },
	        // a collection of methods on history that we are overwriting
	        originalMethods = {};
	        
        can.route.defaultBinding = "pushstate";
        
    }

	return can;
});
