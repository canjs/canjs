

"use strict";

/**
 * @module {connect.Behavior} can-connect/constructor/constructor constructor
 * @parent can-connect.behaviors
 * @group can-connect/constructor/constructor.options 1 behavior options
 * @group can-connect/constructor/constructor.crud 2 CRUD methods
 * @group can-connect/constructor/constructor.callbacks 3 CRUD callbacks
 * @group can-connect/constructor/constructor.hydrators 4 hydrators
 * @group can-connect/constructor/constructor.serializers 5 serializers
 * @group can-connect/constructor/constructor.helpers 6 helpers
 *
 * Adds an interface to interact with custom types via the connection instead of plain Objects and Arrays.
 *
 * @signature `constructor( baseConnection )`
 *
 * Adds an interface that allows the connection to operate on custom types. These fall into the categories:
 * - [can-connect/constructor/constructor#CRUDMethods CRUD Methods] - create, read, update and delete typed instances via the data source
 * - [can-connect/constructor/constructor#CRUDCallbacks CRUD Callbacks] - activities run on typed instances following data source operations
 * - [can-connect/constructor/constructor#Hydrator Hydrators] - conversion of raw data to typed data
 * - [can-connect/constructor/constructor#Serializers Serializers] - conversion of typed data to raw data
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `constructor` behavior added
 * on to it.
 *
 * @return {Object} A `can-connect` connection containing the method implementations provided by `constructor`.
 *
 * @body
 *
 * ## Use
 *
 * The `constructor` behavior allows you to instantiate the raw representation of the data source's data into a
 * custom typed representation with additional methods and behaviors.

 * An example might be loading data from a `"/todos"` service and being able to call `.timeLeft()`  on the todos that
 * you get back like:
 *
 * ```js
 * todoConnection.get({id: 6}).then(function(todo){
 *   todo.timeLeft() //-> 60000
 * })
 * ```
 *
 * The following creates a `todoConnection` that does exactly that:
 *
 * ```js
 * // require connection plugins
 * var constructor = require("can-connect/constructor/");
 * var dataUrl = require("can-connect/data/url/");
 *
 * // define type constructor function
 * var Todo = function(data){
 *   // add passed properties to new instance
 *   for(var prop in data) {
 *    this[prop] = data;
 *   }
 * };
 *
 * // add method to get time left before due, in milliseconds
 * Todo.prototype.timeLeft = function(){
 *   return new Date() - this.dueDate
 * };
 *
 * // create connection, passing function to instantiate new instances
 * var todoConnection = connect([constuctor, dataUrl], {
 *   url: "/todos",
 *   instance: function(data){
 *     return new Todo(data);
 *   }
 * });
 * ```
 *
 * The `constructor` behavior is still useful even if you want to keep your data as untyped objects (which is the
 * default behavior when no [can-connect/constructor/constructor.instance `instance`] implementation is provided).  The
 * behavior provides an interface to the data held by the client. For example,
 * [can-connect/constructor/constructor.updatedInstance] provides an extension point for logic that needs to be executed
 * after an instance held by the client finishes an update request. This is valuable whether that instance is typed or not.
 * Extensions like [can-connect/real-time/real-time] or [can-connect/fall-through-cache/fall-through-cache]
 * require this interface for advanced behavior.
 *
 * ## Interface
 *
 * `constructor` provides the following categories of methods to interact with typed data:
 *
 * ### <span id="CRUDMethods">CRUD Methods</span>
 *
 * Methods that create, read, update and delete (CRUD) typed representations of raw connection data:
 *
 * - [can-connect/constructor/constructor.get] - retrieve a single typed instance from the data source
 * - [can-connect/constructor/constructor.getList] - retrieve a typed list of instances from the data source
 * - [can-connect/constructor/constructor.save] - save a typed instance's data to the data source
 * - [can-connect/constructor/constructor.destroy] - delete a typed instance's data from the data source
 *
 * ### <span id="CRUDCallbacks">CRUD Callbacks</span>
 *
 * "CRUD Methods" call these methods with request response data and a related instance. Their implementation here
 * updates the related instance with that data:
 *
 * - [can-connect/constructor/constructor.createdInstance] - after [can-connect/constructor/constructor.save saving] new instance to data source, update that instance with response data
 * - [can-connect/constructor/constructor.updatedInstance] - after [can-connect/constructor/constructor.save saving] existing instance to data source, update that instance with response data
 * - [can-connect/constructor/constructor.destroyedInstance] - after [can-connect/constructor/constructor.destroy deleting] instance from data source, update that instance with response data
 * - [can-connect/constructor/constructor.updatedList] - after new data is read from the data source, update an existing list with instances created from that data
 *
 * ### <span id="CRUDMethods">Hydrators</span>
 *
 * These methods are used to create a typed instance or typed list given raw data objects:
 * - [can-connect/constructor/constructor.hydrateInstance] - create a typed instance given raw instance data
 * - [can-connect/constructor/constructor.hydrateList] - create a typed list of typed instances given given raw list data
 *
 * ### <span id="Serializers">Serializers</span>
 *
 * These methods convert a typed instance or typed list into a raw object:
 * - [can-connect/constructor/constructor.serializeInstance] - return raw data representing the state of the typed instance argument
 * - [can-connect/constructor/constructor.serializeList] - return raw data representing the state of the typed list argument
 *
 */
var canReflect = require("can-reflect");
var makeArray = canReflect.toArray;
var assign = canReflect.assignMap;
var WeakReferenceMap = require("../helpers/weak-reference-map");
var updateDeepExceptIdentity = require("can-diff/update-deep-except-identity/update-deep-except-identity");
var idMerge = require("../helpers/id-merge");
var behavior = require("../behavior");

module.exports = behavior("constructor",function(baseConnection){

	var behavior = {
		// stores references to instances
		// for now, only during create
		/**
		 * @property {can-connect/helpers/weak-reference-map} can-connect/constructor/constructor.cidStore cidStore
		 * @parent can-connect/constructor/constructor.helpers
		 *
		 * Temporarily hold references to new instances via their [can-cid] while they are undergoing creation.
		 *
		 * @option {can-connect/helpers/weak-reference-map} Temporarily holds references to instances by
		 * [can-cid] when they are in the process of being created and don't yet have an `id`s. This is typically
		 * accessed in `createdData` handlers (e.g [can-connect/real-time/real-time.createdData real-time.createdData]) that
		 * need to lookup the instance that was being created during a particular request.
		 */
		cidStore: new WeakReferenceMap(),
		_cid: 0,

		/**
		 * @function can-connect/constructor/constructor.get get
		 * @parent can-connect/constructor/constructor.crud
		 *
		 * Retrieve a single instance from the connection data source.
		 *
		 * @signature `connection.get(params)`
		 *
		 * Retrieves instance data from [can-connect/connection.getData], runs the resulting data through
		 * [can-connect/constructor/constructor.hydrateInstance], creating a typed instance with the retrieved data.
		 *
		 * @param {Object} params data specifying the instance to retrieve.  Normally, this is something like like:
		 * `{id: 5}`.
		 *
		 * @return {Promise<can-connect/Instance>} `Promise` resolving to the instance returned by
		 * [can-connect/constructor/constructor.hydrateInstance].
		 *
		 * ### Usage
		 *
		 * Call `.get()` with the parameters that identify the instance you want to load.  `.get()` will return a promise
		 * that resolves to that instance:
		 * ```js
		 * todoConnection.get({id: 6}).then(function(todo){
		 *   todo.id; // 6
		 *   todo.name; // 'Take out the garbage'
		 * });
		 * ```
		 *
		 * `.get()` above will call [can-connect/connection.getData `getData`] on the [can-connect/data/url/url]
		 * behavior, which will make an HTTP GET request to `/todos/6`.
		 */
		get: function(params) {
			var self = this;
			return this.getData(params).then(function(data){
				return self.hydrateInstance(data);
			});
		},

		/**
		 * @function can-connect/constructor/constructor.getList getList
		 * @parent can-connect/constructor/constructor.crud
		 *
		 * Retrieve a list of instances from the connection data source.
		 *
		 * @signature `connection.getList(set)`
		 *
		 * Retrieves list data from [can-connect/connection.getListData] and runs the resulting data through
		 * [can-connect/constructor/constructor.hydrateList], creating a typed list of typed instances from  the retrieved
		 * data.
		 *
		 * @param {can-query-logic/query} query data specifying the range of instances to retrieve. This might look something like:
		 * ```{start: 0, end: 50, due: 'today'}```
		 *
		 * @return {Promise<can-connect.List<can-connect/Instance>>} `Promise` resolving to the typed list returned by
		 * [can-connect/constructor/constructor.hydrateList].
		 *
		 * ### Usage
		 *
		 * Call `getList` with the parameters that specify the set of data you want to load.  `.getList()` will return
		 * a promise that resolves to a [can-connect.List] created from that set.
		 *
		 * ```js
		 * todoConnection.getList({due: 'today'}).then(function(todos){
		 *   todos[0].name; // 'Take out the garbage'
		 *   todos[0].due > startOfDay && todos[0].due < endOfDay; // true
		 * })
		 * ```
		 *
		 */
		getList: function(set) {
			set = set ||  {};
			var self = this;
			return this.getListData( set ).then(function(data){
				return self.hydrateList(data, set);
			});
		},


		/**
		 * @function can-connect/constructor/constructor.hydrateList hydrateList
		 * @parent can-connect/constructor/constructor.hydrators
		 *
		 * Produce a typed list from the provided raw list data.
		 *
		 * @signature `connection.hydrateList(listData, set)`
		 *
		 *   Call [can-connect/constructor/constructor.hydrateInstance] for each item in the raw list data, and then call
		 *   [can-connect/constructor/constructor.list] with an array of the typed instances returned from
		 *   [can-connect/constructor/constructor.hydrateInstance] .  If [can-connect/constructor/constructor.list] is not
		 *   provided as an argument or implemented by another behavior, a normal array is created.
		 *
		 *   @param {can-connect.listData} listData the raw list data returned by the data source, often via [can-connect/connection.getListData]
		 *   @param {can-query-logic/query} query description of the set of data `listData` represents
		 *
		 *   @return {can-connect.List} a typed list containing typed instances generated from `listData`
		 */
		hydrateList: function(listData, set){
			if(Array.isArray(listData)) {
				listData = {data: listData};
			}

			var arr = [];
			for(var i = 0; i < listData.data.length; i++) {
				arr.push( this.hydrateInstance(listData.data[i]) );
			}
			listData.data = arr;
			if(this.list) {
				return this.list(listData, set);
			} else {
				var list = listData.data.slice(0);
				list[this.listQueryProp || "__listQuery"] = set;
				copyMetadata(listData, list);
				return list;
			}
		},

		/**
		 * @function can-connect/constructor/constructor.hydrateInstance hydrateInstance
		 * @parent can-connect/constructor/constructor.hydrators
		 *
		 * Produce a typed object containing the provided raw data.
		 *
		 * @signature `connection.hydrateInstance(props)`
		 *
		 * If [can-connect/constructor/constructor.instance] has been passed as an option, or defined by another behavior,
		 * pass `props` to it and return the value. Otherwise, return a clone of `props`.
		 *
		 * @param {Object} props the raw instance data returned by the data source, often via [can-connect/connection.getData]
		 * @return {can-connect/Instance} a typed instance containing the data from `props`
		 */
		hydrateInstance: function(props){
			if(this.instance) {
				return this.instance(props);
			}  else {
				return assign({}, props);
			}
		},
		/**
		 * @function can-connect/constructor/constructor.save save
		 * @parent can-connect/constructor/constructor.crud
		 *
		 * @description Create or update an instance on the connection data source
		 *
		 * @signature `connection.save( instance )`
		 *
		 *   First checks if the instance has an [can-connect/base/base.id] or not.  If it has an id, the instance will be
		 *   updated; otherwise, it will be created.
		 *
		 *   When creating an instance, the instance is added to the [can-connect/constructor/constructor.cidStore], and its
		 *   [can-connect/constructor/constructor.serializeInstance serialized data] is passed to
		 *   [can-connect/connection.createData].  If `createData`'s promise resolves to anything other than `undefined`,
		 *   [can-connect/constructor/constructor.createdInstance] is called with that data.
		 *
		 *   When updating an instance, its [can-connect/constructor/constructor.serializeInstance serialized data] is
		 *   passed to [can-connect/connection.updateData]. If `updateData`'s promise resolves to anything other than
		 *   `undefined`, [can-connect/constructor/constructor.updatedInstance] is called with that data.
		 *
		 *   @param {can-connect/Instance} instance the instance to create or save
		 *
		 *   @return {Promise<can-connect/Instance>} `Promise` resolving to the same instance that was passed to `save`
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * To use `save` to create an instance, create a connection, then an instance, and call `.save()` on it:
		 *
		 * ```js
		 * // Create a connection
	     * var constructor = require('can-connect/constructor/');
		 * var dataUrl = require('can-connect/data/url/');
		 * var todoConnection = connect([dataUrl, constructor], {
		 *   url: "/todos"
		 * });
		 *
		 * // Create an instance
		 * var todo = {name: "do dishes"};
		 *
		 * // Call .save()
		 * todoConnection.save(todo)
		 * ```
		 *
		 * `.save(todo)` above will call [can-connect/data/url/url.createData `createData`] on the [can-connect/data/url/url]
		 * behavior, which will make an HTTP POST request to `/todos` with the serialized `todo` data.  The server response
		 * data may look something like:
		 *
		 * ```js
		 * {
		 *  id: 5,
		 *  ownerId: 9
		 * }
		 * ```
		 *
		 * That data will be passed to [can-connect/constructor/constructor.createdInstance] which by default
		 * adds those properties to `todo`, resulting in `todo` looking like:
		 *
		 * ```js
		 * {
		 *  name: "do dishes",
		 *  id: 5,
		 *  ownerId: 9
		 * }
		 * ```
		 *
		 * As an example of updating an instance, change a property on `todo` and call `.save()` again:
		 *
		 * ```js
		 * // Change a property
		 * todo.name = "Do dishes now!!";
		 *
		 * // Call .save()
		 * todoConnection.save(todo)
		 * ```
		 *
		 * The `.save(todo)` above will call [can-connect/data/url/url.updateData `updateData`] on the
		 * [can-connect/data/url/url] behavior, which will make an HTTP PUT request to `/todos` with the serialized `todo`
		 * data.
		 *
		 * A successful server response body should look something like:
		 *
		 * ```js
		 * {
		 *  name: "Do dishes now!!",
		 *  id: 5,
		 *  ownerId: 9
		 * }
		 * ```
		 *
		 * This data will be passed to [can-connect/constructor/constructor.updatedInstance] which by default sets
		 * all of `todo`'s properties to look like the response data, even removing properties that are missing from the
		 * response data.
		 */
		save: function(instance){
			var serialized = this.serializeInstance(instance);
			var id = this.id(instance);
			var self = this;
			if(id === undefined) {
				// If `id` is undefined, we are creating this instance.
				// It should be given a local id and temporarily added to the cidStore
				// so other hooks can get back the instance that's being created.
				var cid = this._cid++;
				// cid is really a token to be able to reference this transaction.
				this.cidStore.addReference(cid, instance);

				// Call the data layer.
				// If the data returned is undefined, don't call `createdInstance`
				return this.createData(serialized, cid).then(function(data){
					// if undefined is returned, this can't be created, or someone has taken care of it
					if(data !== undefined) {
						self.createdInstance(instance, data);
					}
					self.cidStore.deleteReference(cid, instance);
					return instance;
				});
			} else {
				return this.updateData(serialized).then(function(data){
					if(data !== undefined) {
						self.updatedInstance(instance, data);
					}
					return instance;
				});
			}
		},
		/**
		 * @function can-connect/constructor/constructor.destroy destroy
		 * @parent can-connect/constructor/constructor.crud
		 * @description Delete an instance from the connection data source
		 *
		 * @signature `connection.destroy( instance )`
		 *
		 *   To destroy an instance, it's [can-connect/constructor/constructor.serializeInstance serialized data] is passed
		 *   to [can-connect/connection.destroyData]. If [can-connect/connection.destroyData]'s promise resolves to anything
		 *   other than `undefined`, [can-connect/constructor/constructor.destroyedInstance] is called.
		 *
		 *   @param {can-connect/Instance} instance the instance being deleted from the data source
		 *
		 *   @return {Promise<can-connect/Instance>} `Promise` resolving to the same instance that was passed to `destroy`
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * To use `destroy`, create a connection, retrieve an instance, and then call `.destroy()` with it.
		 *
		 * ```js
		 * // create a connection
		 * var constructor = require('can-connect/constructor/');
		 * var dataUrl = require('can-connect/data/url/');
		 * var todoConnection = connect([dataUrl, constructor], {
		 *   url: "/todos"
		 * })
		 *
		 * // retrieve a todo instance
		 * todoConnection.get({id: 5}).then(function(todo){
		 *   // Call .destroy():
		 *   todoConnection.destroy(todo)
		 * });
		 * ```
		 *
		 * `.destroy()` above will call [can-connect/connection.destroyData `destroyData`] on the [can-connect/data/url/url]
		 * behavior, which will make an HTTP DELETE request to `/todos/5` with the serialized `todo` data.  The server
		 * response data may look something like:
		 *
		 * ```js
		 * {
		 *   deleted: true
		 * }
		 * ```
		 *
		 * That response data will be passed to [can-connect/constructor/constructor.destroyedInstance], which by default
		 * adds those properties to `todo`.
		 */
		// ## destroy
		// Calls the data interface `destroyData` and as long as it
		// returns something, uses that data to call `destroyedInstance`.
		destroy: function(instance){
			var serialized = this.serializeInstance(instance),
				self = this,
				id = this.id(instance);

			if (id !== undefined) {
				return this.destroyData(serialized).then(function (data) {
					if (data !== undefined) {
						self.destroyedInstance(instance, data);
					}
					return instance;
				});
			} else {
				this.destroyedInstance(instance, {});
				return Promise.resolve(instance);
			}
		},

		/**
		 * @function can-connect/constructor/constructor.createdInstance createdInstance
		 * @parent can-connect/constructor/constructor.callbacks
		 *
		 * A method run whenever a new instance has been saved to the data source. Updates the instance with response data.
		 *
		 * @signature `connection.createdInstance( instance, props )`
		 *
		 * `createdInstance` is run whenever a new instance is saved to the data source. This implementation updates the
		 * instance with the data returned by [can-connect/connection.createData] which made the request to save the raw
		 * instance data.
		 *
		 * @param {can-connect/Instance} instance the instance that was created
		 * @param {Object} props the data returned from [can-connect/connection.createData] that will update the properties of `instance`
		 */
		createdInstance: function(instance, props){
			assign(instance, props);
		},

		/**
		 * @function can-connect/constructor/constructor.updatedInstance updatedInstance
		 * @parent can-connect/constructor/constructor.callbacks
		 *
		 * A method run whenever an existing instance has been saved to the data source. Overwrites the instance with response
		 * data.
		 *
		 * @signature `connection.updatedInstance( instance, props )`
		 *
		 * `updatedInstance` is run whenever an existing instance is saved to the data source. This implementation overwrites
		 * the instance with the data returned bu [can-connect/connection.updatedData] which made the request to save the
		 * modified instance data.
		 *
		 * @param {can-connect/Instance} instance the instance that was updated
		 * @param {Object} props the data from [can-connect/connection.updateData] that will overwrite the properties of `instance`
		 */
		updatedInstance: function(instance, data){
			updateDeepExceptIdentity(instance, data, this.queryLogic.schema);
		},

		/**
		 * @function can-connect/constructor/constructor.updatedList updatedList
		 * @parent can-connect/constructor/constructor.callbacks
		 *
		 * A method run whenever new data for an existing list is retrieved from the data source. Updates the list to
		 * include the new data.
		 *
		 * @signature `connection.updatedList( list, listData, set )`
		 *
		 * [can-connect/constructor/constructor.hydrateInstance Hydrates instances] from `listData`'s data and attempts to
		 * merge them into `list`.  The merge is able to identify simple insertions and removals of elements instead of
		 * replacing the entire list.
		 *
		 * @param {can-connect/Instance} list an existing list
		 * @param {can-connect.listData} listData raw data that should be included as part of `list` after conversion to typed instances
		 * @param {can-query-logic/query} query description of the set of data `list` represents
		 */
		updatedList: function(list, listData, set) {
			var instanceList = [];
			for(var i = 0; i < listData.data.length; i++) {
				instanceList.push( this.hydrateInstance(listData.data[i]) );
			}
			// This only works with "referenced" instances because it will not
			// update and assume the instance is already updated
			// this could be overwritten so that if the ids match, then a merge of properties takes place
			idMerge(list, instanceList, this.id.bind(this), this.hydrateInstance.bind(this));

			copyMetadata(listData, list);
		},

		/**
		 * @function can-connect/constructor/constructor.destroyedInstance destroyedInstance
		 * @parent can-connect/constructor/constructor.callbacks
		 *
		 * A method run whenever an instance has been deleted from the data source. Overwrites the instance with response data.
		 *
		 * @signature `connection.destroyedInstance( instance, props )`
		 *
		 * `destroyedInstance` is run whenever an existing instance is deleted from the data source. This implementation
		 * overwrites the instance with the data returned by [can-connect/connection.destroyData] which made the request to
		 * delete the raw instance data.
		 *
		 * @param {can-connect/Instance} instance the instance that was deleted
		 * @param {Object} props the data returned from [can-connect/connection.destroyData] that will overwrite the
		 * properties of `instance`
		 */
		destroyedInstance: function(instance, data){
			updateDeepExceptIdentity(instance, data, this.queryLogic.schema);
		},

		/**
		 * @function can-connect/constructor/constructor.serializeInstance serializeInstance
		 * @parent can-connect/constructor/constructor.serializers
		 *
		 * @description Generate the serialized form of a typed instance.
		 *
		 * @signature `connection.serializeInstance( instance )`
		 *
		 *   Generate a raw object representation of a typed instance. This default implementation simply clones the
		 *   `instance` object, copying all the properties of the object (excluding properties of it's prototypes) to a new
		 *   object. This is equivalent to `Object.assign({}, instance)`.
		 *
		 * @param {can-connect/Instance} instance the instance to serialize
		 * @return {Object} a serialized representation of the instance
		 */
		serializeInstance: function(instance){
			return assign({}, instance);
		},

		/**
		 * @function can-connect/constructor/constructor.serializeList serializeList
		 * @parent can-connect/constructor/constructor.serializers
		 *
		 * @description Generate the serialized form of a typed list.
		 *
		 * @signature `connection.serializeList( list )`
		 *
		 *   Generate a raw array representation of a typed list. This default implementation simply returns a plain `Array`
		 *   containing the result of calling [can-connect/constructor/constructor.serializeInstance] on each item in the
		 *   typed list.
		 *
		 * @param {can-connect.List} list The instance to serialize.
		 * @return {Object|Array} A serialized representation of the list.
		 */
		serializeList: function(list){
			var self = this;
			return makeArray(list).map(function(instance){
				return self.serializeInstance(instance);
			});
		},

		/**
		 * @function can-connect/constructor/constructor.isNew isNew
		 * @parent can-connect/constructor/constructor.helpers
		 *
		 * Returns if the instance has not been loaded from or saved to the data source.
		 *
		 * @signature `connection.isNew(instance)`
		 * @param {Object} instance the instance to test
		 * @return {Boolean} `true` if [can-connect/base/base.id] is `null` or `undefined`
		 */
		isNew: function(instance){
			var id = this.id(instance);
			return !(id || id === 0);
		}

		/**
		 * @property can-connect/constructor/constructor.list list
		 * @parent can-connect/constructor/constructor.options
		 *
		 * Behavior option provided to create a typed list from a raw array.
		 *
		 * @signature `connection.list( listData, set )`
		 *
		 * Takes a `listData` argument with a `data` property, that is an array of typed instances, each produced by
		 * [can-connect/constructor/constructor.hydrateInstance], and returns a new typed list containing those typed
		 * instances.
		 * This method is passed as an option to the connection.
		 * Called by [can-connect/constructor/constructor.hydrateList].
		 *
		 * @param {can-connect.listData} listData an object with a `data` property, which is an array of instances.
		 * @param {can-query-logic/query} query the set description of this list
		 * @return {can-connect.List} a typed list type containing the typed instances
		 *
		 * ### Usage
		 *
		 * The following example makes the connection produce `MyList` typed lists including a `completed` method:
		 *
		 * ```js
		 * var constructor = require("can-connect/constructor/");
		 * var dataUrl = require("can-connect/data/url/");
		 *
		 * // define custom list type constructor
		 * var MyList = function(items) {
		 *  this.push.apply(this, items);
		 * }
		 * // inherit Array functionality
		 * MyList.prototype = Object.create(Array.prototype);
		 * // add custom methods to new list type
		 * MyList.prototype.completed = function(){
		 *  return this.filter(function(){ return this.completed });
		 * };
		 *
		 * // create connection
		 * var todosConnection = connect([constructor, dataUrl], {
		 *   url: "/todos",
		 *   list: function(listData, set){
		 *     // create custom list instance
		 *     var collection = new MyList(listData.data);
		 *     // add set info for use by other behaviors
		 *     collection.__listQuery = set;
		 *     return collection;
		 *   }
		 * });
		 *
		 * // use connection to get typed list & use custom method
		 * todosConnection.getList({}).then(function(todoList){
		 *   console.log("There are", todoList.completed().length, "completed todos");
		 * });
		 * ```
		 *
		 * **Note:** we added the [can-connect/base/base.listQueryProp] property (`Symbol.for("can.listQuery")` by default) on the list. This is
		 * expected by other behaviors.
		 */

		/**
		 * @property can-connect/constructor/constructor.instance instance
		 * @parent can-connect/constructor/constructor.options
		 *
		 * Behavior option provided to create a typed form of passed raw data.
		 *
		 * @signature `connection.instance( props )`
		 *
		 * Creates a typed instance for the passed raw data object. This method is passed as an option to the connection.
		 * Called by [can-connect/constructor/constructor.hydrateInstance].
		 *
		 * @param {Object} props a raw object containing the properties from the data source
		 * @return {can-connect/Instance} the typed instance created from the passed `props` object
		 *
		 * ### Usage
		 *
		 * The following example makes the connection produce `Todo` typed objects including a `complete` method:
		 *
		 * ```js
		 * var constructor = require("can-connect/constructor/");
		 * var dataUrl = require("can-connect/data/url/");
		 *
		 * // define type constructor
		 * var Todo = function(rawData){
		 *   // add raw data to new instance
		 *   Object.assign(this, rawData);
		 * };
		 *
		 * // add methods to custom type
		 * Todo.prototype.complete = function(){
		 *   this.completed = true;
		 * }
		 *
		 * // create connection
		 * var todosConnection = connect([constructor, dataUrl], {
		 *   url: "/todos",
		 *   instance: function(rawData) {
		 *     return new Todo(rawData);
		 *   }
		 * });
		 *
		 * // use connection to get typed instance & use custom method
		 * todosConnection.get({id: 5}).then(function(todo){
		 *   todo.completed; // false
		 *   todo.complete();
		 *   todo.completed; // true
		 * });
		 * ```
		 *
		 */
	};

	return behavior;

});

function copyMetadata(listData, list){
	for(var prop in listData) {
		if(prop !== "data") {
			// this is map infultrating constructor, but it's alright here.
			if(typeof list.set === "function") {
				list.set(prop, listData[prop]);
			} else if(typeof list.attr === "function") {
				list.attr(prop, listData[prop]);
			} else {
				list[prop] = listData[prop];
			}

		}
	}
}
