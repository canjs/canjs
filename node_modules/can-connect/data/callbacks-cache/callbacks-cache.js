"use strict";
/**
 * @module can-connect/data/callbacks-cache/callbacks-cache data/callbacks-cache
 * @parent can-connect.behaviors
 *
 * Implements the data interface callbacks to call the [can-connect/base/base.cacheConnection]
 * [can-connect/DataInterface]. These calls keep the [can-connect/base/base.cacheConnection] contents
 * up to date.
 *
 * @signature `dataCallbacksCache( baseConnection )`
 * Implements the data interface callbacks so that a corresponding [can-connect/DataInterface] method is called on the
 * [can-connect/base/base.cacheConnection]. This updates the [can-connect/base/base.cacheConnection] contents whenever
 * data is updated on the primary connection.
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `data/callbacks-cache` behavior added
 * on to it.
 *
 * @return {{}} a `can-connect` connection containing the method implementations provided by `data/callbacks-cache`.
 *
 * ### Example
 * Shows synchronization between primary connection and cacheConnection data when using this behavior:
 * ```
 * import dataUrl from "can-connect/data/url/";
 * import dataCallbacks from "can-connect/data/callbacks/";
 * import cacheCallbacks from "can-connect/data/callbacks-cache/";
 * import memoryCache from "can-connect/data/memory-cache/";
 *
 * var cacheConnection = connect([memoryCache], {});
 * var todoConnection = connect([dataUrl, dataCallback, cacheCallbacks], {
 *   cacheConnection,
 *   url: "/todo"
 * });
 *
 * todoConnection.createData({name:'do the dishes', completed: false}).then(function(data) {
 *   todoConnection.cacheConnection.getData({id: data.id}).then(function(cachedData) {
 *     // data returned from connection and data returned from cache have the same contents
 *     data.id === cachedData.id; // true
 *     data.name === cachedData.name; // true
 *     data.completed === cachedData.completed; // true
 *     data === cachedData; // false, since callbacks-cache creates a copy of the data when adding it to the cache
 *   })
 * });
 * ```
 */
var connect = require("../../can-connect");
var assign = require("can-reflect").assignMap;
var each = require("can-reflect").each;

// wires up the following methods
var pairs = {
	/**
	 * @function can-connect/data/callbacks-cache/callbacks-cache.createdData createdData
	 * @parent can-connect/data/callbacks-cache/callbacks-cache
	 *
	 * Data callback that updates the [can-connect/base/base.cacheConnection cache] when a new data record is created.
	 *
	 * @signature `connection.createdData(responseData, requestData, cid)`
	 *
	 * Calls `createData` on the [can-connect/base/base.cacheConnection] to add a newly created data record to the cache.
	 * Calls and returns the response from any underlying behavior's `createdData` callback.
	 *
	 * @param {{}} responseData the data returned by the data creation request
	 * @param {{}} requestData the data that was passed to the data creation request
	 * @param {Number} cid the unique identifier for this data. Used before data has a [can-connect/base/base.id] added
	 * at creation time.
	 *
	 * @return {{}} the data returned from an underlying behavior's `createdData` callback, if one exists. Otherwise
	 * returns the `responseData`.
	 */
	createdData: "createData",

	/**
	 * @function can-connect/data/callbacks-cache/callbacks-cache.updatedData updatedData
	 * @parent can-connect/data/callbacks-cache/callbacks-cache
	 *
	 * Data callback that updates the [can-connect/base/base.cacheConnection cache] when a data record is modified.
	 *
	 * @signature `connection.updatedData(responseData, requestData)`
	 *
	 * Calls `updateData` on the [can-connect/base/base.cacheConnection] to modify a data record stored in the cache.
	 * Calls and returns the response from any underlying behavior's `updatedData` callback.
	 *
	 * @param {{}} responseData the data returned by the data update request
	 * @param {{}} requestData the data that was passed to the data update request
	 *
	 * @return {{}} the data returned from an underlying behavior's `updatedData` callback, if one exists. Otherwise
	 * returns the `responseData`.
	 */
	updatedData: "updateData",

	/**
	 * @function can-connect/data/callbacks-cache/callbacks-cache.destroyedData destroyedData
	 * @parent can-connect/data/callbacks-cache/callbacks-cache
	 *
	 * Data callback that updates the [can-connect/base/base.cacheConnection cache] when a data record is deleted.
	 *
	 * @signature `connection.destroyedData(responseData, requestData)`
	 *
	 * Calls `destroyData` on the [can-connect/base/base.cacheConnection] to remove a data record stored in the cache.
	 * Calls and returns the response from any underlying behavior's `destroyedData` callback.
	 *
	 * @param {{}} responseData the data returned by the data destroy request
	 * @param {{}} requestData the data that was passed to the data destroy request
	 *
	 * @return {{}} the data returned from an underlying behavior's `destroyedData` callback, if one exists. Otherwise
	 * returns the `responseData`.
	 */
	destroyedData: "destroyData"
};



var callbackCache = connect.behavior("data/callbacks-cache",function(baseConnection){
	var behavior = {};

	each(pairs, function(crudMethod, dataCallback){
		behavior[dataCallback] = function(data, params, cid){

			// update the data in the cache
			this.cacheConnection[crudMethod]( assign(assign({}, params), data) );

			// return underlying dataCallback implementation if one exists or return input data
			if (baseConnection[dataCallback]) {
				return baseConnection[dataCallback].call(this, data, params, cid);
			} else {
				return data;
			}
		};
	});

	return behavior;
});

module.exports = callbackCache;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");
	module.exports = validate(callbackCache, []);
}
//!steal-remove-end
