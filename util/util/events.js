/* general lang-helper functions */
//TODO: get rid of jquery dependancy
var $ = require('jquery'); // jshint ignore:line
var can = require('can/util/can');
require('can/event/event');
var attr = require('can/util/attr/attr');

var isBindableElement = function(node) {
	// In IE8 window.window !== window.window, so we allow == here.
	/*jshint eqeqeq:false*/
	return (node.nodeName && (node.nodeType === 1 || node.nodeType === 9)) || node == window || node.addEventListener;
};

function on(ev, cb) {

	// If we can bind to it...
	if (this.bind && this.bind !== can.bind) {
		this.bind(ev, cb);
	} else if (isBindableElement(this)) {
		$.event.add(this, ev, cb);
	} else {
		// Make it bind-able...
		can.addEvent.call(this, ev, cb);
	}
	return this;

}

function off(ev, cb) {
  // If we can bind to it...
  if (this.unbind && this.unbind !== can.unbind) {
    this.unbind(ev, cb);
  } else if (isBindableElement(this)) {
    $.event.remove(this, ev, cb);
  } else {
    // Make it bind-able...
    can.removeEvent.call(this, ev, cb);
  }
  return this;
}

function trigger(obj, event, args, bubbles) {
  if (isBindableElement( obj ) ) {
    $.event.trigger(event, args, obj, !bubbles);
  } else if (obj.trigger) {
    obj.trigger(event, args);
  } else {
    if (typeof event === 'string') {
      event = {
        type: event
      };
    }
    event.target = event.target || obj;
    if(args){
      if( args.length && typeof args === "string") {
        args = [args];
      } else if(! args.length ) {
        args = [args];
      }
    }
    if(!args){
      args = [];
    }
    can.dispatch.call(obj, event, args);
  }
}

function delegate(selector, ev, cb) {
  if (this.delegate) {
    this.delegate(selector, ev, cb);
  } else if (isBindableElement(this)) {
    $(this)
      .delegate(selector, ev, cb);
  } else {
    // make it bind-able ...
    can.bind.call(this, ev, cb);
  }
  return this;
}

function undelegate(selector, ev, cb) {
  if (this.undelegate) {
    this.undelegate(selector, ev, cb);
  } else if (isBindableElement(this)) {
    $(this)
      .undelegate(selector, ev, cb);
  } else {
    can.unbind.call(this, ev, cb);
  }
  return this;
}

module.exports = {
  attr: attr,
  addEvent: can.addEvent,
  removeEvent: can.removeEvent,
  event: can.event,
	bind: on,
	unbind: off,
	on: on,
	off: off,
	trigger: trigger,
	delegate: delegate,
	undelegate: undelegate
};
