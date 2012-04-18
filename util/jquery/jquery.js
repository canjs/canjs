steal('./jquery.1.7.1.js', "./../preamble.js", function( $ ) {

	// jquery.js
	// ---------
	// _jQuery node list._
	$.extend( can, jQuery, {
		trigger: function( obj, event, args ) {
			obj.trigger ?
				obj.trigger( event, args ) :
				$.event.trigger( event, args, obj, true );
		},
		addEvent: function(ev, cb){
			$([this]).bind(ev, cb)
			return this;
		},
		removeEvent: function(ev, cb){
			$([this]).unbind(ev, cb)
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment : function(result, element){
			var ret = $.buildFragment([result],[element]);
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment
		},
		$: jQuery,
		prototype: jQuery.fn
	});

	// Wrap binding functions.
	$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this])
			t[func].apply(t, arguments)
			return this;
		}
	})

	// Wrap modifier functions.
	$.each(["append","filter","addClass","remove","data","get"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1))
		}
	})

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			can.trigger(elem,"destroyed",[],false)
		});
		oldClean(elems);
	};
}).then('can/util/array/each.js')
