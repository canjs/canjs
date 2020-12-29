"use strict";
// return wrapped can-connect behavior mixin that validates interface of the input behavior being extended
// deprecate this and use can-validate-interface decorator once available

var makeInterfaceValidator = require('can-validate-interface');

module.exports = function(extendingBehavior, interfaces){
	var validatedBehaviour = validateArgumentInterface(extendingBehavior, 0, interfaces, function(errors, baseBehavior) {
		throw new BehaviorInterfaceError(baseBehavior, extendingBehavior, errors);
	});

	// copy properties on behavior to validator wrapped behavior
	Object.keys(extendingBehavior).forEach(function (k) {
		validatedBehaviour[k] = extendingBehavior[k];
	});
	// add interfaces for building behavior ordering
	validatedBehaviour.__interfaces = interfaces;

	return validatedBehaviour;
};

function validateArgumentInterface(func, argIndex, interfaces, errorHandler) {
	return function() {
		var errors = makeInterfaceValidator(interfaces)(arguments[argIndex]);
		if (errors && errorHandler) {
			errorHandler(errors, arguments[argIndex]);
		}

		return func.apply(this, arguments);
	};
}


// change to 'BehaviourInterfaceError extends Error' once we drop support for pre-ES2015
function BehaviorInterfaceError(baseBehavior, extendingBehavior, missingProps) {
	var extendingName = extendingBehavior.behaviorName || 'anonymous behavior',
		baseName = baseBehavior.__behaviorName || 'anonymous behavior',
		message = 'can-connect: Extending behavior "' + extendingName + '" found base behavior "' + baseName + '" was missing required properties: ' + JSON.stringify(missingProps.related),
		instance = new Error(message);

	if (Object.setPrototypeOf){
		Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
	}
	return instance;
}
BehaviorInterfaceError.prototype = Object.create(Error.prototype, {
	constructor: {value: Error}
});
if (Object.setPrototypeOf){
	Object.setPrototypeOf(BehaviorInterfaceError, Error);
} else {
	/* jshint proto: true */
	BehaviorInterfaceError.__proto__ = Error;
}
