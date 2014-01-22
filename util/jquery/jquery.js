steal('jquery', 'can/util/can.js', 'can/util/attr','can/util/array/each.js', "can/util/inserted","can/util/event.js",function($, can, attr) {
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

			elems = [elems];
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
		},
		proxy: function(fn, context){
			return function(){
				return fn.apply(context, arguments)
			}
		},
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
	
	var oldDomManip = $.fn.domManip,
		cbIndex;
	
	// feature detect which domManip we are using
	$.fn.domManip = function(args, cb1, cb2){
		for(var i = 1; i< arguments.length; i++){
			if(typeof arguments[i] === "function"){
				cbIndex = i;
				break;
			}
		}
		return oldDomManip.apply(this, arguments)
	}
	$(document.createElement("div")).append(document.createElement("div"))
	
	$.fn.domManip = (cbIndex == 2 ? 
		function(args, table, callback){
			return oldDomManip.call(this,args,table, function(elem){
				if(elem.nodeType === 11){
					var elems = can.makeArray(elem.childNodes);
				}
				var ret = callback.apply(this, arguments);
				can.inserted(elems ? elems : [elem]);
				return ret;
			})
		} :
		function(args, callback){
			return oldDomManip.call(this,args,function(elem){
				if(elem.nodeType === 11){
					var elems = can.makeArray(elem.childNodes);
				}
				var ret = callback.apply(this, arguments);
				can.inserted(elems ? elems : [elem]);
				return ret;
			})
		})
	
	if(!can.attr.MutationObserver) {
		// handle via calls to attr
		var oldAttr = $.attr;
		$.attr = function(el, attrName){
			if(arguments.length >= 3) {
				var oldValue = oldAttr.call(this, el, attrName);
			}
			var res = oldAttr.apply(this, arguments);
			if(arguments.length >= 3) {
				var newValue = oldAttr.call(this, el, attrName);
			}
			if(newValue != oldValue) {
				can.attr.trigger(el, attrName,oldValue);
			}
			return res;
		}
		var oldRemove = $.removeAttr;
		$.removeAttr = function(el, attrName){
			var oldValue = oldAttr.call(this, el, attrName),
				res = oldRemove.apply(this, arguments);
				
			if(oldValue != null) {
				can.attr.trigger(el, attrName,oldValue);
			}
			return res;
		}
		$.event.special.attributes = {
			setup: function(){
				can.data(can.$(this), "canHasAttributesBindings", true)
			},
			teardown: function(){
				$.cleanData( this, "canHasAttributesBindings")
			}
		};
	} else {
		// setup a special events
		$.event.special.attributes = {
			setup: function(){
				var self = this;
				var observer = new MutationObserver(function(mutations){
					mutations.forEach(function(mutation){
						var copy = can.simpleExtend({}, mutation)
						can.trigger(self, copy, [])
					})
					
				});
				observer.observe(this,{attributes: true, attributeOldValue: true} )
				can.data(can.$(this),"canAttributesObserver", observer)
			},
			teardown: function(){
				can.data(can.$(this),"canAttributesObserver").disconnect();
				$.removeData(this,"canAttributesObserver")
				
			}
		}
	}
	

	
	$.event.special.inserted = {};
	$.event.special.removed = {};

	return can;
});
