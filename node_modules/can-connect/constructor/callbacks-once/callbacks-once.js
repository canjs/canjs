"use strict";
/**
 * @module {function} can-connect/constructor/callbacks-once/callbacks-once constructor/callbacks-once
 * @parent can-connect.behaviors
 *
 * Prevents duplicate calls to the instance callback methods.
 *
 * @signature `callbacksOnce( baseConnection )`
 *
 *   Prevents duplicate calls to the instance callback methods by tracking the last data the methods were called with.
 *   If called with the same data again, it does not call the base connection's instance callback.
 *
 *   @param {{}} baseConnection `can-connect` connection object that is having the `callbacks-once` behavior added
 *   on to it. Should already contain the behaviors that provide the Instance Callbacks
 *   (e.g [can-connect/constructor/constructor]). If the `connect` helper is used to build the connection, the
 *   behaviors will automatically be ordered as required.
 *
 *   @return {Object} A `can-connect` connection containing the methods provided by `callbacks-once`.
 *
 */
var connect = require("../../can-connect");
var sortedSetJSON = require("../../helpers/sorted-set-json");
var forEach = [].forEach;

// wires up the following methods
var callbacks = [
	/**
	 * @function can-connect/constructor/callbacks-once/callbacks-once.createdInstance createdInstance
	 * @parent can-connect/constructor/callbacks-once/callbacks-once
	 *
	 * `createdInstance` callback handler that prevents sequential calls with the same arguments.
	 *
	 * @signature `createdInstance(instance, data)`
	 * Called with the instance created by [can-connect/constructor/constructor.save `connection.save`] and the response data of the
	 * underlying request. Prevents sequential calls to the underlying `createdInstance` handlers with the same arguments.
	 *
	 * @param {} instance the instance created by `connection.save`
	 * @param {} data the response data returned during `connection.save`
	 */
	"createdInstance",
	/**
	 * @function can-connect/constructor/callbacks-once/callbacks-once.updatedInstance updatedInstance
	 * @parent can-connect/constructor/callbacks-once/callbacks-once
	 *
	 * `updatedInstance` callback handler that prevents sequential calls with the same arguments.
	 *
	 * @signature `updatedInstance(instance, data)`
	 * Called with the instance updated by [can-connect/constructor/constructor.save`connection.save`] and the response data of the
	 * underlying request. Prevents sequential calls to the underlying `updatedInstance` handlers with the same arguments.
	 *
	 * @param {} instance the instance created by `connection.save`
	 * @param {} data the response data returned during `connection.save`
	 */
	"updatedInstance",
	/**
	 * @function can-connect/constructor/callbacks-once/callbacks-once.destroyedInstance destroyedInstance
	 * @parent can-connect/constructor/callbacks-once/callbacks-once
	 *
	 * `destroyedInstance` callback handler that prevents sequential calls with the same arguments.
	 *
	 * @signature `destroyedInstance(instance, data)`
	 * Called with the instance created by [can-connect/constructor/constructor.destroy `connection.destroy`] and the response data of the
	 * underlying request. Prevents sequential calls to the underlying `destroyedInstance` handlers with the same arguments.
	 *
	 * @param {} instance the instance created by `connection.destroy`
	 * @param {} data the response data returned during `connection.destroy`
	 */
	"destroyedInstance"
];



var callbacksOnceBehavior = connect.behavior("constructor/callbacks-once",function(baseConnection){

	var behavior = {};

	forEach.call(callbacks, function(name){
		behavior[name] = function(instance, data ){

			var lastSerialized = this.getInstanceMetaData(instance, "last-data-" + name);

			var serialize = sortedSetJSON(data);
			if(lastSerialized !== serialize) {
				var result =  baseConnection[name].apply(this, arguments);
				this.addInstanceMetaData(instance, "last-data-" + name, serialize);
				return result;
			}
		};

	});

	return behavior;
});

module.exports = callbacksOnceBehavior;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");
	module.exports = validate(callbacksOnceBehavior, callbacks);
}
//!steal-remove-end
