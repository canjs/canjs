'use strict';

var getCurrentDocument = require("can-globals/document/document");
var isBrowserWindow = require("can-globals/is-browser-window/is-browser-window");

function getTargetDocument (target) {
	return target.ownerDocument || getCurrentDocument();
}

function createEvent (target, eventData, bubbles, cancelable) {
	var doc = getTargetDocument(target);
	var event = doc.createEvent('HTMLEvents');
	var eventType;
	if (typeof eventData === 'string') {
		eventType = eventData;
	} else {
		eventType = eventData.type;
		for (var prop in eventData) {
			if (event[prop] === undefined) {
				event[prop] = eventData[prop];
			}
		}
	}
	if (bubbles === undefined) {
		bubbles = true;
	}
	event.initEvent(eventType, bubbles, cancelable);
	return event;
}

// We do not account for all EventTarget classes,
// only EventTarget DOM nodes, fragments, and the window.
function isDomEventTarget (obj) {
	if (!(obj && obj.nodeName)) {
		return obj === window;
	}
	var nodeType = obj.nodeType;
	return (
		nodeType === 1 || // Node.ELEMENT_NODE
		nodeType === 9 || // Node.DOCUMENT_NODE
		nodeType === 11 // Node.DOCUMENT_FRAGMENT_NODE
	);
}

function addDomContext (context, args) {
	if (isDomEventTarget(context)) {
		args = Array.prototype.slice.call(args, 0);
		args.unshift(context);
	}
	return args;
}

function removeDomContext (context, args) {
	if (!isDomEventTarget(context)) {
		args = Array.prototype.slice.call(args, 0);
		context = args.shift();
	}
	return {
		context: context,
		args: args
	};
}

var fixSyntheticEventsOnDisabled = false;
// In FireFox, dispatching a synthetic event on a disabled element throws an error.
// Other browsers, like IE 10 do not dispatch synthetic events on disabled elements at all.
// This determines if we have to work around that when dispatching events.
// https://bugzilla.mozilla.org/show_bug.cgi?id=329509
(function() {
	if(!isBrowserWindow()) {
		return;
	}

	var testEventName = 'fix_synthetic_events_on_disabled_test';
	var input = document.createElement("input");
	input.disabled = true;
	var timer = setTimeout(function() {
		fixSyntheticEventsOnDisabled = true;
	}, 50);
	var onTest = function onTest (){
		clearTimeout(timer);
		input.removeEventListener(testEventName, onTest);
	};
	input.addEventListener(testEventName, onTest);
	try {
		var event = document.create('HTMLEvents');
		event.initEvent(testEventName, false);
		input.dispatchEvent(event);
	} catch(e) {
		onTest();
		fixSyntheticEventsOnDisabled = true;
	}
})();

function isDispatchingOnDisabled(element, event) {
	var eventType = event.type;
	var isInsertedOrRemoved = eventType === 'inserted' || eventType === 'removed';
	var isDisabled = !!element.disabled;
	return isInsertedOrRemoved && isDisabled;
}

function forceEnabledForDispatch (element, event) {
	return fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(element, event);
}

module.exports = {
	createEvent: createEvent,
	addDomContext: addDomContext,
	removeDomContext: removeDomContext,
	isDomEventTarget: isDomEventTarget,
	getTargetDocument: getTargetDocument,
	forceEnabledForDispatch: forceEnabledForDispatch
};
