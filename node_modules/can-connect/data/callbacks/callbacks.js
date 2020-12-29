"use strict";
/**
 * @module can-connect/data/callbacks/callbacks data/callbacks
 * @parent can-connect.behaviors
 *
 * Extend [can-connect/DataInterface] methods to call callbacks with the raw response data.
 *
 * @signature `dataCallbacks( baseConnection )`
 *
 * Extends the [can-connect/DataInterface] create, update, read & delete methods to call 'callback' methods following
 * their execution. Callbacks are called with the data returned from the underlying behavior's [can-connect/DataInterface]
 * implementation.
 *
 * For example:
 * ```
 * var dataUrl = require("can-connect/data/url/");
 * var dataCallbacks = require("can-connect/data/url");
 * var logging = {
 *   createdData: function(responseData) {
 *     console.log('New Todo Saved: ', responseData);
 *     return responseData;
 *   }
 * };
 * var todoConnection = connect([dataUrl, dataCallbacks, logging}],  {
 *   url: '/todos'
 * });
 *
 * // create a new todo
 * todoConnection.createData({name: "do the dishes", completed: false}).then(function(responseData) {
 *   responseData; // {id: 5}
 * });
 *
 * // after create request is completed, following is logged by the "logging" createdData callback:
 * // > New Todo Saved: {id: 5}
 * ```
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `data/callbacks` behavior added
 * on to it. Should already contain a behavior that provides the DataInterface (e.g [can-connect/data/url/url]). If
 * the `connect` helper is used to build the connection, the behaviors will automatically be ordered as required.
 *
 * @return {{}} a `can-connect` connection containing the method implementations provided by `data/callbacks`.
 */
var connect = require("../../can-connect");
var each = require("can-reflect").each;

// wires up the following methods
var pairs = {
	/**
	 * @function can-connect/data/callbacks/callbacks.getListData getListData
	 * @parent can-connect/data/callbacks/callbacks
	 *
	 * Call `gotListData` with the data returned from underlying behavior's implementation of
	 * [can-connect/connection.gotListData].
	 *
	 * @signature `getListData(listQuery)`
	 *
	 *   Extends the underlying behavior's [can-connect/connection.getListData] to call `gotListData` with the returned
	 *   response data. The result of the call to `gotListData` will be used as the new response data.
	 *
	 *   @param {Object} listQuery an object that represents the set of data to be loaded
	 *   @return {Promise<Object>} `Promise` resolving the raw response data, possibly modified by `gotListData`.
	 */
	getListData: "gotListData",

	/**
	 * @function can-connect/data/callbacks/callbacks.createData createData
	 * @parent can-connect/data/callbacks/callbacks
	 *
	 * Call `createdData` with the data returned from underlying behavior's implementation of
	 * [can-connect/connection.createData].
	 *
	 * @signature `createData(instanceData, cid)`
	 *
	 *   Extends the underlying behavior's [can-connect/connection.createData] to call `createdData` with the returned
	 *   response data. The result of the call to `createdData` will be used as the new response data.
	 *
	 *   @param {Object} instanceData the raw data of an instance
	 *   @param {Number} cid unique id that represents the instance that is being created
	 *   @return {Promise<Object>} `Promise` resolving the raw response data, possibly modified by `createdData`.
	 */
	createData: "createdData",

	/**
	 * @function can-connect/data/callbacks/callbacks.updateData updatedData
	 * @parent can-connect/data/callbacks/callbacks
	 *
	 * Call `updatedData` with the data returned from underlying behavior's implementation of
	 * [can-connect/connection.updateData].
	 *
	 * @signature `updateData(instanceData)`
	 *
	 *   Extends the underlying behavior's [can-connect/connection.updateData] to call `updatedData` with the returned
	 *   response data. The result of the call to `updatedData` will be used as the new response data.
	 *
	 *   @param {Object} instanceData the raw data of an instance
	 *   @return {Promise<Object>} `Promise` resolving the raw response data, possibly modified by `updatedData`.
	 */
	updateData: "updatedData",

	/**
	 * @function can-connect/data/callbacks/callbacks.destroyData destroyData
	 * @parent can-connect/data/callbacks/callbacks
	 *
	 * Call `destroyedData` with the data returned from underlying behavior's implementation of
	 * [can-connect/connection.destroyData].
	 *
	 * @signature `destroyData(params, cid)`
	 *
	 *   Extends the underlying behavior's [can-connect/connection.destroyData] to call `destroyedData` with the returned
	 *   response data. The result of the call to `destroyedData` will be used as the new response data.
	 *
	 *   @param {Object} instanceData the raw data of an instance
	 *   @return {Promise<Object>} `Promise` resolving the raw response data, possibly modified by `destroyedData`.
	 */
	destroyData: "destroyedData"
};

var dataCallbackBehavior = connect.behavior("data/callbacks",function(baseConnection){

	var behavior = {
	};

	// overwrites createData to createdData
	each(pairs, function(callbackName, name){

		behavior[name] = function(params, cid){
			var self = this;

			return baseConnection[name].call(this, params).then(function(data){
				if(self[callbackName]) {
					return self[callbackName].call(self,data, params, cid );
				} else {
					return data;
				}
			});
		};

	});
	return behavior;
});

module.exports = dataCallbackBehavior;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");
	module.exports = validate(dataCallbackBehavior, [
		"getListData", "createData", "updateData", "destroyData"
	]);
}
//!steal-remove-end
