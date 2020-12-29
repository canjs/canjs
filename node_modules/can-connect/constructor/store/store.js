"use strict";
/**
 * @module {connect.Behavior} can-connect/constructor/store/store constructor/store
 * @parent can-connect.behaviors
 * @group can-connect/constructor/store/store.stores 0 stores
 * @group can-connect/constructor/store/store.callbacks 1 CRUD callbacks
 * @group can-connect/constructor/store/store.crud 2 CRUD methods
 * @group can-connect/constructor/store/store.hydrators 3 hydrators
 *
 * Adds support for keeping references to active lists and instances. Prevents different copies of an instance from
 * being used by the application at once. Allows other behaviors to look up instances currently active in the
 * application.
 *
 *
 * @signature `constructorStore( baseConnection )`
 *
 * Overwrites `baseConnection` so it contains a store for instances and lists.  This behavior:
 * - extends the [can-connect/constructor/store/store.hydrateInstance] and
 * [can-connect/constructor/store/store.hydrateList] methods to return instances or lists from the store, if available
 * - overwrites "CRUD" methods to make sure that while requests are pending, new lists and instances have references
 * kept in the store. This prevents duplicated instances from being created during concurrent requests.
 * - provides methods to add and remove items in the store by counting references
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `constructor/store` behavior added
 * on to it. Should already contain a behavior that provides the InstanceInteface
 * (e.g [can-connect/constructor/constructor]). If the `connect` helper is used to build the connection, the behaviors
 * will automatically be ordered as required.
 *
 * @return {Object} a `can-connect` connection containing the method implementations provided by `constructor/store`.
 *
 * @body
 *
 * ## Use
 *
 * The `constructor-store` behavior is used to:
 *  - provide a store of instances and lists in use by the client
 *  - prevent multiple instances from being generated for the same [can-connect/base/base.id] or multiple
 *    lists for the same [can-connect/base/base.listQuery].
 *
 * The store provides access to an instance by its [can-connect/base/base.id] or a list by its
 * [can-connect/base/base.listQuery]. This is used by other behaviors to lookup instances that should have changes applied.
 * Two examples, when there is a new instance that should be added to a list ([can-connect/real-time/real-time]) or
 * when newer data is available for a cached instance that is used in the page
 * ([can-connect/fall-through-cache/fall-through-cache]).
 *
 * Below you can see how `constructor-store`'s behavior be used to prevent multiple instances from being generated. This
 * example allows you to create multiple instances of a `todoEditor` that loads and edits a todo instance:
 *
 * @demo demos/can-connect/constructor-store.html
 *
 * You can see in this example that you can edit one todo and the other todos update.  This is because each `todoEditor`
 * is acting on same instance in memory. When it updates the todo's name here:
 *
 * ```
 * var updateData = function(newName) {
 *   todo.name = newName; // update name on todo instance
 *   ...
 * };
 * ```
 *
 * The other widgets update because they are bound to the same instance:
 *
 * ```
 * todo.on("name", updateElement); // when todo name changes update input element
 * todosConnection.addInstanceReference(todo); // previous line is a new usage of todo, so increase reference count
 * ```
 *
 * Each `todoEditor` receives the same instance because it was added to the
 * [can-connect/constructor/store/store.instanceStore connnection.instanceStore] by
 * [can-connect/constructor/store/store.addInstanceReference]. During all instance retrievals, a connection using the
 * `constructor/store` behavior checks the [can-connect/constructor/store/store.instanceStore] for an instance with a
 * matching `id` and return that if it exists. This example always requests `id: 5`, so all the `todoEditor`s use the
 * same instance held in the [can-connect/constructor/store/store.instanceStore].
 *
 * This widget cleans itself up when it is removed by removing the listener on the `todo` instance and
 * [can-connect/constructor/store/store.deleteInstanceReference reducing the instance reference count]:
 *
 * ```
 * todo.off("name", updateElement); // stop listening to todo name change
 * todosConnection.deleteInstanceReference(todo); // previous line removed a usage of todo, so reduce reference count
 * ```
 * This is done to prevent a memory leak produced by keeping instances in the `instanceStore` when they are no longer
 * needed by the application.
 *
 * **Note:** a hazard of sharing the same instance is that if new instance data is loaded from the server during
 * on-going editing of the instance, the new server data will replace the data that is edited but not yet saved.
 * This is because whenever data is loaded from the server, it is passed to
 * [can-connect/constructor/constructor.updatedInstance] which updates the shared instance properties with the new
 * server data.
 */
var connect = require("../../can-connect");
var WeakReferenceMap = require("../../helpers/weak-reference-map");
var WeakReferenceSet = require("../../helpers/weak-reference-set");
var sortedSetJSON = require("../../helpers/sorted-set-json");
var eventQueue = require("can-event-queue/map/map");

// shared across all connections
var pendingRequests = 0;
var noRequestsTimer = null;
var requests = {
	increment: function(connection){
		pendingRequests++;
		clearTimeout(noRequestsTimer);
	},
	decrement: function(connection){
		pendingRequests--;
		if(pendingRequests === 0) {
			noRequestsTimer = setTimeout(function(){
				requests.dispatch("end");
			},module.exports.requestCleanupDelay);
		}
		if(pendingRequests < 0) {
			pendingRequests = 0;
		}
	},
	count: function(){
		return pendingRequests;
	}
};
eventQueue(requests);


var constructorStore = connect.behavior("constructor/store",function(baseConnection){

	var behavior = {
		/**
		 * @property {can-connect/helpers/weak-reference-map} can-connect/constructor/store/store.instanceStore instanceStore
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * A mapping of instances keyed by their [can-connect/base/base.id].
		 *
		 * @type {can-connect/helpers/weak-reference-map}
		 *
		 * Stores instances by their [can-connect/base/base.id]. Holds instances based on reference counts which
		 * are incremented by [can-connect/constructor/store/store.addInstanceReference] and decremented by
		 * [can-connect/constructor/store/store.deleteInstanceReference]. Once a reference count is 0, the instance is no
		 * longer held in the store. Once a reference count is greater than 0, the instance is added to the store.
		 *
		 * ```js
		 * connection.addInstanceReference(todo5);
		 * connection.instanceStore.get("5") //-> todo5
		 * ```
		 */
		instanceStore: new WeakReferenceMap(),
		// This really should be a set ... we just need it "weak" so we know how many references through binding
		// it has.
		newInstanceStore: new WeakReferenceSet(),
		/**
		 * @property {can-connect/helpers/weak-reference-map} can-connect/constructor/store/store.listStore listStore
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * A mapping of lists keyed by their [can-connect/base/base.listQuery].
		 *
		 * @type {can-connect/helpers/weak-reference-map}
		 *
		 * Stores lists by their [can-connect/base/base.listQuery]. Hold lists based on reference counts which are incremented
		 * by [can-connect/constructor/store/store.addListReference] and decremented by
		 * [can-connect/constructor/store/store.deleteListReference]. Once a reference count is 0, the list is no
		 * longer held in the store. Once a reference count is greater than 0, the list is added to the store.
		 *
		 * ```js
		 * connection.addInstanceReference(allTodos, {});
		 * connection.instanceStore.get({}) //-> allTodos
		 * ```
		 */
		listStore: new WeakReferenceMap(),
		 // Set up the plain objects for tracking requested lists and instances for this connection,
		 // and add a handler to the requests counter to flush list and instance references when all
		 // requests have completed
		 //
		 // This function is called automatically when connect() is called on this behavior,
		 // and should not need to be called manually.
		init: function() {
			if(baseConnection.init) {
				baseConnection.init.apply(this, arguments);
			}

			if(!this.hasOwnProperty("_requestInstances")) {
				this._requestInstances = {};
			}
			if(!this.hasOwnProperty("_requestLists")) {
				this._requestLists = {};
			}

			requests.on("end", function onRequestsEnd_deleteStoreReferences(){
				var id;
				for(id in this._requestInstances) {
					this.instanceStore.deleteReference(id);
				}
				this._requestInstances = {};
				for(id in this._requestLists) {
					this.listStore.deleteReference(id);
					this._requestLists[id].forEach(this.deleteInstanceReference.bind(this));
				}
				this._requestLists = {};
			}.bind(this));
		},
		_finishedRequest: function(){
			requests.decrement(this);
		},

		/**
		 * @function can-connect/constructor/store/store.addInstanceReference addInstanceReference
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * Add a reference to the [can-connect/constructor/store/store.instanceStore] so an instance can be easily looked up.
		 *
		 * @signature `connection.addInstanceReference( instance )`
		 * Adds a reference to an instance by [can-connect/base/base.id] to the [can-connect/constructor/store/store.instanceStore].
		 * Keeps a count of the number of references, removing the instance from the store when the count reaches 0.
		 *
		 * @param {can-connect/Instance} instance the instance to add
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * The [can-connect/constructor/store/store.instanceStore] contains a mapping of instances keyed by their
		 * [can-connect/base/base.id]. The [can-connect/constructor/store/store.instanceStore] is used to prevent creating
		 * the same instance multiple times, and for finding active instance for a given id.  Instances need to be added to
		 * this store for this to work.  To do this, call `addInstanceReference`:
		 *
		 * ```
		 * // a basic connection
		 * var constructorStore = require("can-connect/constructor/store/");
		 * var constructor = require("can-connect/constructor/");
		 * var dataUrl = require("can-connect/data/url/");
		 * var todoConnection = connect([dataUrl, constructorStore, constructor], {
		 *   url: "/todos"
		 * });
		 *
		 * var originalTodo;
		 *
		 * // get a todo
		 * todoConnection.get({id: 5}).then(function( todo ){
		 *   // add it to the store
		 *   todoConnection.addInstanceReference(todo);
		 *   originalTodo = todo;
		 * });
		 * ```
		 *
		 * Now, if you were to retrieve the same data sometime later, it would be the same instance:
		 *
		 * ```
		 * todoConnection.get({id: 5}).then(function( todo ){
		 *   todo === originalTodo // true
		 * });
		 * ```
		 *
		 * The `.getData` response data (underlying the call to `todoConnection.get`) is passed, along with the existing todo
		 * instance (`originalTodo`) to [can-connect/constructor/constructor.updatedInstance]. That updates the shared
		 * instance with the newly retrieved data.
		 *
		 * All the referenced instances are held in memory.  Use
		 * [can-connect/constructor/store/store.deleteInstanceReference] to remove them.
		 *
		 * Typically, `addInstanceReference` is called when something expresses interest in the instance, such
		 * as an event binding, and `deleteInstanceReference` is called when the interest is removed.
		 */
		addInstanceReference: function(instance, id) {
			var ID = id || this.id(instance);
			if(ID === undefined) {
				// save in the newInstanceStore store temporarily.
				this.newInstanceStore.addReference(instance);
			} else {
				this.instanceStore.addReference( ID, instance );
			}

		},

		/**
		 * @function can-connect/constructor/store/store.callbacks.createdInstance createdInstance
		 * @parent can-connect/constructor/store/store.callbacks
		 *
		 * Calls `createdInstance` on the underlying behavior and moves the new instance from the `newInstanceStore` to
		 * `instanceStore` if needed.
		 *
		 * @signature `connection.createdInstance( instance, props )`
		 * Calls the base behavior. Then calls [can-connect/constructor/store/store.stores.moveCreatedInstanceToInstanceStore]
		 * to move any pre-creation instance references to the standard instance reference store.
		 *
		 * @param {can-connect/Instance} instance the instance that was created
		 * @param {Object} props the data returned from [can-connect/connection.createData]
		 */
		createdInstance: function(instance, props){
			// when an instance is created, and it is in the newInstance store
			// transfer it to the instanceStore
			baseConnection.createdInstance.apply(this, arguments);
			this.moveCreatedInstanceToInstanceStore(instance);
		},

		/**
		 * @function can-connect/constructor/store/store.stores.moveCreatedInstanceToInstanceStore moveCreatedInstanceToInstanceStore
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * Moves recently created instances into the [can-connect/constructor/store/store.instanceStore].
		 *
		 * @signature `moveCreatedInstanceToInstanceStore( instance )`
		 * Checks if an instance has an `id` and is in the `newInstanceStore`. If so, it adds it into the
		 * [can-connect/constructor/store/store.instanceStore] and removes it from the `newInstanceStore`.
		 *
		 * A new instances may have been added to the `newInstanceStore` if [can-connect/constructor/store/store.addInstanceReference]
		 * is called on is before the instance has been saved. This is done so we can keep track of references for unsaved
		 * instances and update the references to be keyed by `id` when one is available. Without this a request for a
		 * currently referenced instance that was just saved for the first time will erroneously result in a new instance.
		 *
		 * @param {can-connect/Instance} instance an instance.  If it was "referenced" (bound to) prior to
		 * being created, this will check for that condition and move this instance into the
		 * [can-connect/constructor/store/store.instanceStore].
		 */
		moveCreatedInstanceToInstanceStore: function(instance){
			var ID = this.id(instance);
			if(this.newInstanceStore.has(instance) && ID !== undefined) {
				var referenceCount = this.newInstanceStore.referenceCount(instance);
				this.newInstanceStore.delete(instance);
				this.instanceStore.addReference( ID, instance, referenceCount );
			}
		},
		addInstanceMetaData: function(instance, name, value){
			var data = this.instanceStore.set[this.id(instance)];
			if(data) {
				data[name] = value;
			}
		},
		getInstanceMetaData: function(instance, name){
			var data = this.instanceStore.set[this.id(instance)];
			if(data) {
				return data[name];
			}
		},
		deleteInstanceMetaData: function(instance, name){
			var data = this.instanceStore.set[this.id(instance)];

			delete data[name];
		},
		/**
		 * @function can-connect/constructor/store/store.deleteInstanceReference deleteInstanceReference
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * Remove a reference from the [can-connect/constructor/store/store.instanceStore] so an instance can be garbage
		 * collected.
		 *
		 * @signature `connection.addInstanceReference( instance )`
		 * Decrements the number of references to an instance in the [can-connect/constructor/store/store.instanceStore].
		 * Removes the instance if there are no longer any references.
		 *
		 * @param {can-connect/Instance} instance the instance to remove
		 *
		 * ### Usage
		 *
		 * `deleteInstanceReference` is called to remove references to instances in the
		 * [can-connect/constructor/store/store.instanceStore] so that instances maybe garbage collected.  It's usually
		 * called when the application or some part of the application no longer is interested in an instance.
		 *
		 * [can-connect/constructor/store/store.addInstanceReference] has an example of adding an instance to the store.
		 * The following continues that example to remove the `originalTodo` instance from the store:
		 *
		 * ```
		 * todoConnection.deleteInstanceReference(originalTodo);
		 * ```
		 *
		 * Also see the [can-connect/constructor/store/store#Use usage example on the index page] for a more complete
		 * example of the lifecycle of a reference.
		 */
		deleteInstanceReference: function(instance) {
			var ID = this.id(instance);
			if(ID === undefined) {
				// if there is no id, remove this from the newInstanceStore
				this.newInstanceStore.deleteReference(instance);
			} else {
				this.instanceStore.deleteReference( this.id(instance), instance );
			}

		},
		/**
		 * @property {WeakReferenceMap} can-connect/constructor/store/store.addListReference addListReference
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * Add a reference to the [can-connect/constructor/store/store.listStore] so a list can be easily looked up.
		 *
		 * @signature `connection.addListReference( list[, set] )`
		 * Adds a reference to a list by `set` (or by [can-connect/base/base.listQuery]) to the
		 * [can-connect/constructor/store/store.listStore].  Keeps a count of the number of references, removing the list
		 * from the store when the count reaches 0.
		 *
		 * @param {can-connect.List} list The list to add.
		 * @param {can-query-logic/query} [query] The set this list represents if it can't be identified with [can-connect/base/base.listQuery].
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * The [can-connect/constructor/store/store.listStore] contains a mapping of lists keyed by their `set`. The
		 * [can-connect/constructor/store/store.listStore] is used to prevent creating the same list multiple times and for
		 * identifying a list for a given set. Lists need to be added to this store for this to work.  To do this, call
		 * `addListReference`:
		 *
		 * ```
		 * // A basic connection:
		 * var constructorStore = require("can-connect/constructor/store/");
		 * var constructor = require("can-connect/constructor/");
		 * var dataUrl = require("can-connect/data/url/");
		 * var todoConnection = connect([dataUrl, constructorStore, constructor], {
		 *   url: "/todos"
		 * });
		 *
		 * var dueToday;
		 *
		 * // get a todo list
		 * todoConnection.getList({due: "today"}).then(function( todos ){
		 *   // add it to the store
		 *   todoConnection.addListReference(todos, {due: "today"});
		 *   dueToday = todos;
		 * });
		 * ```
		 *
		 * Now, if you were to retrieve the same set of data sometime later, it would be the same list instance:
		 *
		 * ```
		 * todoConnection.get({due: "today"}).then(function( todos ){
		 *   todos === dueToday //-> true
		 * });
		 * ```
		 *
		 * The `.getListData`  response data (underlying the call to `todoConnection.getList`) is passed, along with the
		 * existing list (`dueToday`) to [can-connect/constructor/constructor.updatedList]. That updates the shared list
		 * instance with the newly retrieved data.
		 *
		 * All the referenced lists stay in memory.  Use [can-connect/constructor/store/store.deleteListReference]
		 * to remove them.
		 *
		 * Typically, `addListReference` is called when something expresses interest in the list, such
		 * as an event binding, and `deleteListReference` is called when interest is removed.
		 *
		 */
		addListReference: function(list, set) {
			var id = sortedSetJSON( set || this.listQuery(list) );
			if(id) {
				this.listStore.addReference( id, list );
				list.forEach(function(instance) {
					this.addInstanceReference(instance);
				}.bind(this));
			}
		},
		/**
		 * @function can-connect/constructor/store/store.deleteListReference deleteListReference
		 * @parent can-connect/constructor/store/store.stores
		 *
		 * Removes a reference from the [can-connect/constructor/store/store.listStore] so a list can can be garbage
		 * collected.
		 *
		 * @signature `connection.addInstanceReference( instance )`
		 * Decrements the number of references to a list in the [can-connect/constructor/store/store.listStore].
		 * Removes the list if there are no longer any references.
		 *
		 * @param {can-connect/Instance} list the list to remove
		 *
		 * ### Usage
		 *
		 * `deleteListReference` is called to remove references to instances in the
		 * [can-connect/constructor/store/store.listStore] so that lists maybe garbage collected.  It's usually called when
		 * the application or some part of the application no longer is interested in a list.
		 *
		 * [can-connect/constructor/store/store.addListReference] has an example of adding a list to the store.  The
		 * following continues that example to remove the `dueToday` list from the store:
		 *
		 * ```
		 * todoConnection.deleteListReference(dueToday);
		 * ```
		 *
		 * Also see the [can-connect/constructor/store/store#Use usage example on the index page] for a more complete
		 * example of the lifecycle of a reference.
		 */
		deleteListReference: function(list, set) {
			var id = sortedSetJSON( set || this.listQuery(list) );
			if(id) {
				this.listStore.deleteReference( id, list );
				list.forEach(this.deleteInstanceReference.bind(this));
			}
		},
		/**
		 * @function can-connect/constructor/store/store.hydratedInstance hydratedInstance
		 * @parent can-connect/constructor/store/store.hydrators
		 *
		 * Keeps new instances in the [can-connect/constructor/store/store.instanceStore] for the lifetime of any
		 * concurrent requests.
		 *
		 * @signature `hydratedInstance(instance)`
		 * Adds a reference for new instances for the lifetime of any concurrent requests. Called when a new instance is
		 * created during [can-connect/constructor/store/store.hydrateInstance hydration]. This prevents concurrent requests
		 * for the same data from returning different instances.
		 *
		 * @param {can-connect/Instance} instance the newly hydrated instance
		 */
		// ## hydratedInstance
		hydratedInstance: function(instance){
			if( requests.count() > 0) {
				var id = this.id(instance);
				if(! this._requestInstances[id] ) {
					this.addInstanceReference(instance);
					this._requestInstances[id] = instance;
				}

			}
		},

		/**
		 * @function can-connect/constructor/store/store.hydrateInstance hydrateInstance
		 * @parent can-connect/constructor/store/store.hydrators
		 *
		 * Returns an instance given raw data, returning it from the [can-connect/constructor/store/store.instanceStore] if
		 * available.
		 *
		 * @signature `connection.hydrateInstance(props)`
		 * Overwrites the base `hydrateInstance` so that if a matching instance is in the
		 * [can-connect/constructor/store/store.instanceStore], that instance will be
		 * [can-connect/constructor/constructor.updatedInstance updated] with `props` and returned.  If there isn't a
		 * matching instance, the base `hydrateInstance` will be called.
		 *
		 * @param {Object} props the raw data used to create an instance
		 * @return {can-connect/Instance} a typed instance either created or updated with the data from `props`.
		 */
		hydrateInstance: function(props){
			var id = this.id(props);
			if((id || id === 0) && this.instanceStore.has(id) ) {
				var storeInstance = this.instanceStore.get(id);
				// TODO: find a way to prevent this from being called so many times.
				this.updatedInstance(storeInstance, props);
				return storeInstance;
			}
			var instance = baseConnection.hydrateInstance.call(this, props);
			this.hydratedInstance(instance);
			return instance;
		},

		/**
		 * @function can-connect/constructor/store/store.hydratedList hydratedList
		 * @parent can-connect/constructor/store/store.hydrators
		 *
		 * Keeps new lists in the [can-connect/constructor/store/store.listStore] for the lifetime of any concurrent
		 * requests.
		 *
		 * @signature `hydratedList(list)`
		 * Adds a reference for new lists for the lifetime of any concurrent requests. Called when a new list is
		 * created during [can-connect/constructor/store/store.hydrateList hydration]. This prevents concurrent requests
		 * for the same data from returning different instances.
		 *
		 * @param {can-connect.List} list the newly hydrated list
		 */
		hydratedList: function(list, set){
			if( requests.count() > 0) {
				var id = sortedSetJSON( set || this.listQuery(list) );
				if(id) {
					if(! this._requestLists[id] ) {
						this.addListReference(list, set);
						this._requestLists[id] = list;
					}
				}
			}
		},

		/**
		 * @function can-connect/constructor/store/store.hydrateList hydrateList
		 * @parent can-connect/constructor/store/store.hydrators
		 *
		 * Returns a list given raw data, returning it from the [can-connect/constructor/store/store.listStore] if
		 * available.
		 *
		 * @signature `connection.hydrateList( listData, set )`
		 *
		 *   Overwrites the base `hydrateList` so that if a matching list is in the
		 *   [can-connect/constructor/store/store.listStore], that list will be
		 *   [can-connect/constructor/constructor.updatedList updated] with `listData` and returned.
		 *   If there isn't a matching list, the base `hydrateList` will be called.
		 *
		 *   @param {can-connect.listData} listData raw list data to hydrate into a list type
		 *   @param {can-query-logic/query} query the parameters that represent the set of data in `listData`
		 *   @return {List} a typed list from either created or updated with the data from `listData`
		 */
		hydrateList: function(listData, set){
			set = set || this.listQuery(listData);
			var id = sortedSetJSON( set );

			if( id && this.listStore.has(id) ) {
				var storeList = this.listStore.get(id);
				this.updatedList(storeList, listData, set);
				return storeList;
			}
			var list = baseConnection.hydrateList.call(this, listData, set);
			this.hydratedList(list, set);
			return list;
		},

		/**
		 * @function can-connect/constructor/store/store.getList getList
		 * @parent can-connect/constructor/store/store.crud
		 *
		 * Extends the underlying [can-connect/connection.getList] so any [can-connect/constructor/store/store.hydrateInstance instances hydrated]
		 * or [can-connect/constructor/store/store.hydrateList lists hydrated] during this request are kept in the store until
		 * all the concurrent requests complete.
		 *
		 * @signature `connection.getList( set )`
		 * Increments an internal request counter so instances hydrated during this request will be stored, and then
		 * decrements the counter after the request is complete. This prevents concurrent requests for the same data from
		 * returning different instances.
		 *
		 * @param {can-query-logic/query} listQuery parameters specifying the list to retrieve
		 * @return {Promise<can-connect/Instance>} `Promise` returned by the underlying behavior's [can-connect/connection.getList]
		 */
		getList: function(listQuery) {
			var self = this;
			requests.increment(this);
			var promise = baseConnection.getList.call(this, listQuery);

			promise.then(function(instances){
				self._finishedRequest();
			}, function(){
				self._finishedRequest();
			});
			return promise;
		},

		/**
		 * @function can-connect/constructor/store/store.get get
		 * @parent can-connect/constructor/store/store.crud
		 *
		 * Extends the underlying [can-connect/connection.get] so any [can-connect/constructor/store/store.hydrateInstance instances hydrated]
		 * during this request are kept in the store until all the concurrent requests complete.
		 *
		 * @signature `connection.get( params )`
		 * Increments an internal request counter so instances hydrated during this request will be stored, and then
		 * decrements the counter after the request is complete. This prevents concurrent requests for the same data from
		 * returning different instances.
		 *
		 * @param {Object} params params used to specify which instance to retrieve.
		 * @return {Promise<can-connect/Instance>} `Promise` returned by the underlying behavior's [can-connect/connection.get]
		 */
		get: function(params) {
			var self = this;
			requests.increment(this);
			var promise = baseConnection.get.call(this, params);

			promise.then(function(instance){
				self._finishedRequest();
			}, function(){
				self._finishedRequest();
			});
			return promise;

		},
		/**
		 * @function can-connect/constructor/store/store.save save
		 * @parent can-connect/constructor/store/store.crud
		 *
		 * Extends the underlying [can-connect/connection.save] so any [can-connect/constructor/store/store.hydrateInstance instances hydrated]
		 * during this request are kept in the store until all the concurrent requests complete.
		 *
		 * @signature `connection.save( instance )`
		 *
		 * Increments an internal request counter so instances hydrated during this request will be stored, and then
		 * decrements the counter after the request is complete. This prevents concurrent requests for the same data from
		 * returning different instances.
		 *
		 * @param {Object} instance a typed instance being saved
		 * @return {Promise<can-connect/Instance>} `Promise` returned by the underlying behavior's [can-connect/connection.save]
		 */
		save: function(instance) {
			var self = this;
			requests.increment(this);

			var updating = !this.isNew(instance);
			if(updating) {
				this.addInstanceReference(instance);
			}

			var promise = baseConnection.save.call(this, instance);

			promise.then(function(instances){
				if(updating) {
					self.deleteInstanceReference(instance);
				}
				self._finishedRequest();
			}, function(){
				self._finishedRequest();
			});
			return promise;
		},
		/**
		 * @function can-connect/constructor/store/store.destroy destroy
		 * @parent can-connect/constructor/store/store.crud
		 *
		 * Extends the underlying [can-connect/connection.destroy] so any [can-connect/constructor/store/store.hydrateInstance instances hydrated]
		 * during this request are kept in the store until all the concurrent requests complete.
		 *
		 * @signature `connection.destroy( instance )`
		 * Increments an internal request counter so instances hydrated during this request will be stored, and then
		 * decrements the counter after the request is complete. This prevents concurrent requests for the same data from
		 * returning different instances.
		 *
		 * @param {Object} instance a typed instance being deleted
		 * @return {Promise<can-connect/Instance>} `Promise` returned by the underlying behavior's [can-connect/connection.destroy]
		 */
		destroy: function(instance) {
			var self = this;
			// Add to instance store, for the duration of the
			// destroy callback
			this.addInstanceReference(instance);
			requests.increment(this);
			var promise = baseConnection.destroy.call(this, instance);

			promise.then(function(instance){
				self._finishedRequest();
				self.deleteInstanceReference(instance);
			}, function(){
				self._finishedRequest();
			});
			return promise;

		},
		/**
		 * @function can-connect/constructor/store/store.updatedList updatedList
		 * @parent can-connect/constructor/store/store.callbacks
		 *
		 * Extends the underlying [can-connect/connection.updatedList] so any instances that have been added or removed
		 * from the list have their reference counts updated accordingly.
		 *
		 * @signature `connection.updatedList( list, listData, set )`
		 * Increments an internal request counter so instances on this list during this request will be stored, and decrements
		 * the same counter for all items previously on the list (found in `listData.data`).
		 *
		 * @param {can-connect.List} list a typed list of instances being updated
		 * @param {Object} listData an object representing the previous state of the list
		 * @param {Object} set the retrieval set used to get the list
		 */
		updatedList: function(list, listData, set) {
			var oldList = list.slice(0);
			if(!listData.data && typeof listData.length === "number") {
				listData = { data: listData };
			}
			if(baseConnection.updatedList) {
				baseConnection.updatedList.call(this, list, listData, set);
				list.forEach(function(instance) {
					this.addInstanceReference(instance);
				}.bind(this));
			} else if(listData.data) {
				listData.data.forEach(function(instance) {
					this.addInstanceReference(instance);
				}.bind(this));
			}
			oldList.forEach(this.deleteInstanceReference.bind(this));
		}
	};

	return behavior;

});
constructorStore.requests = requests;
// The number of ms to wait after all known requests have finished,
//  before starting request cleanup.
// If a new request comes in before timeout, wait until that request
//  has finished (+ delay) before starting cleanup.
// This is configurable, for use cases where more waiting is desired,
//  or for the can-connect tests which expect everything to clean up
//  in 1ms.
constructorStore.requestCleanupDelay = 10;

module.exports = constructorStore;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");
	module.exports = validate(constructorStore, ['hydrateInstance', 'hydrateList', 'getList', 'get', 'save', 'destroy']);
}
//!steal-remove-end
