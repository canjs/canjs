// # can/map/map_helpers
// Helpers that enable bubbling of an event on a child object to a
// parent event on a parent object. Bubbling works by listening on the child object
// and forwarding events to the parent object.
// 
// Bubbling is complicated because bubbling setup can happen before or after
// items are added to the parent object.
//
// This means that:
// - When bubbling is first initialied, by binding to an event that bubbles, 
//   all child objects need to be setup to bubble. This is managed by [bubble.bind](#bubble-bind).
// - When bubbling is stopped, by removing all listeners to events that bubble, 
//   all child objects need to have bubbling torn down. This is managed by [bubble.unbind](#bubble-unbind).
// - While bubbling is running, as child items are added, 
//   the child elements need to be setup to bubble.  This is managed by [bubble.add](#bubble-add) and [bubble.addMany](#bubble-addmany).
// - While bubbling is running, as child items are removed, 
//   the child elements need to stop bubbling. This is managed by 
//   [bubble.remove](#bubble-remove) and [bubble.removeMany](#bubble-removeMany).
// - While bubbling is running, as child item replaces another child, the old child needs bubbling removed
//   and the new child needs bubbling setup. This is managed by [bubble.set](bubble-set).
// 
// [bubble.events](bubble-events) controls which events setup bubbling.
steal('can/util', function(can){

	var bubble = can.bubble = {
			// ## bubble.bind
			// Called when an event is bound to an object. This 
			// should setup bubbling if this is the first time 
			// an event that bubbles is bound.
			bind: function(parent, eventName) {
				if (!parent.__inSetup ) {
					
					var bubbleEvents = bubble.events(parent, eventName),
						len = bubbleEvents.length,
						bubbleEvent;

					if(!parent._bubbleBindings) {
						parent._bubbleBindings = {};
					}

					for (var i = 0; i < len; i++) {
						bubbleEvent = bubbleEvents[i];
						
						// If there isn't a bubbling setup for this binding, 
						// bubble all the children; otherwise, increment the
						// number of bubble bindings.
						if (!parent._bubbleBindings[bubbleEvent]) {
							parent._bubbleBindings[bubbleEvent] = 1;
							bubble.childrenOf(parent, bubbleEvent);
						} else {
							parent._bubbleBindings[bubbleEvent]++;
						}
					}
				}
			},
			
			// ## bubble.unbind
			// Called when an event is unbound from an object.  This should
			// teardown bubbling if there are no more bubbling event handlers.
			unbind: function(parent, eventName) {
				var bubbleEvents = bubble.events(parent, eventName),
					len = bubbleEvents.length,
					bubbleEvent;

				for (var i = 0; i < len; i++) {
					bubbleEvent = bubbleEvents[i];

					if (parent._bubbleBindings ) {
						parent._bubbleBindings[bubbleEvent]--;
					}

					if (parent._bubbleBindings && !parent._bubbleBindings[bubbleEvent] ) {
						delete parent._bubbleBindings[bubbleEvent];
						bubble.teardownChildrenFrom(parent, bubbleEvent);
						if(can.isEmptyObject(parent._bubbleBindings)) {
							delete parent._bubbleBindings;
						}
					}
				}
			},
			
			// ## bubble.add
			// Called when a new `child` value has been added to `parent`.
			// If the `parent` is bubbling and the child is observable,
			// setup bubbling on the child to the parent. This calls
			// `teardownFromParent` to ensure we aren't bubbling the same
			// child more than once.
			add: function(parent, child, prop){
				if(child instanceof can.Map && parent._bubbleBindings) {
					for(var eventName in parent._bubbleBindings) {
						if( parent._bubbleBindings[eventName] ) {
							bubble.teardownFromParent(parent, child, eventName);
							bubble.toParent(child, parent, prop, eventName);
						}
					}
				}
			},
			// ## bubble.addMany 
			// Called when many `children` are added to `parent`.
			addMany: function(parent, children){
				for (var i = 0, len = children.length; i < len; i++) {
					bubble.add(parent, children[i], i);
				}
			},
			// ## bubble.remove
			// Called when a `child` has been removed from `parent`.
			// Removes all bubbling events from `child` to `parent`.
			remove: function(parent, child){
				if(child instanceof can.Map && parent._bubbleBindings) {
					for(var eventName in parent._bubbleBindings) {
						if( parent._bubbleBindings[eventName] ) {
							bubble.teardownFromParent(parent, child, eventName);
						}
					}
				}
			},
			// ## bubble.removeMany
			// Called when many `children` are removed from `parent`.
			removeMany: function(parent, children){
				for(var i = 0, len = children.length; i < len; i++) {
					bubble.remove(parent, children[i]);
				}
			},
			// ## bubble.set
			// Called when a new child `value` replaces `current` value.
			set: function(parent, prop, value, current){

				if( can.isMapLike(value) ) {
					bubble.add(parent, value, prop);
				}
				// bubble.add will remove, so only remove if we are replacing another object
				if( can.isMapLike(current) ) {
					bubble.remove(parent, current);
				}
				return value;
			},
			
			// ## bubble.events
			// For an event binding on an object, returns the events that should be bubbled.  
			// For example, `"change" -> ["change"]`.
			events: function(map, boundEventName) {
				return map.constructor._bubbleRule(boundEventName, map);
			},
			
			
			// ## bubble.toParent
			// Forwards an event on `child` to `parent`.  `child` is
			// the `prop` property of `parent`.
			toParent: function(child, parent, prop, eventName) {
				can.listenTo.call(parent, child, eventName, function ( /* ev, attr */ ) {

					var args = can.makeArray(arguments),
						ev = args.shift();

					// Updates the nested property name that will be dispatched.   
					// If the parent is a list, the index of the child needs to 
					// be calculated every time.
					args[0] =
						(can.List && parent instanceof can.List ?
							parent.indexOf(child) :
							prop ) + (args[0] ? "."+args[0] : "");

					// Track all objects that we have bubbled this event to.
					// If we have already bubbled to this object, do not dispatch another
					// event on it. This prevents cycles.
					ev.triggeredNS = ev.triggeredNS || {};
					if (ev.triggeredNS[parent._cid]) {
						return;
					}
					ev.triggeredNS[parent._cid] = true;
					
					// Send bubbled event to parent.
					can.trigger(parent, ev, args);
					
					// Trigger named event.
					if(eventName === "change") {
						can.trigger(parent, args[0], [args[2], args[3]]);
					}
					
				});
			},
			
			// ## bubble.childrenOf
			// Bubbles all the children of `parent`.
			childrenOf: function (parent, eventName) {

				parent._each(function (child, prop) {
					if (child && child.bind) {
						bubble.toParent(child, parent, prop, eventName);
					}
				});
			},
			
			// ## bubble.teardownFromParent
			// Undo the bubbling from `child` to `parent`.
			teardownFromParent: function (parent, child, eventName ) {
				if(child && child.unbind ) {
					can.stopListening.call(parent, child, eventName);
				}
			},
			
			// ## bubble.teardownChildrenFrom
			// Undo the bubbling of every child of `parent`
			teardownChildrenFrom: function(parent, eventName){
				parent._each(function (child) {

					bubble.teardownFromParent(parent, child, eventName);
				});
			},
			
			// ## bubble.isBubbling
			// Returns true or false if `parent` is bubbling `eventName`.
			isBubbling: function(parent, eventName){
				return parent._bubbleBindings && parent._bubbleBindings[eventName];
			}
		};

	return bubble;

});
