steal('jquery', 'can/util/can.js', 'can/util/array/each.js', "can/util/inserted","can/util/event.js",function($, can) {
	var isBindableElement = function(node){
		//console.log((node.nodeName && (node.nodeType == 1 || node.nodeType == 9) || node === window))
		return (node.nodeName && (node.nodeType == 1 || node.nodeType == 9) || node == window);
	};

	// _jQuery node list._
	$.extend( can, $, {
		trigger: function( obj, event, args ) {
			if(obj.nodeName || obj === window) {
				$.event.trigger( event, args, obj, true );
			} else if ( obj.trigger ) {
				obj.trigger( event, args );
			} else {
				if(typeof event === 'string'){
					event = {type: event}
				}
				event.target = event.target || obj;
				can.dispatch.call(obj, event, args);
			}
		},
		addEvent: can.addEvent,
		removeEvent: can.removeEvent,
		// jquery caches fragments, we always needs a new one
		buildFragment : function(elems, context){
			var oldFragment = $.buildFragment,
				ret;

			elems = can.isArray(elems) ? elems : [elems];
			// Set context per 1.8 logic
			context = context || document;
			context = !context.nodeType && context[0] || context;
			context = context.ownerDocument || context;

			ret = oldFragment.call( jQuery, elems, context);

			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment || ret;
		},
		$: $,
		each: can.each,
		bind: function( ev, cb){
			// If we can bind to it...
			if(this.bind && this.bind !== can.bind){
				this.bind(ev, cb)
			} else if(isBindableElement(this)) {
				$.event.add(this, ev, cb);
			} else {
				// Make it bind-able...
				can.addEvent.call(this, ev, cb)
			}
			return this;
		},
		unbind: function(ev, cb){
			// If we can bind to it...
			if(this.unbind && this.unbind !== can.unbind){
				this.unbind(ev, cb)
			} else if(isBindableElement(this)) {
				$.event.remove(this, ev, cb);
			} else {
				// Make it bind-able...
				can.removeEvent.call(this, ev, cb)
			}
			return this;
		},
		delegate: function(selector, ev , cb){
			if(this.delegate) {
				this.delegate(selector, ev , cb)
			}
			 else if(isBindableElement(this)) {
				$(this).delegate(selector, ev, cb)
			} else {
				// make it bind-able ...
			}
			return this;
		},
		undelegate: function(selector, ev , cb){
			if(this.undelegate) {
				this.undelegate(selector, ev , cb)
			}
			 else if(isBindableElement(this)) {
				$(this).undelegate(selector, ev, cb)
			} else {
				// make it bind-able ...
	
			}
			return this;
		}
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
	$.each(["append","filter","addClass","remove","data","get","has"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			if ( elem ) {
				can.trigger(elem,"removed",[],false);
			}
		});
		oldClean(elems);
	};
	
	var oldDomManip = $.fn.domManip;
	
	$.fn.domManip = function(){
		var args = can.makeArray(arguments),
			isNew$ = $.fn.jquery >= "2.0.0",
			cbIndex = isNew$ ? 1 : 2,
			callback = args[cbIndex];

		args[cbIndex] = function(elem) {
			var isFragment = elem.nodeType === 11, //Node.DOCUMENT_FRAGMENT_NODE,
				targets = isFragment ? can.makeArray(elem.childNodes) : [elem],
				ret = callback.apply(this, arguments);
			can.inserted(targets);
			return ret;
		};

		return oldDomManip.apply(this, args);
	};

	$.event.special.inserted = {};
	$.event.special.removed = {};

	return can;
});