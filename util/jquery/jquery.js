//352
steal('./jquery.1.7.1.js', function( $ ) {

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
		$: jQuery,
		prototype: jQuery.fn
	});

	// make binding functions
	$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this])
			t[func].apply(t, arguments)
			return this;
		}
	})

	// make modifier based functions
	$.each(["append","filter","addClass","remove","data","get"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1))
		}
	})

})
