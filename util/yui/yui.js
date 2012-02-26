/*
	YUI modules: http://yuilibrary.com/yui/configurator/
		node rollup
		io-base
		querystring-parse-simple
*/

(function(){

var yuilibs = ["yui-base/yui-base-min.js",
"oop/oop-min.js",
"event-custom-base/event-custom-base-min.js",
"features/features-min.js",
"dom-core/dom-core-min.js",
"dom-base/dom-base-min.js",
"selector-native/selector-native-min.js",
"selector/selector-min.js",
"node-core/node-core-min.js",
"node-base/node-base-min.js",
"event-base/event-base-min.js",
"event-delegate/event-delegate-min.js",
"node-event-delegate/node-event-delegate-min.js",
"pluginhost-base/pluginhost-base-min.js",
"pluginhost-config/pluginhost-config-min.js",
"node-pluginhost/node-pluginhost-min.js",
"dom-style/dom-style-min.js",
"dom-screen/dom-screen-min.js",
"node-screen/node-screen-min.js",
"node-style/node-style-min.js",
"querystring-stringify-simple/querystring-stringify-simple-min.js",
"io-base/io-base-min.js",
"querystring-parse-simple/querystring-parse-simple-min.js"]

var url = "http://yui.yahooapis.com/combo?3.4.1/build/"+
	yuilibs.join("&3.4.1/build/")


steal({ src : url, type: "js" },
	"../event.js").then(
		
	function(){
		
	var Y = YUI().use('*');
		
	// String
	Can.trim = function(s){
		return Y.Lang.trim(s);
	}
	
	// Array
	Can.makeArray = function(arr){
		return Y.Array(arr);
	};
	Can.isArray = Y.Lang.isArray;
	Can.inArray = function(item,arr){
		return Y.Array.indexOf(arr, item);
	};
	Can.map = function(arr, fn){
		return Y.Array.map(Can.makeArray(arr||[]), fn);
	};
	Can.each = function(elements, callback) {
		var i, key;
		if (typeof elements.length == 'number' && elements.pop)
			for(i = 0; i < elements.length; i++) {
				if(callback(i, elements[i]) === false) return elements;
			}
		else
			for(key in elements) {
				if(callback(key, elements[key]) === false) return elements;
			}
		return elements;
 	};

	// Object
	Can.extend = function(first){
		var deep = first === true ? 1 : 0,
			target = arguments[deep],
			i = deep + 1,
			arg;
		for (; arg = arguments[i]; i++) {
			Y.mix(target, arg, true, null, null, !!deep);
		}
		return target;
	}
	Can.param = function(object){
		return Y.QueryString.stringify(object)
	}
	Can.isEmptyObject = function(object){
		return Y.Object.isEmpty(object);
	}
	
	// Function
	Can.proxy = function(func, context){
		return Y.bind.apply(Y, arguments);
	}
	Can.isFunction = function(f){
		return Y.Lang.isFunction(f);
	}
	
	// element ... get the wrapped helper
	Can.$ = function(selector){
		return selector === window ? window : Y.all(selector);
	}

	Can.bind = function() {};
	Can.unbind = function() {};
	Can.trigger = function() {};
	Can.delegate = function() {};
	Can.undelegate = function() {};
	
	Can.buildFragment = function(frags, nodes){
		var owner = nodes.length && nodes[0].ownerDocument,
			frag = Y.Node.create(frags[0], owner);
		return {fragment: frag}
	}
	
	Can.append = function(wrapped, html){
		wrapped.each(function(node){
			node.append(html)
		});
	}
	
	// Events
	// Can.bind = function( ev, cb){
	// 	// if we can bind to it ...
	// 	if(this.bind && this.bind !== Can.bind){
	// 		this.bind(ev, cb)
	// 	} else if(this.addEvent) {
	// 		this.addEvent(ev, cb)
	// 	} else {
	// 		// make it bind-able ...
	// 		Can.addEvent.call(this, ev, cb)
	// 	}
	// 	return this;
	// }
	// Can.unbind = function(ev, cb){
	// 	// if we can bind to it ...
	// 	if(this.unbind && this.unbind !== Can.unbind){
	// 		this.unbind(ev, cb)
	// 	} else {
	// 		// make it bind-able ...
	// 		Can.removeEvent.call(this, ev, cb)
	// 	}
	// 	return this;
	// }
	// Can.trigger = function(item, event, args, bubble){
	// 	if(item.trigger){
	// 		if(bubble === false){
	// 			//  force stop propagation by
	// 			// listening to On and then immediately disconnecting
	// 			var connect = item.on(event, function(ev){
	// 				ev.stopPropagation();
	// 				dojo.disconnect(connect);
	// 			})
	// 			item.trigger(event,args)
	// 		} else {
	// 			item.trigger(event,args)
	// 		}
	// 		
	// 	} else {
	// 		if(typeof event === 'string'){
	// 			event = {type: event}
	// 		}
	// 		event.data = args
	// 		Can.dispatch.call(item, event)
	// 	}
	// }
	// Can.delegate = function(selector, ev , cb){
	// 	if(this.on || this.nodeType){
	// 		addBinding( new dojo.NodeList(this), selector+":"+ev, cb)
	// 	} else if(this.delegate) {
	// 		this.delegate(selector, ev , cb)
	// 	} 
	// 	return this;
	// }
	// Can.undelegate = function(selector, ev , cb){
	// 	if(this.on || this.nodeType){
	// 		removeBinding(new dojo.NodeList(this), selector+":"+ev, cb);
	// 	} else if(this.undelegate) {
	// 		this.undelegate(selector, ev , cb)
	// 	}
	// 	return this;
	// }


}).then("../deferred.js")

})();
