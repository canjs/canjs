steal(function(){

/**
 * @function addEvent
 * Adds an event and callback.
 * @param {Object} event Name of the event to add.
 * @param {Object} function Function to be called when event is invoked.
 */
can.addEvent = function(event, fn){
	if(!this.__bindEvents){
		this.__bindEvents = {};
	}
	var eventName = event.split(".")[0];
	
	if(!this.__bindEvents[eventName]){
		this.__bindEvents[eventName] = [];
	}
	this.__bindEvents[eventName].push({
		handler: fn,
		name: event
	});
	return this;
};

/**
 * @function removeEvent
 * Removes an event from the listeners binded using 'addEvent'.
 * @param {Object} event Name of the event to remove.
 */
can.removeEvent = function(event, fn){
	if(!this.__bindEvents){
		return;
	}
	var i =0,
		events = this.__bindEvents[event.split(".")[0]],
		ev;
	while(i < events.length){
		ev = events[i]
		if((fn && ev.handler === fn) || (!fn && ev.name === event)){
			events.splice(i, 1);
		} else {
			i++;
		}
	}	
	return this;
};

/**
 * @function dispatch
 * Dispatches an event to all the listeners binded using 'addEvent'.
 * @param {Object} event Name of the event to dispatch.
 */
can.dispatch = function(event){
	if(!this.__bindEvents){
		return;
	}
	
	var eventName = event.type.split(".")[0],
		handlers = this.__bindEvents[eventName] || [],
		self= this,
		args = [event].concat(event.data || []);
		
	can.each(handlers, function(i, ev){
		event.data = args.slice(1);
		ev.handler.apply(self, args);
	});
}



})