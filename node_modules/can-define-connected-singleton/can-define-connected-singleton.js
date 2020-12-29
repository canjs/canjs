'use strict';


var reflect = require('can-reflect');
var DefineMap = require('can-define/map/map');
var ObservationRecorder = require('can-observation-recorder');
var zoneStorage = require('./util/zone-storage');
var helpers = require('./util/helpers');

var defaults = {
	storagePrefix: 'can-define-connected-singleton',
	currentPropertyName: 'current',
	savingPropertyName: 'saving',
	fetchMethodName: 'get',
	createMethodName: 'save',
	destroyMethodName: 'destroy',
};

function isDefineMapConstructor(Obj) {
	return Obj && (Obj.prototype instanceof DefineMap);
}

// wrap the createMethod so it updates .current, .currentPromise & .saving during the course of a singleton model being persisted
function wrapCreateMethod(Ctor, options) {
	var baseCreate = Ctor.prototype[options.createMethodName];

	Ctor.prototype[options.createMethodName] = function wrappedCreate() {
		var ret = baseCreate.apply(this, arguments);

		// set Ctor.saving & Ctor.currentPromise
		zoneStorage.setItem(options.storageKeys.savingProperty, this);
		Ctor.dispatch(options.savingPropertyName, [this]);
		zoneStorage.setItem(options.storageKeys.currentPropertyPromise, ret);
		Ctor.dispatch(options.currentPropertyPromiseName, [ret]);

		ret.then(
			(instance) => {
				// clear Ctor.saving, set Ctor.current
				zoneStorage.setItem(options.storageKeys.savingProperty, undefined);
				Ctor.dispatch(options.savingPropertyName, [undefined]);
				zoneStorage.setItem(options.storageKeys.currentProperty, instance);
				Ctor.dispatch(options.currentPropertyName, [instance]);
			},
			() => {
				// clear saving
				zoneStorage.setItem(options.storageKeys.savingProperty, undefined);
				Ctor.dispatch(options.savingPropertyName, [undefined]);
			}
		);

		return ret;
	};
}

// wrap the destroyMethod so it updates .current & .currentPromise during the course of a singleton model being removed from persistence
function wrapDestroyMethod(Ctor, options) {
	var baseDestroy = Ctor.prototype[options.destroyMethodName];

	Ctor.prototype[options.destroyMethodName] = function wrappedDestroy() {
		var ret = baseDestroy.apply(this, arguments);

		// return modified promise to ensure that storedPromise check runs before consumer of returned promise
		return ret.then((value) => {
			// clear current, reject currentPromise
			zoneStorage.setItem(options.storageKeys.currentProperty, undefined);
			Ctor.dispatch(options.currentPropertyName, [undefined]);

			// avoid setting promise a second time if can/session behavior callback handler has already set it to a rejected promise
			const storedPromise = zoneStorage.getItem(options.storageKeys.currentPropertyPromise);
			storedPromise.then(
				() => {
					var promise = Promise.reject(undefined);
					zoneStorage.setItem(options.storageKeys.currentPropertyPromise, promise);
					Ctor.dispatch(options.currentPropertyPromiseName, [promise]);
				},
				() => {} // promise is already rejected by can/session destroyedInstance callback
			);

			return value;
		});
	};
}

function checkForExistingKeys(options) {
	if (zoneStorage.getItem(options.storageKeys.currentProperty) ||
		zoneStorage.getItem(options.storageKeys.currentPropertyPromise) ||
		zoneStorage.getItem(options.storageKeys.savingProperty)) {
		console.warn('can-define-connected-singleton: Removing existing values from zone storage. You are likely configuring a singleton twice.');
		zoneStorage.removeItem(options.storageKeys.currentProperty);
		zoneStorage.removeItem(options.storageKeys.currentPropertyPromise);
		zoneStorage.removeItem(options.storageKeys.savingProperty);
	}
}

// get stored current & promise values, initializing them if they're not yet set
function getCurrentAndPromise(Ctor, options) {
	var current = zoneStorage.getItem(options.storageKeys.currentProperty);
	var promise = zoneStorage.getItem(options.storageKeys.currentPropertyPromise);

	if (promise == null) {
		promise = Ctor[options.fetchMethodName]();
		zoneStorage.setItem(options.storageKeys.currentPropertyPromise, promise);
		Ctor.dispatch(options.currentPropertyPromiseName, [promise]);

		promise.then(function (value) {
			zoneStorage.setItem(options.storageKeys.currentProperty, value);
			Ctor.dispatch(options.currentPropertyName, [value]);
		})
		.catch(function () {
			zoneStorage.setItem(options.storageKeys.currentProperty, null);
			Ctor.dispatch(options.currentPropertyName, [null]);
		});
	}

	return {
		current: current,
		promise: promise
	};
}


function makeSingleton(Ctor, input_options){
	var helpURL = 'https://canjs.com/doc/can-define-connected-singleton';

	if(!isDefineMapConstructor(Ctor)) {
		throw new Error('The singleton decorator/mixin can only be used for DefineMaps: ' + helpURL);
	}

	var savingPropertyName = input_options.savingPropertyName;
	var currentPropertyName = input_options.currentPropertyName;
	var currentPropertyPromiseName = currentPropertyName + 'Promise';
	var currentPropertyKey = input_options.storagePrefix + '-' + Ctor.name + '-' + currentPropertyName;
	var storageKeys = {
		savingProperty: input_options.storagePrefix + '-' + Ctor.name + '-' + savingPropertyName,
		currentProperty: currentPropertyKey,
		currentPropertyPromise: currentPropertyKey + '-promise'
	};
	var options = Object.assign({}, input_options, {
		currentPropertyPromiseName, storageKeys
	});

	checkForExistingKeys(options);

	Object.defineProperty(Ctor, options.currentPropertyPromiseName, {
		get: function () {
			ObservationRecorder.add(Ctor, options.currentPropertyPromiseName);
			return getCurrentAndPromise(Ctor, options).promise;
		}
	});

	Object.defineProperty(Ctor, options.currentPropertyName, {
		get: function () {
			ObservationRecorder.add(Ctor, options.currentPropertyName);
			return getCurrentAndPromise(Ctor, options).current;
		},
		// The "current" property is not typically set via this setter, typically it will be set by the destroyMethod & createMethod wrappers, and getCurrentAndPromise. This setter is used when a user of this module wishes to force a state.
		set: function(instance) {
			if (!(instance instanceof Ctor) && instance !== undefined) {
				throw new TypeError('Attempted to set singleton to an unexpected type. Expected an instance of the constructor "' + reflect.getName(Ctor) + '"');
			}

			let promise = instance ?
				Promise.resolve(instance) :
				Promise.reject(undefined);

			zoneStorage.setItem(options.storageKeys.currentProperty, instance);
			Ctor.dispatch(options.currentPropertyName, [instance]);
			zoneStorage.setItem(options.storageKeys.currentPropertyPromise, promise);
			Ctor.dispatch(options.currentPropertyPromiseName, [promise]);
		}
	});

	Object.defineProperty(Ctor, options.savingPropertyName, {
		get: function () {
			ObservationRecorder.add(Ctor, options.savingPropertyName);
			return zoneStorage.getItem(options.storageKeys.savingProperty);
		}
	});

	wrapCreateMethod(Ctor, options);
	wrapDestroyMethod(Ctor, options);

	return Ctor;
}

function singleton(Obj) {
	var opts = helpers.assign({}, defaults);

	// @singleton
	if(isDefineMapConstructor(Obj)) {
		return makeSingleton(Obj, opts);
	}

	// @singleton(options)
	return function(Ctor) {
		return makeSingleton(Ctor, helpers.assign(opts, Obj));
	};
}

module.exports = singleton;
