var $ = require('jquery'); // jshint ignore:line
var can = require('can/util/can');
var attr = require('can/util/attr/attr');
require('can/event/event');
require('can/util/fragment');
require('can/util/array/each');
require('can/util/inserted/inserted');

var isBindableElement = function (node) {
	// In IE8 window.window !== window.window, so we allow == here.
	/*jshint eqeqeq:false*/
	return (node.nodeName && (node.nodeType === 1 || node.nodeType === 9)) || node == window || node.addEventListener;
};
// $ = $ || window.jQuery;
// _jQuery node list._
$.extend(can, $, {
	trigger: function (obj, event, args, bubbles) {
		if (isBindableElement( obj ) ) {
			$.event.trigger(event, args, obj, !bubbles);
		} else if (obj.trigger) {
			obj.trigger(event, args);
		} else {
			if (typeof event === 'string') {
				event = {
					type: event
				};
			}
			event.target = event.target || obj;
			if(args){
				if( args.length && typeof args === "string") {
					args = [args];
				} else if(! args.length ) {
					args = [args];
				}
			}
			if(!args){
				args = [];
			}
			can.dispatch.call(obj, event, args);
		}
	},
	event: can.event,
	addEvent: can.addEvent,
	removeEvent: can.removeEvent,
	buildFragment: can.buildFragment,
	$: $,
	bind: function (ev, cb) {
		// If we can bind to it...
		if (this.bind && this.bind !== can.bind) {
			this.bind(ev, cb);
		} else if (isBindableElement(this)) {
			$.event.add(this, ev, cb);
		} else {
			// Make it bind-able...
			can.addEvent.call(this, ev, cb);
		}
		return this;
	},
	unbind: function (ev, cb) {
		// If we can bind to it...
		if (this.unbind && this.unbind !== can.unbind) {
			this.unbind(ev, cb);
		} else if (isBindableElement(this)) {
			$.event.remove(this, ev, cb);
		} else {
			// Make it bind-able...
			can.removeEvent.call(this, ev, cb);
		}
		return this;
	},
	delegate: function (selector, ev, cb) {
		if (this.delegate) {
			this.delegate(selector, ev, cb);
		} else if (isBindableElement(this)) {
			$(this)
				.delegate(selector, ev, cb);
		} else {
			// make it bind-able ...
			can.bind.call(this, ev, cb);
		}
		return this;
	},
	undelegate: function (selector, ev, cb) {
		if (this.undelegate) {
			this.undelegate(selector, ev, cb);
		} else if (isBindableElement(this)) {
			$(this)
				.undelegate(selector, ev, cb);
		} else {
			can.unbind.call(this, ev, cb);
		}
		return this;
	},
	proxy: can.proxy,
	attr: attr
});
// Wrap binding functions.
/*$.each(['bind','unbind','undelegate','delegate'],function(i,func){
	can[func] = function(){
		var t = this[func] ? this : $([this]);
		t[func].apply(t, arguments);
		return this;
	};
});*/
// Aliases
can.on = can.bind;
can.off = can.unbind;
// Wrap modifier functions.
$.each([
	'append',
	'filter',
	'addClass',
	'remove',
	'data',
	'get',
	'has'
], function (i, name) {
	can[name] = function (wrapped) {
		return wrapped[name].apply(wrapped, can.makeArray(arguments)
			.slice(1));
	};
});
// Memory safe destruction.
var oldClean = $.cleanData;
$.cleanData = function (elems) {
	$.each(elems, function (i, elem) {
		if (elem) {
			can.trigger(elem, 'removed', [], false);
		}
	});
	oldClean(elems);
};



var oldDomManip = $.fn.domManip,
	cbIndex;

// feature detect which domManip we are using
$.fn.domManip = function (args, cb1, cb2) {
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

var getChildNodes = function(node){
	var childNodes = node.childNodes;
	if("length" in childNodes) {
		return can.makeArray(childNodes);
	} else {
		var cur = node.firstChild;
		var nodes = [];
		while(cur) {
			nodes.push(cur);
			cur = cur.nextSibling;
		}
		return nodes;
	}
};

if(cbIndex === undefined) {
	$.fn.domManip = oldDomManip;
	// we must manually overwrite
	can.each(['after', 'prepend', 'before', 'append','replaceWith'], function (name) {
		var original = $.fn[name];
		$.fn[name] = function () {
			var elems,
				args = can.makeArray(arguments);

			if (args[0] != null) {
				// documentFragment
				if (typeof args[0] === "string") {
					args[0] = can.buildFragment(args[0]);
				}
				if (args[0].nodeType === 11) {
					elems = getChildNodes(args[0]);
				} else if( can.isArrayLike( args[0] ) ) {
					elems = can.makeArray(args[0]);
				} else {
					elems = [args[0]];
				}
			}

			var ret = original.apply(this, args);

			can.inserted(elems);

			return ret;
		};
	});
} else {
	// Older jQuery that supports domManip


	$.fn.domManip = (cbIndex === 2 ?
		function (args, table, callback) {
			return oldDomManip.call(this, args, table, function (elem) {
				var elems;
				if (elem.nodeType === 11) {
					elems = can.makeArray( can.childNodes(elem) );
				}
				var ret = callback.apply(this, arguments);
				can.inserted(elems ? elems : [elem]);
				return ret;
			});
		} :
		function (args, callback) {
			return oldDomManip.call(this, args, function (elem) {
				var elems;
				if (elem.nodeType === 11) {
					elems = can.makeArray( can.childNodes(elem) );
				}
				var ret = callback.apply(this, arguments);
				can.inserted(elems ? elems : [elem]);
				return ret;
			});
		});
}



// handle via calls to attr
var oldAttr = $.attr;
$.attr = function (el, attrName) {
	if( can.isDOM(el) && can.attr.MutationObserver) {
		return oldAttr.apply(this, arguments);
	} else {
		var oldValue, newValue;
		if (arguments.length >= 3) {
			oldValue = oldAttr.call(this, el, attrName);
		}
		var res = oldAttr.apply(this, arguments);
		if (arguments.length >= 3) {
			newValue = oldAttr.call(this, el, attrName);
		}
		if (newValue !== oldValue) {
			can.attr.trigger(el, attrName, oldValue);
		}
		return res;
	}
};
var oldRemove = $.removeAttr;
$.removeAttr = function (el, attrName) {
	if( can.isDOM(el) && can.attr.MutationObserver) {
		return oldRemove.apply(this, arguments);
	} else {
		var oldValue = oldAttr.call(this, el, attrName),
			res = oldRemove.apply(this, arguments);

		if (oldValue != null) {
			can.attr.trigger(el, attrName, oldValue);
		}
		return res;
	}
};
$.event.special.attributes = {
	setup: function () {
		if( can.isDOM(this) && can.attr.MutationObserver) {
			var self = this;
			var observer = new can.attr.MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					var copy = can.simpleExtend({}, mutation);
					can.trigger(self, copy, []);
				});

			});
			observer.observe(this, {
				attributes: true,
				attributeOldValue: true
			});
			can.data(can.$(this), "canAttributesObserver", observer);
		} else {
			can.data(can.$(this), "canHasAttributesBindings", true);
		}
	},
	teardown: function () {
		if( can.isDOM(this) && can.attr.MutationObserver) {
			can.data(can.$(this), "canAttributesObserver")
			.disconnect();
			$.removeData(this, "canAttributesObserver");
		} else {
			$.removeData(this, "canHasAttributesBindings");
		}

	}
};

$.event.special.inserted = {};
$.event.special.removed = {};
module.exports = can;
