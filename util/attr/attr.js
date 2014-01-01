steal("can/util/can.js",function(can){

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
		setImmediate = window.setImmediate || function(cb){
			return setTimeout(cb,0)
		},
	attr = {
		MutationObserver: MutationObserver,
		
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
			if(! MutationObserver ) {
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
			if(! MutationObserver && newValue !== oldValue) {
				attr.trigger(el, attrName, oldValue)
			}
		},
		trigger: function(el, attrName, oldValue){
			return setImmediate(function(){
				can.trigger(el, {
					type: "attributes",
					attributeName: attrName,
					target: el,
					oldValue: oldValue
				}, []);
			})
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
			if(! MutationObserver ) {
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
			if (! MutationObserver && oldValue != null) {
				attr.trigger(el, attrName, oldValue)
			}
			
		}
	};
	
	return attr;
	
})
