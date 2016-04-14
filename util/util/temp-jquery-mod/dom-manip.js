var $ = require('./jquery-dom-manip'); // jshint ignore:line
var isArrayLike = require('can/util/array/isArrayLike');
var buildFragment = require('can/util/fragment');
var inserted = require('can/util/inserted/inserted').inserted;
var childNodes = require('can/util/childNodes');

module.exports = function() {

	var oldDomManip = $.fn.domManip;
	var cbIndex;

	// feature detect which domManip we are using
	$.fn.domManip = function(args, cb1, cb2) {
		for (var i = 1; i < arguments.length; i++) {
			if (typeof arguments[i] === 'function') {
				cbIndex = i;
				break;
			}
		}
		return oldDomManip.apply(this, arguments);
	};


	$(document.createElement("div"))
		.append(document.createElement("div"));

	var getChildNodes = function(node) {
		var childNodes = node.childNodes;
		if ("length" in childNodes) {
			return can.makeArray(childNodes);
		} else {
			var cur = node.firstChild;
			var nodes = [];
			while (cur) {
				nodes.push(cur);
				cur = cur.nextSibling;
			}
			return nodes;
		}
	};

	if (cbIndex === undefined) {
		var fns = ['after', 'prepend', 'before', 'append', 'replaceWith'];
		$.fn.domManip = oldDomManip;
		// we must manually overwrite
		for(f in fns){
			var name = fns[f];
			var original = $.fn[name];
			$.fn[name] = function() {
				var elems,
					args = can.makeArray(arguments);

				if (args[0] != null) {
					// documentFragment
					if (typeof args[0] === "string") {
						args[0] = buildFragment(args[0]);
					}
					if (args[0].nodeType === 11) {
						elems = getChildNodes(args[0]);
					} else if (isArrayLike(args[0])) {
						elems = $.makeArray(args[0]);
					} else {
						elems = [args[0]];
					}
				}

				var ret = original.apply(this, args);

				inserted(elems);

				return ret;
			};

		}
	} else {
		// Older jQuery that supports domManip


		$.fn.domManip = (cbIndex === 2 ?
			function(args, table, callback) {
				return oldDomManip.call(this, args, table, function(elem) {
					var elems;
					if (elem.nodeType === 11) {
						elems = can.makeArray(childNodes(elem));
					}
					var ret = callback.apply(this, arguments);
					inserted(elems ? elems : [elem]);
					return ret;
				});
			} :
			function(args, callback) {
				return oldDomManip.call(this, args, function(elem) {
					var elems;
					if (elem.nodeType === 11) {
						elems = $.makeArray(childNodes(elem));
					}
					var ret = callback.apply(this, arguments);
					inserted(elems ? elems : [elem]);
					return ret;
				});
			});
	}
};
