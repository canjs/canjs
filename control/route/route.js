steal('can/util','can/route','can/control', function(can){
	
	// ## control/route.js  
	// _Controller route integration._
	
	var
		// `RegExp` used to match route variables of the type ':name'.
		// Any word character or a period is matched.
		matcher = /\:([\w\.]+)/g,
		// This function will replace parts of the route for up to 'max' times
		// so you can match different lengths of routes
		replaceParts = function (route, data, max) {
			var max = (max && max > 0 && max) || 0,
				count = 0;

			return route.replace(matcher, function( whole, name ) {
				if(!max || max && ++count>max) {
					return whole;
				}
				return encodeURIComponent( data[name] );
			}).replace("\\","");
		};

	can.Control.processors.route = function( el, event, selector, funcName, controller ) {
		selector = selector || "";
		if ( !can.route.routes[selector] ) {
			can.route( selector );
		}
		var batchNum,
			check = function( ev, attr, how ) {
				if(ev.batchNum === undefined || ev.batchNum !== batchNum ) {
					var data = can.route.attr(),
						route = data.route,
						_t, //don't call route.match twice, as this may impact performance
						max = (route && route.match && (_t = route.match(matcher)) && _t.length) || 0,
						matched = false;

					if(can.route.routes[selector].length-1 != max) {
						//no need to check this route.
						// it cannot match, because it has more parts than the current selector
						return;
					}
					
					//route and current select have the same length
					// replace every part of the route (from the left) with it's value
					// and check the result against the selector
					// if a match was found, there's no need to search any further
					for(var i = 0; i <= max; i++) {
						if(matched = (replaceParts(route, data, i) === selector)) break;
					}

					if (matched) {
						batchNum = ev.batchNum;

						delete data.route;
						if (can.isFunction(controller[funcName])) {
							controller[funcName](data);
						} else {
							controller[controller[funcName]](data);
						}
					}
				}
			};
		can.route.bind( 'change', check );
		return function() {
			can.route.unbind( 'change', check );
		};
	};

	return can;
});
