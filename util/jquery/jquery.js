steal('jquery', 'can/util/can.js', 'jquery', 'can/util/array/each.js', function($, can) {
	// jquery.js
	// ---------
	// _jQuery node list._
	$.extend( can, jQuery, {
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
		buildFragment : function(result, element){
			var ret = $.buildFragment([result],$(element));
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment;
		},
		$: jQuery,
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

	// Wrap modifier functions.
	$.each(["append","filter","addClass","remove","data","get"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			if ( elem ) {
				can.trigger(elem,"destroyed",[],false);
			}
		});
		oldClean(elems);
	};

	return can;
});
