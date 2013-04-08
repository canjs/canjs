
steal(function(){
	/**
	 * @typedef {{}} can/view/elements.js
	 * 
	 * Provides helper methods for and information about the behavior
	 * of DOM elements.
	 */
	var elements = {
		tagToContentPropMap: {
			option: "textContent" in document.createElement("option") ? "textContent" : "innerText",
			textarea: "value"
		},
		/**
		 * @property {Object.<String,(String|Boolean)>} attrMap a mapping of
		 * special attributes to their JS property. For example:
		 * 
		 *     "class" : "className"
		 * 
		 * means call element.className. And: 
		 * 
		 *      "checked" : true
		 * 
		 * means call `element.checked = true`
		 *     
		 */
		attrMap: {
			"class" : "className",
			"value": "value",
			"innerText" : "innerText",
			"textContent" : "textContent",
			"checked": true,
			"disabled": true,
			"readonly": true,
			"required": true
		},
		// elements whos default value we should set
		defaultValue : ["input","textarea"],
		// a map of parent element to child elements
		tagMap : {
			"": "span", 
			table: "tbody", 
			tr: "td",
			ol: "li", 
			ul: "li", 
			tbody: "tr",
			thead: "tr",
			tfoot: "tr",
			select: "option",
			optgroup: "option"
		},
		// a tag's parent element
		reverseTagMap: {
			tr:"tbody",
			option:"select",
			td:"tr",
			th:"tr",
			li: "ul"
		},
		
		getParentNode: function(el, defaultParentNode){
			return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
		},
		// set an attribute on an element
		setAttr: function (el, attrName, val) {
			var tagName = el.nodeName.toString().toLowerCase(),
				prop = elements.attrMap[attrName];
			// if this is a special property
			if(prop === true) {
				el[attrName]  = true;
			} else if (prop) {
				// set the value as true / false
				el[prop] = val;
				if( prop === "value" && can.inArray(tagName, elements.defaultValue) >= 0 ) {
					el.defaultValue = val;
				}
			} else {
				el.setAttribute(attrName, val);
			}
		},
		// gets the value of an attribute
		getAttr: function(el, attrName){
			// Default to a blank string for IE7/8
			return (elements.attrMap[attrName] && el[elements.attrMap[attrName]] ?
				el[elements.attrMap[attrName]]:
				el.getAttribute(attrName)) || '';
		},
		// removes the attribute
		removeAttr: function(el, attrName){
			if( elements.attrMap[attrName] === true ) {
				el[attrName] = false;
			} else{
				el.removeAttribute(attrName);
			}
		},
		contentText: function(text){
			if ( typeof text == 'string' ) {
				return text;
			}
			// If has no value, return an empty string.
			if ( !text && text !== 0 ) {
				return '';
			}
			return "" + text;
		}
	};
	
	return elements;
})
