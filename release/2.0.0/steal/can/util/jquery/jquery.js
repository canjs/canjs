/*!
 * CanJS - 2.0.0
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 16 Oct 2013 21:40:37 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
steal('jquery', 'can/util/can.js', 'can/util/array/each.js', "can/util/inserted",function($, can) {
	// _jQuery node list._
	$.extend( can, $, {
		trigger: function( obj, event, args ) {
			if ( obj.trigger ) {
				obj.trigger( event, args );
			} else {
				$.event.trigger( event, args, obj, true );
			}
		},
		addEvent: function(ev, cb){
			$([this]).bind(ev, cb);
			return this;
		},
		removeEvent: function(ev, cb){
			$([this]).unbind(ev, cb);
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment : function(elems, context){
			var oldFragment = $.buildFragment,
				ret;

			elems = [elems];
			// Set context per 1.8 logic
			context = context || document;
			context = !context.nodeType && context[0] || context;
			context = context.ownerDocument || context;

			ret = oldFragment.call( jQuery, elems, context);

			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment || ret;
		},
		$: $,
		each: can.each
	});

	// Wrap binding functions.
	$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this]);
			t[func].apply(t, arguments);
			return this;
		};
	});

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
	
	$.fn.domManip = function(args, table, callback){
		return oldDomManip.call(this,args,table, function(elem){
			if(elem.nodeType === 11){
				var elems = can.makeArray(elem.childNodes);
			}
			var ret = callback.apply(this, arguments);
			can.inserted(elems? elems : [elem])
			return ret
		})
	}
	$.event.special.inserted = {};
	$.event.special.removed = {};

	return can;
});
