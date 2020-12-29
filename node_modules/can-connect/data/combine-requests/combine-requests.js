var connect = require("../../can-connect");
var getItems = require("../../helpers/get-items");
var canReflect = require("can-reflect");

var makeDeferred = require("../../helpers/deferred");
var forEach = [].forEach;
/**
 * @module can-connect/data/combine-requests/combine-requests combine-requests
 * @parent can-connect.behaviors
 * @group can-connect/data/combine-requests.options 1 behavior options
 * @group can-connect/data/combine-requests.types 2 types
 * @group can-connect/data/combine-requests.data-methods 3 data methods
 * @group can-connect/data/combine-requests.queryLogic 4 queryLogic methods
 *
 * Combines multiple incoming lists requests into a single list request when possible.
 *
 * @signature `combineRequests( baseConnection )`
 *
 * Implements [can-connect/data/combine-requests.getListData] to collect the requested sets for some
 * [can-connect/data/combine-requests.time].  Once the configured amount of time has passed, it tries to take the
 * [can-connect/data/combine-requests.unionPendingRequests union] of the requested sets. It then makes requests with
 * those unified sets. Once the unified set requests have returned, the original requests are resolved by taking
 * [can-connect/data/combine-requests.filterMembers subsets] of the unified response data.
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `combine-requests` behavior added
 * on to it. Should already contain a behavior that provides `getListData` (e.g [can-connect/data/url/url]). If
 * the `connect` helper is used to build the connection, the behaviors will automatically be ordered as required.
 *
 * @return {{}} a `can-connect` connection containing the method implementations provided by `combine-requests`.
 *
 * @body
 *
 * ## Use
 *
 * Create a connection with the `combine-requests` plugin:
 *
 * ```
 * var combineRequests = require("can-connect/data/combine-requests/");
 * var dataUrl = require("can-connect/data/url/");
 * var todosConnection = connect([dataUrl, combineRequests], {
 *   url: "/todos"
 * });
 * ```
 * Since the configuration above doesn't include the [can-connect/data/combine-requests.time] option, the following
 * will only make a single request if all requests are made during the same "thread of execution" (i.e. before the
 * browser takes a break from executing the current JavaScript):
 *
 * ```
 * todosConnection.getListData({})
 * todosConnection.getListData({filter: {userId: 5}});
 * todosConnection.getListData({filter: {userId: 5, type: "critical"}});
 * ```
 *
 * The above requests can all be joined since [can-set] intuitively knows that
 * `({filter: {userId: 5}}` and `{filter: {userId: 5, type: "critical"}}` are subsets of the complete set of todos, `{}`.
 *
 * For more advanced combining, a [can-query-logic queryLogic] must be configured. This allows `combine-requests` to understand
 * what certain parameters of a set mean, and how they might be combined.
 *
 *
 *
 */
var combineRequests = connect.behavior("data/combine-requests",function(baseConnection){
	var pendingRequests; //[{set, deferred}]

	return {
		/**
		 * @function can-connect/data/combine-requests.unionPendingRequests unionPendingRequests
		 * @parent can-connect/data/combine-requests.queryLogic
		 *
		 * Group pending requests by the request that they are a subset of.
		 *
		 * @signature `connection.unionPendingRequests( pendingRequests )`
		 *
		 * This is called by [can-connect/data/combine-requests.getListData] to determine which pending requests can be unified
		 * into a broader request. This produces a grouping of 'parent' sets to 'child' requests whose data will be
		 * derived from the data retrieved by the parent.
		 *
		 * After this grouping is returned, [can-connect/data/combine-requests.getListData] executes requests for the parent
		 * sets. After a parent request succeeds, the child requests will have their data calculated from the parent data.
		 *
		 * @param {Array<can-connect/data/combine-requests.PendingRequest>} pendingRequests
		 * an array of objects, each containing:
		 *   - `set` - the requested set
		 *   - `deferred` - a wrapper around a `Promise` that will be resolved with this sets data
		 *
		 * @return {Array<{set: Set, pendingRequests: can-connect/data/combine-requests.PendingRequest}>}
		 * an array of each of the unified requests to be made.  Each unified request should have:
		 *   - `set` - the set to request
		 *   - `pendingRequests` - the array of [can-connect/data/combine-requests.PendingRequest pending requests] the `set` satisfies
		 *
		 * ### Example
		 *
		 * This function converts something like:
		 *
		 * ```
		 * [
		 *   {set: {completed: false}, deferred: def1},
		 *   {set: {completed: true}, deferred: def2}
		 * ]
		 * ```
		 *
		 * to:
		 *
		 * ```
		 * [
		 *   {
		 *    set: {},
		 *    pendingRequests: [
		 *      {set: {completed: false}, deferred: def1},
		 *      {set: {completed: true}, deferred: def2}
		 *    ]
		 *   }
		 * ]
		 * ```
		 *
		 */
		unionPendingRequests: function(pendingRequests){
			// this should try to merge existing param requests, into an array of
			// others to send out
			// but this data structure keeps the original promises.


			// we need the "biggest" sets first so they can swallow up everything else
			// O(n log n)
			var self = this;

			pendingRequests.sort(function(pReq1, pReq2){

				if(self.queryLogic.isSubset(pReq1.set, pReq2.set)) {
					return 1;
				} else if( self.queryLogic.isSubset(pReq2.set, pReq1.set) ) {
					return -1;
				} else {
					return 0;
				}

			});

			// O(n^2).  This can probably be made faster, but there are rarely lots of pending requests.
			var combineData = [];
			var current;

			doubleLoop(pendingRequests, {
				start: function(pendingRequest){
					current = {
						set: pendingRequest.set,
						pendingRequests: [pendingRequest]
					};
					combineData.push(current);
				},
				iterate: function(pendingRequest){
					var combined = self.queryLogic.union(current.set, pendingRequest.set);
					if( self.queryLogic.isDefinedAndHasMembers(combined) ) {
						// add next
						current.set = combined;
						current.pendingRequests.push(pendingRequest);
						// removes this from iteration
						return true;
					}
				}
			});

			return Promise.resolve(combineData);
		},

		/**
		 * @property {Number} can-connect/data/combine-requests.time time
		 * @parent can-connect/data/combine-requests.options
		 *
		 * Specifies the amount of time to wait to combine requests.
		 *
		 * @option {Number} Defaults to `1`, meaning only requests made within the same "thread of execution" will be
		 * combined (i.e. requests made before the browser takes a break from the ongoing JavaScript execution).
		 *
		 * Increasing this number will mean that requests are delayed that length of time in case other requests
		 * are made. In general, we advise against increasing this amount of time except in cases where loads take a
		 * significant amount of time and the increased delay is unlikely to be noticed.
		 *
		 * ```
		 * var combineRequests = require("can-connect/data/combine-requests/");
		 * connect([... combineRequests, ...],{
		 *   time: 100
		 * })
		 * ```
		 */
		time:1,

		/**
		 * @function can-connect/data/combine-requests.getListData getListData
		 * @parent can-connect/data/combine-requests.data-methods
		 *
		 * Combines multiple list data requests into a single request, when possible.
		 *
		 * @signature `connection.getListData( set )`
		 *
		 * Extension of [can-connect/connection.getListData `getListData`] that tries to combine calls to it into a single
		 * call. The calls are fulfilled by an underlying behavior's `getListData` implementation.
		 *
		 * Waits for a configured [can-connect/data/combine-requests.time] then tries to unify the sets requested during it.
		 * After unification, calls for the unified sets are made to the underlying `getListData`. Once the unified
		 * data has returned, the individual calls to `getListData` are resolved with a
		 * [can-query-logic.prototype.filterMembers calculated subset] of the unified data.
		 *
		 * @param {can-query-logic/query} query the parameters of the requested set of data
		 * @return {Promise<can-connect.listData>} `Promise` resolving the data of the requested set
		 */
		getListData: function(set){
			set = set || {};
			var self = this;

			if(!pendingRequests) {

				pendingRequests = [];

				setTimeout(function(){

					var combineDataPromise = self.unionPendingRequests(pendingRequests);
					pendingRequests = null;
					combineDataPromise.then(function(combinedData){
						// farm out requests
						forEach.call(combinedData, function(combined){
							// clone combine.set to prevent mutations by baseConnection.getListData
							var combinedSet = canReflect.serialize(combined.set);

							baseConnection.getListData(combinedSet).then(function(data){
								if(combined.pendingRequests.length === 1) {
									combined.pendingRequests[0].deferred.resolve(data);
								} else {
									forEach.call(combined.pendingRequests, function(pending){
										// get the subset using the combine.set property before being passed down
										// to baseConnection.getListData which might mutate it causing combinedRequests
										// to resolve with an `undefined` value instead of an actual set
										// https://github.com/canjs/can-connect/issues/139
										pending.deferred.resolve( {data: self.queryLogic.filterMembers(pending.set, combined.set, getItems(data))} );
									});
								}
							}, function(err){
								if(combined.pendingRequests.length === 1) {
									combined.pendingRequests[0].deferred.reject(err);
								} else {
									forEach.call(combined.pendingRequests, function(pending){
										pending.deferred.reject(err);
									});
								}

							});
						});
					});


				}, this.time || 1);
			}
			var deferred = makeDeferred();

			pendingRequests.push({deferred: deferred, set: set});

			return deferred.promise;
		}
	};
});

module.exports = combineRequests;

//!steal-remove-start
var validate = require("../../helpers/validate");
module.exports = validate(combineRequests, ['getListData']);
//!steal-remove-end

/**
 * @typedef {PendingRequest} can-connect/data/combine-requests.PendingRequest PendingRequest
 * @parent can-connect/data/combine-requests.types
 *
 * @description Type to keep track of the multiple requests that were unified into a single request.
 *
 * @type {PendingRequest} Record of an individual request that has been unified as part of the combined request. After
 * the unified request completes instances of these types are processed to complete the individual requests with the
 * subset of the unified data.
 *
 * @option {can-query-logic/query} query a requested [can-set/Set set] of data that has been unified into the combined request
 * @option {{}} deferred a type that keeps track of the individual [can-connect/data/combine-requests.getListData]
 * promise that will be resolved after the unified request completes
 */

// ### doubleLoop
var doubleLoop = function(arr, callbacks){
	var i = 0;
	while(i < arr.length) {
		callbacks.start(arr[i]);
		var j = i+1;
		while( j < arr.length ) {
			if(callbacks.iterate(arr[j]) === true) {
				arr.splice(j, 1);
			} else {
				j++;
			}
		}
		i++;
	}
};
