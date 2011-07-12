steal('jquery/lang/observe',
	'jquery/event/hashchange',
	'jquery/lang/deparam', function($){
	
	var routes = [],
		globalDefaults;
	
	$.route = {
		param: function(data){
			return $.param(data);
		},
		deparam: function(url){
			return $.String.deparam( url );
		},
		state: new $.Observe({}),
		/**
		 * $.route.route("", {type: "videos"});
		 * $.route.route("{type}");
		 * 
		 * @param {Object} name
		 * @param {Object} defaults
		 */
		route : function(name, defaults){
			
		}
	}
	
	var throttle = function(func, time){
		var timer;
		return function(){
			clearTimeout(timer);
			timer = setTimeout(func, time || 1);
		}
	},
	curParams,
	setState = function(){
		
		var hash = window.location.hash.substr(2); // everything after #!
			//deparam it
			var props = $.route.deparam(hash);
			curParams = props;
			$.route.state.merge(props, true);
		
	};
	
	// update the state object
	$(window).bind('hashchange', throttle(setState));
	setState();
	
	// update the page
	$.route.state.bind("change", throttle( function(){
		// param and change the hash if necessary
		
		// throttle
		window.location.hash ="#!"+$.route.param($.route.state.serialize())
	}));
	
	// filter -> parts of the hash that should not be put in the hash
	// this is for state that is needed, but not in the url ... like count
	// it's like we need an object that mimicks another object (the client state), but 
	// is not the same thing
	
	// facade
	//var facade = $.Observe($.route.state);
	// you can add properties to facade and use that to communicate non-route state changes
	
	// but is this necessary?  Is this part of state? 
	
	// grid has the object that you can connect to for state changes
	
	// can I add this to the route somewhere?
	
	// $.route.state.attr("grid", grid.data() );
	
	// defaults?
	
	/**
	 * Returns the url for the set of options provided.
	 * 
	 * 
	 * 
	 * 
	 * @param {Object} options
	 */
	$.route.urlFor = function(options, merge){
		//merges
		if(!merge){
			return "#!"+$.route.param(options)
		} else {
			return "#!"+$.route.param($.extend({}, curParams, options)) 
		}
	}
	$.route.linkTo = function(name, options, props){
		return "<a "+makeProps(
			$.extend(
				{ href: $.route.urlFor(options) }, 
				props) )+">"+name+"</a>";
	}
	var makeProps = function(props){
			var html = [],
				name, val;
			for(name in props){
				val = props[name]
				if(name === 'className'){
					name='class'
				}
				val && html.push(name,"=\"",
					escapeHTML(val),
					"\" ");
			}
			return html.join("")
		},
		escapeHTML = function(content){
			return content
					.replace(/"/g, '&#34;')
					.replace(/'/g, "&#39;");
		}
	$.route.current = function(options){
		return window.location.hash == "#!"+$.route.param(options)
	}
})
