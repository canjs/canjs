'use strict';
/*
	This module makes can-dom-events work
	as a Vue directive.

	Example usage:

	`js Vue.directive('dom', makeVueDirective(canDomEvents))
	`vue <span v-dom:radiochange="update()"></span>  
*/

function getBindingEventType (binding) {
	var eventType = binding.arg;
	if (typeof eventType !== 'string') {
		throw new Error('Directive arg must be an eventType string');
	}
	return eventType;
}

function getBindingHandler (binding) {
	return binding.value;
}

module.exports = function (domEvents) {
	return {
		bind: function (target, binding) {
			var eventType = getBindingEventType(binding);
			var handler = getBindingHandler(binding);
			domEvents.addEventListener(target, eventType, handler);
		},
		unbind: function (target, binding) {
			var eventType = getBindingEventType(binding);
			var handler = getBindingHandler(binding);
			domEvents.removeEventListener(target, eventType, handler);
		}
	};
};
