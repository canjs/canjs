var canReflect = require("can-reflect");
var makeSimpleStore = require("can-memory-store/make-simple-store");
var namespace = require("can-namespace");

module.exports = namespace.localStore = function localStore(baseConnection){
    baseConnection.constructor = localStore;
    var behavior = Object.create(makeSimpleStore(baseConnection));

    canReflect.assignMap(behavior, {
		clear: function(){
			localStorage.removeItem(this.name+"/queries");
			localStorage.removeItem(this.name+"/records");
            this._recordsMap = null;
            return Promise.resolve();
		},
		updateQueryDataSync: function(queries){
			localStorage.setItem(this.name+"/queries", JSON.stringify(queries) );
		},
		getQueryDataSync: function(){
			return JSON.parse( localStorage.getItem(this.name+"/queries") ) || [];
		},

		getRecord: function(id){
			// a little side-effectual mischeif for performance
			if(!this._recordsMap) {
				this.getAllRecords();
			}

			return this._recordsMap[id];
		},
		getAllRecords: function(){
			// this._records is a in memory representation so things can be fast
            // Must turn on `cacheLocalStorageReads` for this to work.
			if(!this.cacheLocalStorageReads || !this._recordsMap) {
				var recordsMap = JSON.parse( localStorage.getItem(this.name+"/records") ) || {};
				this._recordsMap = recordsMap;
			}

			var records = [];
			for(var id in this._recordsMap) {
				records.push(this._recordsMap[id]);
			}
			return records;
		},
		destroyRecords: function(records) {
            if(!this._recordsMap) {
				this.getAllRecords();
			}
			canReflect.eachIndex(records, function(record){
				var id = canReflect.getIdentity(record, this.queryLogic.schema);
				delete this._recordsMap[id];
			}, this);
			localStorage.setItem(this.name+"/records", JSON.stringify(this._recordsMap) );
		},
		updateRecordsSync: function(records){
            if(!this._recordsMap) {
				this.getAllRecords();
			}
			records.forEach(function(record){
				var id = canReflect.getIdentity(record, this.queryLogic.schema);
				this._recordsMap[id] = record;
			},this);
			localStorage.setItem(this.name+"/records", JSON.stringify(this._recordsMap) );
		}
		// ## Identifiers

		/**
		 * @property {String} can-connect/data/localstorage-cache/localstorage-cache.name name
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.identifiers
		 *
		 * Specify a name to use when saving data in localstorage.
		 *
		 * @option {String} This name is used to find and save data in
		 * localstorage. Instances are saved in `{name}/instance/{id}`
		 * and sets are saved in `{name}/set/{set}`.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * ```
		 * var cacheConnection = connect(["data-localstorage-cache"],{
		 *   name: "todos"
		 * });
		 * ```
		 */


		// ## External interface

		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.clear clear
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Resets the memory cache so it contains nothing.
		 *
		 * @signature `connection.clear()`
		 *
		 */



		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.getSets getSets
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Returns the sets contained within the cache.
		 *
		 * @signature `connection.getSets(set)`
		 *
		 *   Returns the sets added by [can-connect/data/localstorage-cache/localstorage-cache.updateListData].
		 *
		 *   @return {Promise<Array<Set>>} A promise that resolves to the list of sets.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * ```
		 * connection.getSets() //-> Promise( [{type: "completed"},{user: 5}] )
		 * ```
		 *
		 */

		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.getListData getListData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Gets a set of data from localstorage.
		 *
		 * @signature `connection.getListData(set)`
		 *
		 *   Goes through each set add by [can-connect/data/memory-cache.updateListData]. If
		 *   `set` is a subset, uses [can-connect/base/base.queryLogic] to get the data for the requested `set`.
		 *
		 *   @param {can-query-logic/query} query An object that represents the data to load.
		 *
		 *   @return {Promise<can-connect.listData>} A promise that resolves if `set` is a subset of
		 *   some data added by [can-connect/data/memory-cache.updateListData].  If it is not,
		 *   the promise is rejected.
		 */

		/**
		 * @function can-connect/data/localstorage-cache.getListDataSync getListDataSync
		 * @parent can-connect/data/localstorage-cache.data-methods
		 *
		 * Synchronously gets a set of data from localstorage.
		 *
		 * @signature `connection.getListDataSync(set)`
		 * @hide
		 */

		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.getData getData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Get an instance's data from localstorage.
		 *
		 * @signature `connection.getData(params)`
		 *
		 *   Looks in localstorage for the requested instance.
		 *
		 *   @param {Object} params An object that should have the [conenction.id] of the element
		 *   being retrieved.
		 *
		 *   @return {Promise} A promise that resolves to the item if the memory cache has this item.
		 *   If localstorage does not have this item, it rejects the promise.
		 */


		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.updateListData updateListData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Saves a set of data in the cache.
		 *
		 * @signature `connection.updateListData(listData, set)`
		 *
		 *   Tries to merge this set of data with any other saved sets of data. If
		 *   unable to merge this data, saves the set by itself.
		 *
		 *   @param {can-connect.listData} listData
		 *   @param {can-query-logic/query} query
		 *   @return {Promise} Promise resolves if and when the data has been successfully saved.
		 */


		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.createData createData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Called when an instance is created and should be added to cache.
		 *
		 * @signature `connection.createData(props)`
		 *
		 *   Adds `props` to the stored list of instances. Then, goes
		 *   through every set and adds props the sets it belongs to.
		 */


		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.updateData updateData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Called when an instance is updated.
		 *
		 * @signature `connection.updateData(props)`
		 *
		 *   Overwrites the stored instance with the new props. Then, goes
		 *   through every set and adds or removes the instance if it belongs or not.
		 */


		/**
		 * @function can-connect/data/localstorage-cache/localstorage-cache.destroyData destroyData
		 * @parent can-connect/data/localstorage-cache/localstorage-cache.data-methods
		 *
		 * Called when an instance should be removed from the cache.
		 *
		 * @signature `connection.destroyData(props)`
		 *
		 *   Goes through each set of data and removes any data that matches
		 *   `props`'s [can-connect/base/base.id]. Finally removes this from the instance store.
		 */

	});

	return behavior;

};
