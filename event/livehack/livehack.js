steal.apps('jquery').then(function(){
	var liveHandler = null, event = jQuery.event;
	(function(){
		var add =  jQuery.event.add;
		jQuery.event.add = function(el, event, handler, data){
			if(data.selector == "stealing" && !event)
				liveHandler = handler;
			else
				add.apply(this, arguments)
		}
		var f = function(){}, d = {selector: "stealing"}
		jQuery.event.add(document, "live",f,d);
		jQuery.event.remove(document, "live",f,d);
		jQuery.event.add = add;
	})();
	
	
	//hack live to provide what we need
	event.special.live.add = function( proxy, data, namespaces, live ) {
				jQuery.extend( proxy, data || {} );
				proxy.guid += data.selector + data.live; 
				data.liveProxy = proxy;
				jQuery.event.add( this, data.live, liveHandler, data ); 
				
	}
	
	/**
	 * Finds event handlers of a given type on an element.
	 * @param {Object} el
	 * @param {Object} types
	 * @param {Object} selector
	 */
	event.find  = function(el, types, selector){
		var events = $.data(el, "events"), handlers = [];
		if(!events) return handlers;
		
		if(selector){
			if( !events.live) return [];
			var live = events.live, handlers = []
			
			for(var ev in live){
				if(  live[ev].selector == selector    &&  $.inArray(live[ev].live, types  ) !== -1 )
					handlers.push(live[ev].data.liveProxy)
			}
			
		}else{
			for(var ev in events){
				if( $.inArray(ev, types  ) !== -1 ){
					var evtype = events[ev]
					for(var guid in evtype) handlers.push(evtype[guid])
				}
					
			}
			
		}
		return handlers;
	}
	/**
	 * 
	 * @param {Array} types llist of types that will delegate here
	 * @param {Object} startingEvent the first event to start listening to
	 * @param {Object} onFirst a function to call 
	 */
	event.setupHelper = function(types, startingEvent, onFirst){
		if(!onFirst) {
			onFirst = startingEvent;
			startingEvent = null;
		}
		var add = function(fn, data, namespaces , handlers){
			var selector = data ? data.selector : "";
			if (selector) {
				var bySelector = event.find(this, types, selector);
				
				if (!bySelector.length) {
					var jq = $();
					jq.selector = selector
					jq.context = this;
					jq.live(startingEvent, {
						selector: selector,
						delegate: this
					}, onFirst)
				}
			}
			else {
				var bySelector = event.find(this, types, selector);
				event.add(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
			
		}
		var remove = function(data, namespaces, fn){
			var selector = data ? data.selector : "";
			if (selector) {
				if (!bySelector.length) {
					var jq = $();
					jq.selector = selector
					jq.context = this;
					jq.die(startingEvent, {
						selector: selector,
						delegate: this
					}, onFirst)
				}
			}
			else {
				event.remove(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
		}
		$.each(types, function(){
			event.special[this] = {
				add:  add,
				remove: remove,
				setup : function(){}
			}
		})
	}
	
	
	
})