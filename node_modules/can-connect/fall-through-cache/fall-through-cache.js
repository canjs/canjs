"use strict";
/**
 * @module can-connect/fall-through-cache/fall-through-cache fall-through-cache
 * @parent can-connect.behaviors
 * @group can-connect/fall-through-cache/fall-through-cache.data data callbacks
 * @group can-connect/fall-through-cache/fall-through-cache.hydrators hydrators
 *
 * Add fall-through caching with the `cacheConnection`.
 *
 * @signature `fallThroughCache( baseConnection )`
 *
 *   Implements a `getData` and `getListData` that
 *   check their [can-connect/base/base.cacheConnection] for data. If there is data,
 *   this data will be immediately returned.
 *   In the background, the `baseConnection` method will be called and used to update the instance or list.
 *
 * @body
 *
 * ## Use
 *
 * To use the `fall-through-cache`, create a connection with a
 * [can-connect/base/base.cacheConnection] and a behavior that implements
 * [can-connect/connection.getData] and [can-connect/connection.getListData].
 *
 * ```js
 * var QueryLogic = require("can-query-logic");
 *
 * var queryLogic = new QueryLogic();
 *
 * var cache = connect([
 *   require("can-local-store")
 * ],{
 *   name: "todos",
 *   queryLogic: queryLogic
 * });
 *
 * var todoConnection = connect([
 *    require("can-connect/fall-through-cache/fall-through-cache"),
 *    require("can-connect/data/url/url"),
 *    require("can-connect/constructor/constructor"),
 *    require("can-connect/constructor/store/store")
 *   ], {
 *   url: "/todos",
 *   cacheConnection: cache,
 *   queryLogic: queryLogic
 * });
 * ```
 *
 * Then, make requests.  If the cache has the data,
 * it will be returned immediately, and then the item or list updated later
 * with the response from the base connection:
 *
 * ```js
 * todoConnection.getList({due: "today"}).then(function(todos){
 *
 * })
 * ```
 *
 * ## Demo
 *
 * The following shows the `fall-through-cache` behavior.
 *
 * @demo demos/can-connect/fall-through-cache.html
 *
 * Clicking
 * "Completed" or "Incomplete" will make one of the following requests and
 * display the results in the page:
 *
 * ```
 * todoConnection.getList({completed: true});
 * todoConnection.getList({completed: false});
 * ```
 *
 * If you click back and forth between "Completed" and "Incomplete" multiple times
 * you'll notice that the old data is displayed immediately and then
 * updated after about a second.
 *
 */
var connect = require("../can-connect");
var sortedSetJSON = require("../helpers/sorted-set-json");
var canLog = require("can-log");

var fallThroughCache = connect.behavior("fall-through-cache",function(baseConnection){

	var behavior = {
		/**
		 * @function can-connect/fall-through-cache/fall-through-cache.hydrateList hydrateList
		 * @parent can-connect/fall-through-cache/fall-through-cache.hydrators
		 *
		 * Returns a List instance given raw data.
		 *
		 * @signature `connection.hydrateList(listData, set)`
		 *
		 *   Calls the base `hydrateList` to create a List for `listData`.
		 *
		 *   Then, Looks for registered hydrateList callbacks for a given `set` and
		 *   calls them.
		 *
		 *   @param {can-connect.listData} listData
		 *   @param {can-query-logic/query} query
		 *   @return {can-connect.List}
		 */
		hydrateList: function(listData, set){
			set = set || this.listQuery(listData);
			var id = sortedSetJSON( set );
			var list = baseConnection.hydrateList.call(this, listData, set);

			if(this._getHydrateListCallbacks[id]) {
				this._getHydrateListCallbacks[id].shift()(list);
				if(!this._getHydrateListCallbacks[id].length){
					delete this._getHydrateListCallbacks[id];
				}
			}
			return list;
		},
		_getHydrateListCallbacks: {},
		_getHydrateList: function(set, callback){
			var id = sortedSetJSON( set );
			if(!this._getHydrateListCallbacks[id]) {
				this._getHydrateListCallbacks[id]= [];
			}
			this._getHydrateListCallbacks[id].push(callback);
		},
		/**
		 * @function can-connect/fall-through-cache/fall-through-cache.getListData getListData
		 * @parent can-connect/fall-through-cache/fall-through-cache.data
		 *
		 * Get raw data from the cache if available, and then update
		 * the list later with data from the base connection.
		 *
		 * @signature `connection.getListData(set)`
		 *
		 *   Checks the [can-connect/base/base.cacheConnection] for `set`'s data.
		 *
		 *   If the cache connection has data, the cached data is returned. Prior to
		 *   returning the data, the [can-connect/constructor.hydrateList] method
		 *   is intercepted so we can get a handle on the list that's being created
		 *   for the returned data. Once the intercepted list is retrieved,
		 *   we use the base connection to get data and update the intercepted list and
		 *   the cacheConnection.
		 *
		 *   If the cache connection does not have data, the base connection
		 *   is used to load the data and the cached connection is updated with that
		 *   data.
		 *
		 *   @param {can-query-logic/query} query The set to load.
		 *
		 *   @return {Promise<can-connect.listData>} A promise that returns the
		 *   raw data.
		 */
		// if we do getList, the cacheConnection runs on
		// if we do getListData, ... we need to register the list that is going to be created
		// so that when the data is returned, it updates this
		getListData: function(set){
			set = set || {};
			var self = this;
			return this.cacheConnection.getListData(set).then(function(data){

				// get the list that is going to be made
				// it might be possible that this never gets called, but not right now
				self._getHydrateList(set, function(list){
					self.addListReference(list, set);

					setTimeout(function(){
						baseConnection.getListData.call(self, set).then(function(listData){

							self.cacheConnection.updateListData(listData, set);
							self.updatedList(list, listData, set);
							self.deleteListReference(list, set);

						}, function(e){
							// what do we do here?  self.rejectedUpdatedList ?
							canLog.log("REJECTED", e);
						});
					},1);
				});
				// TODO: if we wired up all responses to updateListData, this one should not
				// updateListData with itself.
				// But, how would we do a bypass?
				return data;
			}, function(){

				var listData = baseConnection.getListData.call(self, set);
				listData.then(function(listData){

					self.cacheConnection.updateListData(listData, set);
				});

				return listData;
			});
		},
		/**
		 * @function can-connect/fall-through-cache/fall-through-cache.hydrateInstance hydrateInstance
		 * @parent can-connect/fall-through-cache/fall-through-cache.hydrators
		 *
		 * Returns an instance given raw data.
		 *
		 * @signature `connection.hydrateInstance(props)`
		 *
		 *   Calls the base `hydrateInstance` to create an Instance for `props`.
		 *
		 *   Then, Looks for registered hydrateInstance callbacks for a given [can-connect/base/base.id] and
		 *   calls them.
		 *
		 *   @param {Object} props
		 *   @return {can-connect/Instance}
		 */
		hydrateInstance: function(props){

			var id = this.id( props );
			var instance = baseConnection.hydrateInstance.apply(this, arguments);

			if(this._getMakeInstanceCallbacks[id]) {
				this._getMakeInstanceCallbacks[id].shift()(instance);
				if(!this._getMakeInstanceCallbacks[id].length){
					delete this._getMakeInstanceCallbacks[id];
				}
			}
			return instance;
		},
		_getMakeInstanceCallbacks: {},
		_getMakeInstance: function(id, callback){
			if(!this._getMakeInstanceCallbacks[id]) {
				this._getMakeInstanceCallbacks[id]= [];
			}
			this._getMakeInstanceCallbacks[id].push(callback);
		},
		/**
		 * @function can-connect/fall-through-cache/fall-through-cache.getData getData
		 * @parent can-connect/fall-through-cache/fall-through-cache.data
		 *
		 * Get raw data from the cache if available, and then update
		 * the instance later with data from the base connection.
		 *
		 * @signature `connection.getData(params)`
		 *
		 *   Checks the [can-connect/base/base.cacheConnection] for `params`'s data.
		 *
		 *   If the cache connection has data, the cached data is returned. Prior to
		 *   returning the data, the [can-connect/constructor/constructor.hydrateInstance] method
		 *   is intercepted so we can get a handle on the instance that's being created
		 *   for the returned data. Once the intercepted instance is retrieved,
		 *   we use the base connection to get data and update the intercepted instance and
		 *   the cacheConnection.
		 *
		 *   If the cache connection does not have data, the base connection
		 *   is used to load the data and the cached connection is updated with that
		 *   data.
		 *
		 *   @param {Object} params The set to load.
		 *
		 *   @return {Promise<Object>} A promise that returns the
		 *   raw data.
		 */
		getData: function(params){
			// first, always check the cache connection
			var self = this;
			return this.cacheConnection.getData(params).then(function(instanceData){

				// get the list that is going to be made
				// it might be possible that this never gets called, but not right now
				self._getMakeInstance(self.id(instanceData) || self.id(params), function(instance){
					self.addInstanceReference(instance);

					setTimeout(function(){
						baseConnection.getData.call(self, params).then(function(instanceData2){

							self.cacheConnection.updateData(instanceData2);
							self.updatedInstance(instance, instanceData2);
							self.deleteInstanceReference(instance);

						}, function(e){
							// what do we do here?  self.rejectedUpdatedList ?
							canLog.log("REJECTED", e);
						});
					},1);
				});

				return instanceData;
			}, function(){
				var listData = baseConnection.getData.call(self, params);
				listData.then(function(instanceData){
					self.cacheConnection.updateData(instanceData);
				});

				return listData;
			});
		}

	};

	return behavior;

});

module.exports = fallThroughCache;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../helpers/validate");
	module.exports = validate(fallThroughCache, ['hydrateList', 'hydrateInstance', 'getListData', 'getData']);
}
//!steal-remove-end
