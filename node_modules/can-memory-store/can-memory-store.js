var canReflect = require("can-reflect");
var namespace = require("can-namespace");

var makeSimpleStore = require("./make-simple-store");


module.exports = namespace.memoryStore = function memoryStore(baseConnection){
    baseConnection.constructor = memoryStore;
    var behavior = Object.create(makeSimpleStore(baseConnection));

    canReflect.assignMap(behavior, {
		clear: function(){
			this._instances = {};
			this._queryData = [];
		},
		_queryData: [],
		updateQueryDataSync: function(queries){
			this._queryData = queries;
		},
		getQueryDataSync: function(){
			return this._queryData;
		},

		_instances: {},
		getRecord: function(id){
			return this._instances[id];
		},
		getAllRecords: function(){
			var records = [];
			for(var id in this._instances) {
				records.push(this._instances[id]);
			}
			return records;
		},
		destroyRecords: function(records) {
			canReflect.eachIndex(records, function(record){
				var id = canReflect.getIdentity(record, this.queryLogic.schema);
				delete this._instances[id];
			}, this);
		},
		updateRecordsSync: function(records){
			records.forEach(function(record){
				var id = canReflect.getIdentity(record, this.queryLogic.schema);
				this._instances[id] = record;
			},this);
		},

		// ## External interface

		/**
		 * @function can-memory-store.getQueries getQueries
		 * @parent can-memory-store.data-methods
		 *
		 * Returns the queries contained within the cache.
		 *
		 * @signature `connection.getQueries()`
		 *
		 *   Returns the queries added by [can-memory-store.updateListData].
		 *
		 *   @return {Promise<Array<can-query-logic/query>>} A promise that resolves to the list of queries.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * ```js
		 * connection.getSets() //-> Promise( [{type: "completed"},{user: 5}] )
		 * ```
		 *
		 */

		/**
		 * @function can-memory-store.clear clear
		 * @parent can-memory-store.data-methods
		 *
		 * Resets the memory store so it contains nothing.
		 *
		 * @signature `connection.clear()`
		 *
		 *   Removes all instances and lists being stored in memory.
		 *
		 *   ```js
		 *   memoryStore({queryLogic: new QueryLogic()});
		 *
		 *   cacheConnection.updateInstance({id: 5, name: "justin"});
		 *
		 *   cacheConnection.getData({id: 5}).then(function(data){
		 *     data //-> {id: 5, name: "justin"}
		 *     cacheConnection.clear();
		 *     cacheConnection.getData({id: 5}).catch(function(err){
		 *       err -> {message: "no data", error: 404}
		 *     });
		 *   });
		 *   ```
		 *
		 */

		/**
		 * @function can-memory-store.getListData getListData
		 * @parent can-memory-store.data-methods
		 *
		 * Gets a list of data from the memory store.
		 *
		 * @signature `connection.getListData(query)`
		 *
		 *   Goes through each query add by [can-memory-store.updateListData]. If
		 *   `query` is a subset, uses [can-connect/base/base.queryLogic] to get the data for the requested `query`.
		 *
		 *   @param {can-query-logic/query} query An object that represents the data to load.
		 *
		 *   @return {Promise<can-connect.listData>} A promise that resolves if `query` is a subset of
		 *   some data added by [can-memory-store.updateListData].  If it is not,
		 *   the promise is rejected.
		 */

		/**
		 * @function can-connect/data/memory-cache.getListDataSync getListDataSync
		 * @parent can-connect/data/memory-cache.data-methods
		 *
		 * Synchronously gets a query of data from the memory cache.
		 *
		 * @signature `connection.getListDataSync(query)`
		 * @hide
		 */


		/**
		 * @function can-memory-store.updateListData updateListData
		 * @parent can-memory-store.data-methods
		 *
		 * Saves a query of data in the cache.
		 *
		 * @signature `connection.updateListData(listData, query)`
		 *
		 *   Tries to merge this query of data with any other saved queries of data. If
		 *   unable to merge this data, saves the query by itself.
		 *
		 *   @param {can-connect.listData} listData The data that belongs to `query`.
		 *   @param {can-query-logic/query} query The query `listData` belongs to.
		 *   @return {Promise} Promise resolves if and when the data has been successfully saved.
		 */


		/**
		 * @function can-memory-store.getData getData
		 * @parent can-memory-store.data-methods
		 *
		 * Get an instance's data from the memory cache.
		 *
		 * @signature `connection.getData(params)`
		 *
		 *   Looks in the instance store for the requested instance.
		 *
		 *   @param {Object} params An object that should have the [conenction.id] of the element
		 *   being retrieved.
		 *
		 *   @return {Promise} A promise that resolves to the item if the memory cache has this item.
		 *   If the memory cache does not have this item, it rejects the promise.
		 */




		/**
		 * @function can-memory-store.createData createData
		 * @parent can-memory-store.data-methods
		 *
		 * Called when an instance is created and should be added to cache.
		 *
		 * @signature `connection.createData(record)`
		 *
		 *   Adds `record` to the stored list of instances. Then, goes
		 *   through every query and adds record the queries it belongs to.
		 */


		/**
		 * @function can-memory-store.updateData updateData
		 * @parent can-memory-store.data-methods
		 *
		 * Called when an instance is updated.
		 *
		 * @signature `connection.updateData(record)`
		 *
		 *   Overwrites the stored instance with the new record. Then, goes
		 *   through every query and adds or removes the instance if it belongs or not.
		 */

		/**
		 * @function can-memory-store.destroyData destroyData
		 * @parent can-memory-store.data-methods
		 *
		 * Called when an instance should be removed from the cache.
		 *
		 * @signature `connection.destroyData(record)`
		 *
		 *   Goes through each query of data and removes any data that matches
		 *   `record`'s [can-connect/base/base.id]. Finally removes this from the instance store.
		 */

	});

	return behavior;

};
