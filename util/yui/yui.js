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
	can.trim = function(s){
		return Y.Lang.trim(s);
	}
	
	// Array
	can.makeArray = function(arr){
		return Y.Array(arr);
	};
	can.isArray = Y.Lang.isArray;
	can.inArray = function(item,arr){
		return Y.Array.indexOf(arr, item);
	};
	can.map = function(arr, fn){
		return Y.Array.map(can.makeArray(arr||[]), fn);
	};
	can.each = function(elements, callback) {
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
	can.extend = function(first){
		var deep = first === true ? 1 : 0,
			target = arguments[deep],
			i = deep + 1,
			arg;
		for (; arg = arguments[i]; i++) {
			Y.mix(target, arg, true, null, null, !!deep);
		}
		return target;
	}
	can.param = function(object){
		return Y.QueryString.stringify(object)
	}
	can.isEmptyObject = function(object){
		return Y.Object.isEmpty(object);
	}
	
	// Function
	can.proxy = function(func, context){
		return Y.bind.apply(Y, arguments);
	}
	can.isFunction = function(f){
		return Y.Lang.isFunction(f);
	}
	
	// element ... get the wrapped helper
	can.$ = function(selector){
		return selector === window ? window : Y.all(selector);
	}

	can.bind = function() {};
	can.unbind = function() {};
	can.trigger = function() {};
	can.delegate = function() {};
	can.undelegate = function() {};
	
	can.buildFragment = function(frags, nodes){
		var owner = nodes.length && nodes[0].ownerDocument,
			frag = Y.Node.create(frags[0], owner);
		return {fragment: frag}
	}
	
	can.append = function(wrapped, html){
		wrapped.each(function(node){
			node.append(html)
		});
	}
	
	// Events
	// can.bind = function( ev, cb){
	// 	// if we can bind to it ...
	// 	if(this.bind && this.bind !== can.bind){
	// 		this.bind(ev, cb)
	// 	} else if(this.addEvent) {
	// 		this.addEvent(ev, cb)
	// 	} else {
	// 		// make it bind-able ...
	// 		can.addEvent.call(this, ev, cb)
	// 	}
	// 	return this;
	// }
	// can.unbind = function(ev, cb){
	// 	// if we can bind to it ...
	// 	if(this.unbind && this.unbind !== can.unbind){
	// 		this.unbind(ev, cb)
	// 	} else {
	// 		// make it bind-able ...
	// 		can.removeEvent.call(this, ev, cb)
	// 	}
	// 	return this;
	// }
	// can.trigger = function(item, event, args, bubble){
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
	// 		can.dispatch.call(item, event)
	// 	}
	// }
	// can.delegate = function(selector, ev , cb){
	// 	if(this.on || this.nodeType){
	// 		addBinding( new dojo.NodeList(this), selector+":"+ev, cb)
	// 	} else if(this.delegate) {
	// 		this.delegate(selector, ev , cb)
	// 	} 
	// 	return this;
	// }
	// can.undelegate = function(selector, ev , cb){
	// 	if(this.on || this.nodeType){
	// 		removeBinding(new dojo.NodeList(this), selector+":"+ev, cb);
	// 	} else if(this.undelegate) {
	// 		this.undelegate(selector, ev , cb)
	// 	}
	// 	return this;
	// }


}).then("../deferred.js")

})();
