/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/view", "can/view/elements", "can/view/live", "can/util/string"], function(can, elements, live){

/**
 * Helper(s)
 */
var pendingHookups = [],
	tagChildren = function(tagName) {
		var newTag = elements.tagMap[tagName] || "span";
		if(newTag === "span") {
			//innerHTML in IE doesn't honor leading whitespace after empty elements
			return "@@!!@@";
		}	
		return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
	},
	contentText = function( input, tag ) {	
		
		// If it's a string, return.
		if ( typeof input == 'string' ) {
			return input;
		}
		// If has no value, return an empty string.
		if ( !input && input !== 0 ) {
			return '';
		}

		// If it's an object, and it has a hookup method.
		var hook = (input.hookup &&

		// Make a function call the hookup method.
		function( el, id ) {
			input.hookup.call(input, el, id);
		}) ||

		// Or if it's a `function`, just use the input.
		(typeof input == 'function' && input);

		// Finally, if there is a `function` to hookup on some dom,
		// add it to pending hookups.
		if ( hook ) {
			if(tag){
				return "<"+tag+" "+can.view.hook(hook)+"></"+tag+">"
			} else {
				pendingHookups.push(hook);
			}
			
			return '';
		}

		// Finally, if all else is `false`, `toString()` it.
		return "" + input;
	},
	// Returns escaped/sanatized content for anything other than a live-binding
	contentEscape = function( txt ) {
		return (typeof txt == 'string' || typeof txt == 'number') ?
			can.esc( txt ) :
			contentText(txt);
	};


var current;

can.extend(can.view, {
	live: live,
	setupLists: function(){

		var old = can.view.lists,
			data;

		can.view.lists = function(list, renderer){
			data = {
				list: list,
				renderer: renderer
			}
		}
		return function(){
			can.view.lists = old;
			return data;
		}
	},
	pending: function() {
		// TODO, make this only run for the right tagName
		var hooks = pendingHookups.slice(0);
		lastHookups = hooks;
		pendingHookups = [];
		return can.view.hook(function(el){
			can.each(hooks, function(fn){
				fn(el);
			});
		});
	},

	/**
	 * @hide
	 * called to setup unescaped text
	 * Called to return the content within a magic tag like `<%= %>`.
	 *
	 * - escape - if the content returned should be escaped
	 * - tagName - the tag name the magic tag is within or the one that proceeds the magic tag
	 * - status - where the tag is in.  The status can be:
	 *   - _STRING_ - The name of the attribute the magic tag is within
	 *    - `1` - The magic tag is within a tag like `<div <%= %>>`
	 *    - `0` - The magic tag is outside (or between) tags like `<div><%= %></div>`
	 * - self - the `this` the template was called with
	 * - func - the "wrapping" function.  For example:  `<%= task.attr('name') %>` becomes
	 *   `(function(){return task.attr('name')})
	 *
	 * @param {Number|String} status
	 *   - "string" - the name of the attribute  <div string="HERE">
	 *   - 1 - in an html tag <div HERE></div>
	 *   - 0 - in the content of a tag <div>HERE</div>
	 * @param {Object} self
	 * @param {Object} func
	 */
	txt: function(escape, tagName, status, self, func){
		var listTeardown = can.view.setupLists(),
			emptyHandler = function(){},
			unbind = function(){
				compute.unbind("change",emptyHandler)
			};

		var compute = can.compute(func, self, false);
		// bind to get and temporarily cache the value
		compute.bind("change",emptyHandler);
		// call the "wrapping" function and get the binding information
		var tag = (elements.tagMap[tagName] || "span"),
			listData = listTeardown(),
			value = compute();
		

		if(listData){
			return "<" +tag+can.view.hook(function(el, parentNode){
				live.list(el, listData.list, listData.renderer, self, parentNode);
			})+"></" +tag+">";
		}

		// If we had no observes just return the value returned by func.
		if(!compute.hasDependencies){
			unbind();
			return (escape || status !== 0? contentEscape : contentText)(value, status === 0 && tag);
		}


		// the property (instead of innerHTML elements) to adjust. For
		// example options should use textContent
		var contentProp = elements.tagToContentPropMap[tagName];
		

		// The magic tag is outside or between tags.
		if ( status === 0 && !contentProp ) {
			// Return an element tag with a hookup in place of the content
			return "<" +tag+can.view.hook(
			escape ? 
				// If we are escaping, replace the parentNode with 
				// a text node who's value is `func`'s return value.
				function(el, parentNode){
					live.text(el, compute, parentNode);
					unbind();
				} 
				:
				// If we are not escaping, replace the parentNode with a
				// documentFragment created as with `func`'s return value.
				function( el, parentNode ) {
					live.html(el, compute, parentNode);
					unbind();
				//children have to be properly nested HTML for buildFragment to work properly
				}) + ">"+tagChildren(tag)+"</" +tag+">";
		// In a tag, but not in an attribute
		} else if( status === 1 ) { 
			// remember the old attr name
			pendingHookups.push(function(el) {
				live.attributes(el, compute, compute());
				unbind();
			});
			return compute();
		} else { // In an attribute...
			var attributeName = status === 0 ? contentProp : status;
			// if the magic tag is inside the element, like `<option><% TAG %></option>`,
			// we add this hookup to the last element (ex: `option`'s) hookups.
			// Otherwise, the magic tag is in an attribute, just add to the current element's
			// hookups.
			(status === 0  ? lastHookups : pendingHookups ).push(function(el){
				live.attribute(el, attributeName, compute);
				unbind();
			});
			return live.attributePlaceholder;
		}
	}
});

return can;
});