"use strict";

var makeFragment = require('can-fragment');
var canReflect = require('can-reflect');
var canSymbol = require("can-symbol");
var helpers = require('./helpers');
var getDocument = require('can-globals/document/document');

var viewInsertSymbol = canSymbol.for("can.viewInsert");

function makeCommentFragment(comment) {
		var doc = getDocument();
		return makeFragment([
			doc.createComment(comment),
			doc.createComment("can-end-placeholder")
		]);
}

/**
 * @function can-view-live.html html
 * @parent can-view-live
 * @release 2.0.4
 *
 * Live binds a compute's value to a collection of elements.
 *
 * @signature `live.html(el, compute, [parentNode])`
 *
 * `live.html` is used to setup incremental live-binding on a block of html.
 *
 * ```js
 * // a compute that changes its list
 * var greeting = compute(function(){
 *   return "Welcome <i>"+me.attr("name")+"</i>"
 * });
 *
 * var placeholder = document.createTextNode(" ");
 * $("#greeting").append(placeholder);
 *
 * live.html(placeholder, greeting);
 * ```
 *
 * @param {HTMLElement} el An html element to replace with the live-section.
 *
 * @param {can.compute} compute A [can.compute] whose value is HTML.
 *
 * @param {HTMLElement} [parentNode] An overwritable parentNode if `el`'s parent is
 * a documentFragment.
 *
 *
 */
module.exports = function(el, compute, viewInsertSymbolOptions) {

	var observableName = "";
	var updateRange = helpers.range.update;

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		// register that the handler changes the parent element
		updateRange = helpers.range.update.bind(null);
		observableName = canReflect.getName(compute);
		Object.defineProperty(updateRange, "name", {
			value: "live.html update::"+observableName,
		});
	}
	//!steal-remove-end

	if (el.nodeType !== Node.COMMENT_NODE) {
		var commentFrag = makeCommentFragment(observableName);
		var startCommentNode = commentFrag.firstChild;
		el.parentNode.replaceChild(commentFrag, el);
		el = startCommentNode;
	}

	// replace element with a comment node
	var range = helpers.range.create(el, observableName);

	var useQueue = false;
	new helpers.ListenUntilRemovedAndInitialize(compute,
		function canViewLive_updateHTML(val) {

			// If val has the can.viewInsert symbol, call it and get something usable for val back
			if (val && typeof val[viewInsertSymbol] === "function") {
				val = val[viewInsertSymbol](viewInsertSymbolOptions);
			}

			var isFunction = typeof val === "function";

			// translate val into a document fragment if it's DOM-like
			var frag = isFunction ?
				makeCommentFragment(observableName) :
				makeFragment(val);

			if(isFunction) {
				val(frag.firstChild);
			}

			if(useQueue === true) {
				helpers.range.remove(range);
				updateRange(range, frag);
			} else {
				helpers.range.update(range, frag);
				useQueue = true;
			}
		},
		range.start,
		"dom",
		"live.html replace::" + observableName);

};
