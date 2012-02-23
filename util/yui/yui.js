// Steal doesn't support this (changes the name to combo.js):
//steal("http://yui.yahooapis.com/combo?3.4.1/build/yui-base/yui-base-min.js&3.4.1/build/oop/oop-min.js&3.4.1/build/yui/yui-min.js").then(
steal("http://yui.yahooapis.com/3.4.1/build/yui/yui-min.js").then(
	"http://yui.yahooapis.com/3.4.1/build/yui-base/yui-base-min.js",
	"http://yui.yahooapis.com/3.4.1/build/oop/oop-min.js",
	"http://yui.yahooapis.com/3.4.1/build/querystring-stringify/querystring-stringify-min.js").then(
	function(){
		
	var Y = YUI();
		
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
	    if (typeof  elements.length == 'number' && elements.pop)
	      for(i = 0; i < elements.length; i++) {
	        if(callback(i, elements[i]) === false) return elements;
	      }
	    else
	      for(key in elements) {
	        if(callback(key, elements[key]) === false) return elements;
	      }
	    return elements;
  	}
	// Object
	Can.extend = function(first){
		if(first === true){
			var args = Can.makeArray(arguments);
			args.shift();
			// Need to update and use Y.clone for deep copy
			return Y.merge.apply(Y, args)
		}
		return Y.merge.apply(Y, arguments)
	}
	Can.param = function(object){
		return Y.QueryString.stringify(object)
	}
	Can.isEmptyObject = function(object){
		var prop;
		for(prop in object){
			break;
		}
		return prop === undefined;
	}
	// Function
	Can.proxy = function(func, context){
		return Y.bind.apply(Y, arguments);
	}
	Can.isFunction = function(f){
		return Y.isFunction(f);
	}
		



})