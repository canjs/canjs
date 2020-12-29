var connect = require("../can-connect");
var getItems = require("../helpers/get-items");
var forEach = Array.prototype.forEach;


/**
 * @module can-connect/cache-requests/cache-requests cache-requests
 * @parent can-connect.behaviors
 * @group can-connect/cache-requests/cache-requests.data data interface
 * @group can-connect/cache-requests/cache-requests.queryLogic queryLogic
 *
 * Cache response data and use it to prevent unnecessary future requests or make future requests smaller.
 *
 * @signature `cacheRequests( baseConnection )`
 *
 *   Provide an implementation of [can-connect/cache-requests/cache-requests.getListData] that uses [can-connect/base/base.queryLogic] to
 *   determine what data is already in the [can-connect/base/base.cacheConnection cache] and what data needs to be
 *   loaded from the base connection.
 *
 *   It then gets data from the cache and the base connection (if needed), merges it, and returns it. Any data returned
 *   from the base connection is added to the cache.
 *
 *   @param {{}} baseConnection `can-connect` connection object that is having the `cache-requests` behavior added
 *   on to it. Should already contain the behaviors that provide the [can-connect/DataInterface]
 *   (e.g [can-connect/data/url/url]). If the `connect` helper is used to build the connection, the behaviors will
 *   automatically be ordered as required.
 *
 *   @return {Object} A `can-connect` connection containing the methods provided by `cache-requests`.
 *
 *
 * @body
 *
 * ## Use
 *
 * Use `cache-requests` in combination with a cache like [can-connect/data/memory-cache/memory-cache] or
 * [can-connect/data/localstorage-cache/localstorage-cache].  For example, to make it so response data is cached
 * in memory:
 *
 * ```js
 * var memoryStore = require("can-memory-store");
 * var dataUrl = require("can-connect/data/url/url");
 * var cacheRequests = require("can-connect/cache-requests/cache-requests");
 * var queryLogic = require("can-query-logic");
 *
 * var todoQueryLogic = new QueryLogic({});
 *
 * var cacheConnection = memoryStore({queryLogic: todoQueryLogic});
 * var todoConnection = connect([dataUrl, cacheRequests],{
 *   cacheConnection: cacheConnection,
 *   url: "/todos",
 *   queryLogic: todoQueryLogic
 * });
 * ```
 *
 * Now if today's todos are loaded:
 *
 * ```js
 * todoConnection.getListData({filter: {due: "today"}});
 * ```
 *
 * And later, a subset of those todos are loaded:
 *
 * ```js
 * todoConnection.getListData({filter: {due: "today", status: "critical"}});
 * ```
 *
 * The second request will be created from the original request's data.
 *
 * ## QueryLogic Usage
 *
 * `cache-requests` will "fill-in" the `cacheConnection` using [can-query-logic queryLogic].
 *
 * For example, if you requested paginated data like:
 *
 * ```
 * todoConnection.getListData({filter: {status: "critical"}})
 * ```
 *
 * And then later requested:
 *
 * ```
 * todoConnection.getListData({})
 * ```
 *
 * `cache-requests` will only request `{filter: {status: ["low","medium"]}}`, merging
 * that response with the data already present in the cache.
 *
 * That configuration looks like:
 *
 * ```js
 * var memoryStore = require("can-memory-store");
 * var dataUrl = require("can-connect/data/url/url");
 * var cacheRequests = require("can-connect/cache-requests/cache-requests");
 * var queryLogic = require("can-query-logic");
 *
 * var todoQueryLogic = new QueryLogic({
 *   keys: {
 *     status: QueryLogic.makeEnum(["low","medium","critical"])
 *   }
 * });
 *
 * var cacheConnection = memoryStore({queryLogic: todoQueryLogic});
 * var todoConnection = connect([dataUrl, cacheRequests], {
 *   cacheConnection: cacheConnection,
 *   url: "/todos",
 *   queryLogic: todoQueryLogic
 * })
 * ```
 *
 * **Note:** `cacheConnection` shares the same queryLogic configuration as the primary connection.
 */
var cacheRequestsBehaviour = connect.behavior("cache-requests",function(baseConnection){

	return {

		/**
		 * @function can-connect/cache-requests/cache-requests.getDiff getDiff
		 * @parent can-connect/cache-requests/cache-requests.queryLogic
		 *
		 * Compares the cached queries to the requested query and returns a description of what subset can be loaded from the
		 * cache and what subset must be loaded from the base connection.
		 *
		 * @signature `connection.getDiff( query, availableQueries )`
		 *
		 *   This determines the minimal amount of data that must be loaded from the base connection by going through each
		 *   cached query (`availableQueries`) and doing a [can-query-logic.prototype.isSubset isSubset] check and a
		 *   [can-query-logic.prototype.difference query difference] with the requested query (`query`).
		 *
		 *   If `query` is a subset of an `availableSet`, `{cached: query}` will be returned.
		 *
		 *   If `query` is neither a subset of, nor intersects with any `availableQueries`, `{needed: query}` is returned.
		 *
		 *   If `query` has an intersection with one or more `availableQueries`, a description of the difference that has the fewest
		 *   missing elements will be returned. An example diff description looks like:
		 *
		 *   ```
		 *   {
		 *     needed: {start: 50, end: 99}, // the difference, the query that is not cached
		 *     cached: {start: 0, end: 49}, // the intersection, the query that is cached
		 *     count: 49 // the size of the needed query
		 *   }
		 *   ```
		 *
		 *   @param {can-query-logic/query} query The query that is being requested.
		 *   @param {Array<can-query-logic/query>} availableQueries An array of [can-connect/connection.getSets available queries] in the
		 *     [can-connect/base/base.cacheConnection cache].
		 *   @return {Promise<{needed: can-query-logic/query, cached: can-query-logic/query, count: Integer}>} a difference description object. Described above.
		 *
		 */
		getDiff: function( params, availableQueries ){

			var minSets,
				self = this;

			forEach.call(availableQueries, function(query){
				var curSets;
				var difference = self.queryLogic.difference(params, query );
				if( self.queryLogic.isDefinedAndHasMembers(difference) ) {
					var intersection = self.queryLogic.intersection(params, query);
					curSets = {
						needed: difference,
						cached: self.queryLogic.isDefinedAndHasMembers(intersection) ? intersection : false,
						count: self.queryLogic.count(difference)
					};
				} else if( self.queryLogic.isSubset(params, query) ){
					curSets = {
						cached: params,
						count: 0
					};
				}
				if(curSets) {
					if(!minSets || curSets.count < minSets.count) {
						minSets = curSets;
					}
				}
			});

			if(!minSets) {
				return {
					needed: params
				};
			} else {
				return {
					needed: minSets.needed,
					cached: minSets.cached
				};
			}
		},

		/**
		 * @function can-connect/cache-requests/cache-requests.unionMembers unionMembers
		 * @parent can-connect/cache-requests/cache-requests.queryLogic
		 *
		 * Create the requested data set, a union of the cached and un-cached data.
		 *
		 * @signature `connection.unionMembers(set, diff, neededData, cachedData)`
		 *
		 *   Uses [can-query-logic.prototype.unionMembers] to merge the two queries of data (`neededData` & `cachedData`).
		 *
		 * @param {can-query-logic/query} query The parameters of the data set requested.
		 * @param {Object} diff The result of [can-connect/cache-requests/cache-requests.getDiff].
		 * @param {can-connect.listData} neededData The data loaded from the base connection.
		 * @param {can-connect.listData} cachedData The data loaded from the [can-connect/base/base.cacheConnection].
		 *
		 * @return {can-connect.listData} A merged [can-connect.listData] representation of the the cached and requested data.
		 */
		unionMembers: function(params, diff, neededItems, cachedItems){
			// using the diff, re-construct everything
			return {data: this.queryLogic.unionMembers(diff.needed, diff.cached, getItems(neededItems), getItems(cachedItems))};
		},

		/**
		 * @function can-connect/cache-requests/cache-requests.getListData getListData
		 * @parent can-connect/cache-requests/cache-requests.data
		 *
		 * Only request data that isn't already present in the [can-connect/base/base.cacheConnection cache].
		 *
		 * @signature `connection.getListData(set)`
		 *
		 *   Overwrites a base connection's `getListData` to use data in the [can-connect/base/base.cacheConnection cache]
		 *   whenever possible.  This works by [can-connect/connection.getSets getting the stored queries]
		 *   from the [can-connect/base/base.cacheConnection cache] and
		 *   doing a [can-connect/cache-requests/cache-requests.getDiff diff] to see what needs to be loaded from the base
		 *   connection and what can be loaded from the [can-connect/base/base.cacheConnection cache].
		 *
		 *   With that information, this `getListData` requests data from the cache or the base connection as needed.
		 *   Data loaded from different sources is combined via [can-connect/cache-requests/cache-requests.unionMembers].
		 *
		 * @param {can-query-logic/query} query the parameters of the list that is being requested.
		 * @return {Promise<can-connect.listData>} a promise that returns an object conforming to the [can-connect.listData] format.
		 */
		getListData: function(set){
			set = set || {};
			var self = this;

			return this.cacheConnection.getSets(set).then(function(queries){

				var diff = self.getDiff(set, queries);

				if(!diff.needed) {
					return self.cacheConnection.getListData(diff.cached);
				} else if(!diff.cached) {
					return baseConnection.getListData(diff.needed).then(function(data){

						return self.cacheConnection.updateListData(getItems(data), diff.needed ).then(function(){
							return data;
						});

					});
				} else {
					var cachedPromise = self.cacheConnection.getListData(diff.cached);
					var needsPromise = baseConnection.getListData(diff.needed);

					var savedPromise = needsPromise.then(function(data){
						return self.cacheConnection.updateListData(  getItems(data), diff.needed ).then(function(){
							return data;
						});
					});
					// start the combine while we might be saving param and adding to cache
					var combinedPromise = Promise.all([
						cachedPromise,
						needsPromise
					]).then(function(result){
						var cached = result[0],
							needed = result[1];
						return self.unionMembers( set, diff, needed, cached);
					});

					return Promise.all([combinedPromise, savedPromise]).then(function(data){
						return data[0];
					});
				}

			});
		}
	};

});

module.exports = cacheRequestsBehaviour;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../helpers/validate");
	module.exports = validate(cacheRequestsBehaviour, ['getListData', 'cacheConnection']);
}
//!steal-remove-end
