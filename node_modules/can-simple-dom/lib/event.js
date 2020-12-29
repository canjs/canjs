var Node = require('./document/node').Node;
var Document = require('./document');

var Event = function(){}
Event.prototype.initEvent = function(type, bubbles, cancelable){
	this.type = type;
	this.bubbles = !!bubbles;
	this.cancelable = !!cancelable;
};
Event.prototype.stopPropagation = function(){
	this.isPropagationStopped = true;
};
Event.prototype.preventDefault = function(){
	this.isDefaultPrevented = true;
}

Document.prototype.createEvent = function(type) {
	return new Event();
}

Node.prototype.addEventListener = function(event, handler, capture){
	if(!this.__handlers) {
		Object.defineProperty(this,"__handlers",{
			value: {},
			enumerable: false
		})
	}
	var phase = capture ? "capture" : "bubble";
	var handlersByType = this.__handlers[event+" "+phase];
	if(!handlersByType) {
		handlersByType = this.__handlers[event+" "+phase] = [];
	}
	if(handlersByType.indexOf(handler) === -1) {
		handlersByType.push(handler)
	}
};
Node.prototype.removeEventListener = function(event, handler, capture){
	if(this.__handlers) {
		var phase = capture ? "capture" : "bubble";
		var handlersByType = this.__handlers[event+" "+phase];
		if(handlersByType) {
			var index = 0;
			while( index < handlersByType.length) {
				if(handlersByType[index] === handler) {
					handlersByType.splice(index, 1);
				} else {
					index++;
				}
			}
		}
	}
};
Node.prototype.dispatchEvent = function(event){
	event.target = this;
	// dispatch bubble only

	// get all handlers and then elements
	var cur = this;
	var dispatchHandlers = [];
	do {
		var handlers = cur.__handlers && cur.__handlers[event.type+" bubble"];
		if(handlers) {
			dispatchHandlers.push({
				node: cur,
				handlers: handlers
			})
		}
		cur = cur.parentNode;
	} while(event.bubbles && cur);

	// TOOD: add the window's event handlers

	for(var i = 0; i < dispatchHandlers.length; i++) {
		var dispatches = dispatchHandlers[i];
		event.currentTarget = dispatches.node;
		for(var h = 0; h < dispatches.handlers.length; h++) {
			var handler = dispatches.handlers[h];
			var res = handler.call(this, event);
			if(res) {
				event.stopPropagation();
				event.preventDefault();
			}
			if(event.isImmediatePropagationStopped) {
				return !event.isDefaultPrevented;
			}
		}
		if(event.isPropagationStopped) {
			return !event.isDefaultPrevented;
		}
	}
	return !event.isDefaultPrevented;
};

module.exports = Event;
