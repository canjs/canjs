steal("can/util/can.js",function(can){

	var setImmediate = window.setImmediate || function(cb){
			return setTimeout(cb,0)
		},
	attr = {
		MutationObserver: window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
		
		/**
		 * @property {Object.<String,(String|Boolean|function)>} can.view.attr.map 
		 * @parent can.view.elements
		 * 
		 * 
		 * A mapping of
		 * special attributes to their JS property. For example:
		 * 
		 *     "class" : "className"
		 * 
		 * means get or set `element.className`. And: 
		 * 
		 *      "checked" : true
		 * 
		 * means set `element.checked = true`.
		 *     
		 * 
		 * If the attribute name is not found, it's assumed to use
		 * `element.getAttribute` and `element.setAttribute`.
		 */
		 map: {
			"class" : "className",
			"value": "value",
			"innerText" : "innerText",
			"textContent" : "textContent",
			"checked": true,
			"disabled": true,
			"readonly": true,
			"required": true,
			src: function(el, val){
				if(val == null || val == ""){
					el.removeAttribute("src");
					return null;
				} else {
					el.setAttribute("src",val)
					return val;
				}
			},
			style: function(el, val){
				return el.style.cssText = val || ""
			}
		},
		// elements whos default value we should set
		defaultValue : ["input","textarea"],
		// Set an attribute on an element
		set: function (el, attrName, val) {
			if(! attr.MutationObserver ) {
				var oldValue = attr.get(el, attrName);
			}
			
			var tagName = el.nodeName.toString().toLowerCase(),
				prop = attr.map[attrName],
				newValue;
			// if this is a special property
			if(typeof prop === "function"){
				newValue = prop(el, val)
			} else if(prop === true) {
				newValue = el[attrName]  = true;
				
				if( attrName === "checked" && el.type === "radio" ) {
					if( can.inArray(tagName, attr.defaultValue) >= 0 ) {
						el.defaultChecked = true;
					}
				}
				
			} else if (prop) {
				// set the value as true / false
				newValue = el[prop] = val;
				if( prop === "value" && can.inArray(tagName, attr.defaultValue) >= 0 ) {
					el.defaultValue = val;
				}
			} else {
				el.setAttribute(attrName, val);
				newValue = val;
			}
			if(! attr.MutationObserver && newValue !== oldValue) {
				attr.trigger(el, attrName, oldValue)
			}
		},
		trigger: function(el, attrName, oldValue){
			// only trigger if someone has bound
			if( can.data(can.$(el), "canHasAttributesBindings" ) ){
				return setImmediate(function(){
					can.trigger(el, {
						type: "attributes",
						attributeName: attrName,
						target: el,
						oldValue: oldValue,
						bubbles: false
					}, []);
				})
			}
		},
		// Gets the value of an attribute.
		get: function(el, attrName){
			// Default to a blank string for IE7/8
			return (attr.map[attrName] && el[attr.map[attrName]] ?
				el[attr.map[attrName]]:
				el.getAttribute(attrName)) ;
		},
		// Removes the attribute.
		remove: function(el, attrName){
			if(! attr.MutationObserver ) {
				var oldValue = attr.get(el, attrName);
			}
			
			
			var setter = attr.map[attrName];
			if(typeof prop === "function"){
				prop(el, undefined)
			} if( setter === true ) {
				el[attrName] = false;
			} else if(typeof setter === "string"){
				el[setter] = "";
			} else {
				el.removeAttribute(attrName);
			}
			if (! attr.MutationObserver && oldValue != null) {
				attr.trigger(el, attrName, oldValue)
			}
			
		},
		has: (function(){
			
			var el = document.createElement('div');
			return el.hasAttribute ? 
				function(el, name) {
					return el.hasAttribute(name) ;
				} :
				function( el, name ) {
					return el.getAttribute(name) !== null;
				};
			
		})()
	};
	
	return attr;
	
})
