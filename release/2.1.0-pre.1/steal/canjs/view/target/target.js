/*!
 * CanJS - 2.1.0-pre.1
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 05 May 2014 20:37:28 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
/* jshint maxdepth:7*/
steal("can/util", "can/view/elements.js",function(can, elements){
	
	var processNodes = function(nodes, paths, location){
		var frag = document.createDocumentFragment();
		
		for(var i = 0, len = nodes.length; i < len; i++) {
			var node = nodes[i];
			frag.appendChild( processNode(node,paths,location.concat(i)) );
		}
		return frag;
	},
		keepsTextNodes =  (function(){
			var testFrag = document.createDocumentFragment();
			var div = document.createElement("div");
			
			div.appendChild(document.createTextNode(""));
			div.appendChild(document.createTextNode(""));
			testFrag.appendChild(div);
			
			var cloned  = testFrag.cloneNode(true);
			
			return cloned.childNodes[0].childNodes.length === 2;
		})();

	function processNode(node, paths, location){
		var callback,
			loc = location,
			nodeType = typeof node,
			el,
			p,
			i , len;
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
			if( node.tag ) {
				el = document.createElement(node.tag);
			
				if(node.attrs) {
					for(var attrName in node.attrs) {
						var value = node.attrs[attrName];
						if(typeof value === "function"){
							getCallback().callbacks.push({
								callback:  value
							});
						} else  {
							el.setAttribute(attrName, value);
						}
					}
				}
				if(node.attributes) {
					for(i = 0, len = node.attributes.length; i < len; i++ ) {
						getCallback().callbacks.push({callback: node.attributes[i]});
					}
				}
				if(node.children && node.children.length) {
					// add paths
					if(callback) {
						p = callback.paths = [];
					} else {
						p = paths;
					}
					el.appendChild( processNodes(node.children, p, loc) );
				}
			} else if(node.comment) {
				el = document.createComment(node.comment);
				
				if(node.callbacks) {
					for(i = 0, len = node.attributes.length; i < len; i++ ) {
						getCallback().callbacks.push({callback: node.callbacks[i]});
					}
				}
			}
			
			
		} else if(nodeType === "string"){
			el = document.createTextNode(node);
		} else if(nodeType === "function") {
			
			if(keepsTextNodes) {
				el = document.createTextNode("");
				getCallback().callbacks.push({callback: node});
			} else {
				el = document.createComment("~");
				getCallback().callbacks.push({callback: function(){
					var el = document.createTextNode("");
					elements.replace([this], el);
					return node.apply(el,arguments );
				}});
			}
			
		}
		return el;
	}
	
	function hydratePath(el, pathData, args){
		var path = pathData.path,
			callbacks = pathData.callbacks,
			paths = pathData.paths,
			callbackData,
			child = el;
		
		for(var i = 0, len = path.length; i < len; i++) {
			child = child.childNodes[path[i]];
		}
		
		for(i = 0, len = callbacks.length; i < len; i++) {
			callbackData = callbacks[i];
			callbackData.callback.apply(child, args );
		}
		if(paths && paths.length){
			for(i=0, len = paths.length; i< len; i++) {
				hydratePath(child,paths[i], args);
			}
		}
	}

	function makeTarget(nodes){
		var paths = [];
		var frag = processNodes(nodes, paths, []);
		return {
			paths: paths,
			clone: frag,
			hydrate: function(){
				var cloned = this.clone.cloneNode(true),
					args = can.makeArray(arguments);
				for(var i = paths.length - 1; i >=0 ; i--) {
					hydratePath(cloned,paths[i], args);
				}
				return cloned;
			}
		};
	}
	makeTarget.keepsTextNodes = keepsTextNodes;
	
	can.view.target = makeTarget;

	return makeTarget;
});
