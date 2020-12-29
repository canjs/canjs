"use strict";
var dev = require("can-log/dev/dev");
var namespace = require("can-namespace");

// add methods to can
var Validate = {

	/*
	* The current validator ID to use when can.validate methods are called.
	*/
	_validatorId: '',

	/*
	* A map of validator libraries loaded into can.validate.
	*/
	_validators: {},

	/**
	* Registers a library with can.validate. The last one registered is the default library.
	* Override the default by changing `_validatorId` to the key of the desired registered library.
	* ```js
	* Validate.register('validatejs',validatejs);
	* ```
	* @param {string} id The key name of the validator library.
	* @param {object|function} validator The validator libarary. Only pass instances.
	* @hide
	*/
	validator: function () {
		return this._validators[this._validatorId];
	},

	/**
	* Registers a library with can.validate. The last one registered is the default library.
	* Override the default by changing `_validatorId` to the key of the desired registered library.
	* ```js
	* Validate.register('validatejs',validatejs);
	* ```
	* @param {string} id The key name of the validator library.
	* @param {object|function} validator The validator libarary. Only pass instances.
	* @hide
	*/
	register: function (id, validator) {
		this._validatorId = id;
		this._validators[id] = validator;
	},

	/**
	* Registers a library with can.validate. The last one registered is the default library.
	* Override the default by changing `_validatorId` to the key of the desired registered library.
	* ```js
	* Validate.isValid('', {}, 'myVal');
	* ```
	* @param {*} value A value of any type to validate.
	* @param {object} options Validation config object, structure depends on the
	*  validation library used.
	* @param {string} name Optional. The key name of the value.
	* @hide
	*/
	isValid: function () {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (!this._validatorId) {
				dev.warn('A validator library is required for can.validate to work properly.');
			}
		}
		//!steal-remove-end
		return this.validator().isValid.apply(this, arguments);
	},

	/**
	* Registers a library with can.validate. The last one registered is the default library.
	* Override the default by changing `_validatorId` to the key of the desired registered library.
	* ```js
	* Validate.once('', {}, 'myVal');
	* ```
	* @param {*} value A value of any type to validate.
	* @param {object} options Validation config object, structure depends on the
	*  validation library used.
	* @param {string} name Optional. The key name of the value.
	* @hide
	*/
	once: function () {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (!this._validatorId) {
				dev.warn('A validator library is required for can.validate to work properly.');
			}
		}
		//!steal-remove-end
		return this.validator().once.apply(this, arguments);
	},

	/**
	* ```js
	* Validate.validate({},{});
	* ```
	* @param {object} values A map of the different objects to validate.
	* @param {object} options Validation config object, structure depends on the
	*  validation library used.
	* @hide
	*/
	validate: function () {
		var validateArgs = arguments;
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (!this._validatorId) {
				dev.warn('A validator library is required for can.validate to work properly.');
			}
			if (typeof arguments[0] !== 'object') {
				dev.warn('Attempting to pass single value to validate, use can.validator.once instead.');
			}
		}
		//!steal-remove-end
		return this.validator().validate.apply(this, validateArgs);
	}
};

namespace.validate = Validate;

module.exports = Validate;
