steal("can/util", function(can){
	
	var processNodes = function(nodes, paths, location){
		var frag = document.createDocumentFragment();
		
		for(var i = 0, len = nodes.length; i < len; i++) {
			var node = nodes[i];
			frag.appendChild( processNode(node,paths,location.concat(i)) );
		}
		return frag;
	};
	
	var processNode = function(node, paths, location){
		var callback,
			loc = location,
			nodeType = typeof node,
			el,
			p;
		var getCallback = function(){
			if(!callback) {
				callback  = {
					path: location,
					callbacks: []
				};
				paths.push(callback);
				loc = [];
			}
			return callback;
		};
		
		if(nodeType === "object") {
			el = document.createElement(node.tag);
			
			
			if(node.attrs) {
				for(var attrName in node.attrs) {
					var value = node.attrs[attrName];
					if(typeof value === "function"){
						getCallback().callbacks.push({
							callback:  value
						})
					} else  {
						el.setAttribute(attrName, value);
					}  
				}
			}
			if(node.attributes) {
				for(var i = 0, len = node.attributes.length; i < len; i++ ) {
					if(typeof node.attributes[i] === "function") {
						getCallback().callbacks.push({callback: node.attributes[i]})
					}
				}
			}
			if(node.children && node.children.length) {
				// add paths
				if(callback) {
					p = callback.paths = []
				} else {
					p = paths;
				}
				el.appendChild( processNodes(node.children, p, loc) );
			}
		} else if(nodeType === "string"){
			el = document.createTextNode(node);
		} else if(nodeType === "function") {
			getCallback().callbacks.push({callback: node})
			el = document.createTextNode("");
		}
		return el;
	}
	
	var hydratePath = function(el, pathData, args){
		var path = pathData.path,
			callbacks = pathData.callbacks,
			paths = pathData.paths,
			callbackData;
		for(var i = 0, len = path.length; i < len; i++) {
			el = el.childNodes[path[i]];
		}
		
		for(i = 0, len = callbacks.length; i < len; i++) {
			callbackData = callbacks[i]
			callbackData.callback.apply(el, args );
		}
		if(paths && paths.length){
			for(i=0, len = paths.length; i< len; i++) {
				hydratePath(el,paths[i], args)
			}
		}
	}

	return function(nodes){
		var paths = [];
		var frag = processNodes(nodes, paths, []);
		return {
			paths: paths,
			clone: frag,
			hydrate: function(){
				var cloned = this.clone.cloneNode(),
					args = can.makeArray(arguments);
				for(var i=0, len = paths.length; i< len; i++) {
					hydratePath(cloned,paths[i], args)
				};
				return cloned;
			}
		}
	}
	
	
	
})
