steal(function(){

Can.addEvent = function(event, fn){
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
Can.removeEvent = function(event, fn){
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
Can.dispatch = function(event){
	if(!this.__bindEvents){
		return;
	}
	
	var handlers = this.__bindEvents[event.type] || [],
		self= this,
		args = [event].concat(event.data || []);
	Can.each(handlers, function(i, ev){
		event.data = args.slice(1);
		ev.handler.apply(self, args);
	});
}



})