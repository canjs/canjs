"use strict";

var canReflect = require("can-reflect");
var each = canReflect.each;
var isPlainObject = canReflect.isPlainObject;

var queues = require("can-queues");
var eventQueue = require("can-event-queue/map/map");
var canSymbol = require("can-symbol");
var QueryLogic = require("can-query-logic");

var dev = require("can-log/dev/dev");

var behavior = require("../../behavior");
var updateDeepExceptIdentity = require("can-diff/update-deep-except-identity/update-deep-except-identity");
var assignDeepExceptIdentity = require("can-diff/assign-deep-except-identity/assign-deep-except-identity");
var smartMerge = require('can-diff/merge-deep/merge-deep');
var canSymbol = require("can-symbol");
var getNameSymbol = canSymbol.for("can.getName");

function smartMergeExceptIdentity(dest, source, schema) {
	if(!schema) {
        schema = canReflect.getSchema(dest);
    }
    if(!schema) {
        throw new Error("can-connect/can/map/ is unable to update without a schema.");
    }
	schema.identity.forEach(function(key){
        var id = canReflect.getKeyValue(dest, key);
        if(id!== undefined) {
            canReflect.setKeyValue(source, key, id );
        }
    });
	smartMerge(dest, source);
}

var canMapBehavior = behavior("can/map",function(baseConnection){

	// overwrite
	var behavior = {
		init: function(){
			if(!this.Map) {
				if (this.ObjectType) {
					this.Map = this.ObjectType;
				} else {
					throw new Error("can-connect/can/map/map must be configured with a Map or ObjectType type");
				}
			}
			if(!this[getNameSymbol]) {
				this[getNameSymbol] = function(){
					if(this.name) {
						return "Connection{"+this.name+"}";
					} else if(this.Map) {
						return "Connection{"+canReflect.getName(this.Map)+"}";
					} else if(typeof this.url === "string") {
						return "Connection{"+this.url+"}";
					} else {
						return "Connection{}";
					}
				};
			}

			this.List = this.List || this.ArrayType || this.Map.List;
			var hasList = Boolean(this.List);

			if (!hasList) {
				Object.defineProperty(this, 'List', {
					get: function () {
						throw new Error("can-connect/can/map/map - "+canReflect.getName(this)+" should be configured with an ArrayType or List type.");
					}
				});
			}

			overwrite(this, this.Map, mapOverwrites);
			if (hasList) {
				overwrite(this, this.List, listOverwrites);
			}

			if(!this.queryLogic) {
				this.queryLogic = new QueryLogic(this.Map);
			}


			var connection = this;

			// ### Setup store updates
			if(this.Map[canSymbol.for("can.onInstanceBoundChange")]) {
				var canConnectMap_onMapBoundChange = function (instance, isBound){
					var method = isBound ? "addInstanceReference" : "deleteInstanceReference";
					if(connection[method]) {
						connection[method](instance);
					}
				};
				//!steal-remove-start
				Object.defineProperty(canConnectMap_onMapBoundChange, "name", {
					value: canReflect.getName(this.Map) + " boundChange",
					configurable: true
				});
				//!steal-remove-end
				this.Map[canSymbol.for("can.onInstanceBoundChange")](canConnectMap_onMapBoundChange);
			} else {
				console.warn("can-connect/can/map is unable to listen to onInstanceBoundChange on the Map type");
			}

			if (hasList) {
				if(this.List[canSymbol.for("can.onInstanceBoundChange")]) {
					var canConnectMap_onListBoundChange = function(list, isBound){
						var method = isBound ? "addListReference" : "deleteListReference";
						if(connection[method]) {
							connection[method](list);
						}
					};
					//!steal-remove-start
					Object.defineProperty(canConnectMap_onListBoundChange, "name", {
						value: canReflect.getName(this.List) + " boundChange",
						configurable: true
					});
					//!steal-remove-end
					this.List[canSymbol.for("can.onInstanceBoundChange")](canConnectMap_onListBoundChange);
				} else {
					console.warn("can-connect/can/map is unable to listen to onInstanceBoundChange on the List type");
				}
			}

			// Adds the instance when its `id` property is set
			if(this.Map[canSymbol.for("can.onInstancePatches")]) {
				this.Map[canSymbol.for("can.onInstancePatches")](function canConnectMap_onInstancePatches(instance, patches){
					patches.forEach(function(patch){
						if( (patch.type === "add" || patch.type === "set") &&
							patch.key === connection.idProp &&
							instance[canSymbol.for("can.isBound")]()) {
							connection.addInstanceReference(instance);
						}
					});
				});
			} else {
				console.warn("can-connect/can/map is unable to listen to onInstancePatches on the Map type");
			}
			baseConnection.init.apply(this, arguments);
		},
		/**
		 * @function can-connect/can/map/map.serializeInstance serializeInstance
		 * @parent can-connect/can/map/map.serializers
		 *
		 * Returns the properties of an instance that should be sent to the data source when saving. Done by calling
		 * [can-define/map/map.prototype.serialize `instance.serialize()`].
		 *
		 * @signature `connection.serializeInstance(instance)`
		 * Simply calls [can-define/map/map.prototype.serialize] on the `instance` argument.
		 *
		 * @param {can-connect/can/map/map._Map} instance the instance to serialize
		 * @return {Object} the result of calling [can-define/map/map.prototype.serialize `instance.serialize()`]
		 */
		serializeInstance: function(instance){
			return canReflect.serialize(instance);
		},
		/**
		 * @function can-connect/can/map/map.serializeList serializeList
		 * @parent can-connect/can/map/map.serializers
		 *
		 * Returns the properties of a list that should be sent to the data source when saving. Done by calling
		 * [can-define/list/list.prototype.serialize `list.serialize()`].
		 *
		 * @signature `connection.serializeList(list)`
		 * Simply calls [can-define/list/list.prototype.serialize] on the `list` argument.
		 *
		 * @param {can-connect/can/map/map._List} list the list to serialize
		 * @return {Object} the result of calling [can-define/list/list.prototype.serialize `list.serialize()`]
		 */
		serializeList: function(list){
			return canReflect.serialize(list);
		},
		/**
		 * @property {Boolean} can-connect/can/map/map.updateInstanceWithAssignDeep updateInstanceWithAssignDeep
		 * @parent can-connect/can/map/map.options
		 *
		 * Use the response from `save()` and `destroy()` to assign properties, never delete them.
		 *
		 * @option {Boolean}
		 *
		 * Setting `updateInstanceWithAssignDeep` to `true` changes how instances get updated. Instead of using
		 * [can-diff/merge-deep/merge-deep], records will be updated with [can-reflect.assignDeep].
		 *
		 * The following example shows that the response from `.save()` only includes the `id`
		 * property. Normally, this would delete all other properties (`name`).  But setting `updateInstanceWithAssignDeep`
		 * to `true` prevents this:
		 *
		 * **Usage:**
		 *
		 * ```js
		 * import {DefineMap, restModel} from "can";
		 *
		 * var Todo = DefineMap.extend({
		 *   id: {type: "number", identity: true},
		 *   name: "string"
		 * });
		 *
		 * // restModel uses `can-connect/can/map/map`
		 * restModel({
		 *   Map: Todo,
		 *   url: "/todos",
		 *   updateInstanceWithAssignDeep: true
		 * });
		 *
		 *
		 * var todo = new Todo({name: "learn canjs"})
		 *
		 * var savePromise = todo.save()
		 * // SERVER SENDS
		 * // -> POST /todos {name: "learn canjs"}
		 *
		 * // SERVER RESPONDS WITH:
		 * // <- {id: 5}
		 *
		 * savePromise.then(function(){
		 *   // Name still exists even though the server did not
		 *   // respond with it.
		 *   todo.name //-> "learn canjs"
		 * })
		 * ```
		 *
		 * __NOTE__: [can-diff/merge-deep/merge-deep] is able to work _MUCH_ better with nested
		 * data than [can-reflect.assignDeep]. Specifically, it is able to better
		 * prevent overwriting one instance's data with another. The _Use_ section of [can-diff/merge-deep/merge-deep]
		 * goes over this ability. Make sure you understand its capabilities before turning it off.
		 */

		/**
		 * @property {connection.Map} can-connect/can/map/map._Map Map
		 * @parent can-connect/can/map/map.options
		 *
		 * Specify the type of the `[can-define/map/map DefineMap]` that should be instantiated by the connection.
		 *
		 * @option {connection.Map}
		 *
		 * **Usage:**
		 *
		 * ```js
		 * var DefineMap = require("can-define/map/map");
		 * var canMap = require("can-connect/can/map/map");
		 * var constructor = require("can-connect/constructor/constructor");
		 * var dataUrl = require("can-connect/data/url/url");
		 *
		 * var Todo = DefineMap.extend({
		 *   completed: "boolean",
		 *   complete: function(){
		 *     this.completed = true
		 *   }
		 * });
		 *
		 * var todoConnection = connect([dataUrl, constructor, canMap], {
		 *   Map: Todo,
		 *   url: "/todos"
		 * });
		 *
		 * todoConnect.get({id:1}).then(function(item) {
		 *   item instanceof Todo // true
		 * });
		 * ```
		 */

		/**
		 * @property {connection.List} can-connect/can/map/map._List List
		 * @parent can-connect/can/map/map.options
		 *
		 * Specify the type of the `[can-define/list/list DefineList]` that should be instantiated by the connection.
		 *
		 * @option {connection.List} If this option is not specified it defaults to the [can-connect/can/map/map._Map Map].List
		 * property.
		 *
		 * **Usage:**
		 * ```js
		 * var DefineMap = require("can-define/map/map");
		 * var DefineList = require("can-define/list/list");
		 * var canMap = require("can-connect/can/map/map");
		 * var constructor = require("can-connect/constructor/constructor");
		 * var dataUrl = require("can-connect/data/url/url");
		 *
		 * var Todo = DefineMap.extend({
		 *   completed: "boolean",
		 *   complete: function(){
		 *     this.completed = true
		 *   }
		 * });
		 *
		 * var Todo.List = DefineList.extend({
		 *   "#": Todo,
		 *   completed: function(){
		 *     this.filter(function(todo){
		 *       return todo.completed;
		 *     });
		 *   }
		 * });
		 *
		 * var todoConnection = connect([dataUrl, constructor, canMap],{
		 *   Map: Todo,
		 *   List: Todo.List,
		 *   url: "/todos"
		 * });
		 *
		 * todoConnection.getList({}).then(function(list) {
		 *   list instanceOf Todo.List // true
		 * })
		 * ```
		 *
		 */

		/**
		 * @function can-connect/can/map/map.instance instance
		 * @parent can-connect/can/map/map.hydrators
		 *
		 * Creates a [can-connect/can/map/map._Map] instance given raw data.
		 *
		 * @signature `connection.instance(props)`
		 *
		 *   Create an instance of [can-connect/can/map/map._Map].
		 *
		 *   @param {Object} props the raw instance data.
		 *   @return [can-connect/can/map/map._Map] a [can-connect/can/map/map._Map] instance containing the `props`.
		 */
		instance: function(props){
			var _Map = this.Map;
			return new _Map(props);
		},

		/**
		 * @function can-connect/can/map/map.list list
		 * @parent can-connect/can/map/map.hydrators
		 *
		 * Creates a [can-connect/can/map/map._List] instance given raw data.
		 *
		 * @signature `connection.list(listData, set)`
		 *
		 *   Creates an instance of [can-connect/can/map/map._List] if available, otherwise creates
		 *   [can-connect/can/map/map._Map].List if available.
		 *
		 *   This will add properties on the raw `listData` array to the created list instance. e.g:
		 *   ```js
		 *   var listData = [{id: 1, name:"do dishes"}, ...];
		 *   listData.loadedFrom; // "shard 5"
		 *
		 *   var todoList = todoConnection.list(listData, {});
		 *   todoList.loadedFrom; // "shard 5"
		 *   ```
		 *
		 *   @param {can-connect.listData} listData the raw list data.
		 *   @param {can-query-logic/query} query the set the data belongs to.
		 *   @return {can-connect.List} a [can-connect/can/map/map._List] instance containing instances of
		 *   [can-connect/can/map/map._Map] built from the list items in `listData`.
		 */
		list: function(listData, set){
			var _List = this.List || (this.Map && this.Map.List);
			var list = canReflect.new(_List, listData.data);
			canReflect.eachKey(listData, function (val, prop) {
				if (prop !== 'data') {
					canReflect.setKeyValue(list, prop, val);
				}
			});

			list[this.listQueryProp] = set;
			return list;
		},

		/**
		 * @function can-connect/can/map/map.updatedList updatedList
		 * @parent can-connect/can/map/map.instance-callbacks
		 *
		 * Implements the [can-connect/constructor/constructor.updatedList] callback so it updates the list and it's items
		 * during a single [can-event/batch/batch batched event].
		 *
		 * @signature `connection.updatedList(list, listData, set)`
		 *
		 *   Updates the list and the items within it during a single [can-event/batch/batch batched event].
		 *
		 *   @param {can-connect.List} list the list to be updated.
		 *   @param {can-connect.listData} listData raw list data.
		 *   @param {can-query-logic/query} query the set of the list being updated.
		 */
		updatedList: function(list, listData, set){
			queues.batch.start();
			var enqueueOptions = {};
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				enqueueOptions = {
    				reasonLog: ["set", set,"list", list,"updated with", listData]
  				};
			}
			//!steal-remove-end

			queues.mutateQueue.enqueue(baseConnection.updatedList, this, arguments, enqueueOptions);
			queues.batch.stop();

		},
		save: function(instance){
			canReflect.setKeyValue(instance, "_saving", true);
			//canEvent.dispatch.call(instance, "_saving", [true, false]);
			var done = function(){
				canReflect.setKeyValue(instance, "_saving", false);
				//canEvent.dispatch.call(instance, "_saving", [false, true]);
			};
			var base = baseConnection.save.apply(this, arguments);
			base.then(done,done);
			return base;
		},
		destroy: function(instance){
			canReflect.setKeyValue(instance, "_destroying", true);
			//canEvent.dispatch.call(instance, "_destroying", [true, false]);
			var done = function(){
				canReflect.setKeyValue(instance, "_destroying", false);
				//canEvent.dispatch.call(instance, "_destroying", [false, true]);
			};
			var base = baseConnection.destroy.apply(this, arguments);
			base.then(done,done);
			return base;
		}
	};

	each([
		/**
		 * @function can-connect/can/map/map.createdInstance createdInstance
		 * @parent can-connect/can/map/map.instance-callbacks
		 *
		 * Implements the [can-connect/constructor/constructor.createdInstance] callback so it dispatches an event and
		 * updates the instance.
		 *
		 * @signature `connection.createdInstance(instance, props)`
		 *
		 *   Updates the instance with `props` and dispatches a "created" event on the instance and the instances's
		 *   constructor function ([can-connect/can/map/map._Map]).
		 *
		 *   Calls [can-connect/constructor/store/store.stores.moveCreatedInstanceToInstanceStore] to ensure new instances
		 *   are moved into the [can-connect/constructor/store/store.instanceStore] after being saved.
		 *
		 *   @param {can-connect/can/map/map._Map} instance a [can-connect/can/map/map._Map] instance
		 *   @param {Object} props the data in the response from [can-connect/connection.createData]
		 */
		"created",
		/**
		 * @function can-connect/can/map/map.updatedInstance updatedInstance
		 * @parent can-connect/can/map/map.instance-callbacks
		 *
		 * Implements the [can-connect/constructor/constructor.updatedInstance] callback so it dispatches an event and
		 * updates the instance.
		 *
		 * @signature `connection.updatedInstance(instance, props)`
		 *
		 *   Updates the instance with `props` and dispatches an "updated" event on the instance and the instances's
		 *   constructor function ([can-connect/can/map/map._Map]).
		 *
		 *   @param {can-connect/can/map/map._Map} instance a [can-connect/can/map/map._Map] instance
		 *   @param {Object} props the data in the response from [can-connect/connection.updateData]
		 */
		"updated",
		/**
		 * @function can-connect/can/map/map.destroyedInstance destroyedInstance
		 * @parent can-connect/can/map/map.instance-callbacks
		 *
		 * Implements the [can-connect/constructor/constructor.destroyedInstance] callback so it dispatches an event and
		 * updates the instance.
		 *
		 * @signature `connection.destroyedInstance(instance, props)`
		 *
		 *   Updates the instance with `props` and dispatches a "destroyed" event on the instance and the instances's
		 *   constructor function ([can-connect/can/map/map._Map]).
		 *
		 *   @param {can-connect/can/map/map._Map} instance a [can-connect/can/map/map._Map] instance
		 *   @param {Object} props the data in the response from [can-connect/connection.destroyData]
		 */
		"destroyed"
	], function (funcName) {
		// Each of these is pretty much the same, except for the events they trigger.
		behavior[funcName+"Instance"] = function (instance, props) {

			// Update attributes if attributes have been passed
			if(props && typeof props === 'object') {

				if(funcName === "destroyed" && canReflect.size(props) === 0) {
					// If destroy is passed an empty object, ignore update
					// This isn't tested except by can-rest-model.
				} else {
					if(this.constructor.removeAttr) {
						updateDeepExceptIdentity(instance, props, this.queryLogic.schema);
					}
					// this is legacy
					else if(this.updateInstanceWithAssignDeep){
						assignDeepExceptIdentity(instance, props, this.queryLogic.schema);
					}
					else {
						smartMergeExceptIdentity( instance, props, this.queryLogic.schema);
					}
				}

			}
			// This happens in constructor/store, but we don't call base, so we have to do it ourselves.
			if(funcName === "created" && this.moveCreatedInstanceToInstanceStore) {
				this.moveCreatedInstanceToInstanceStore(instance);
			}

			canMapBehavior.callbackInstanceEvents(funcName, instance);
		};
	});


	return behavior;

});

/**
 * @function can-connect/can/map/map.callbackInstanceEvents callbackInstanceEvents
 * @parent can-connect/can/map/map.static
 *
 * Utility function to dispatch events for instance callbacks, e.g. [can-connect/can/map/map.updatedInstance].
 *
 * @signature `connection.callbackInstanceEvents(cbName, instance)`
 *
 *   Used to dispatch events as part of instance callbacks implementations. This method could be useful in other
 *   behaviors that implement instance callbacks. E.g. a behavior overriding the
 *   [can-connect/can/map/map.updatedInstance `updatedInstance`] callback:
 *
 *   ```
 *   connect([canMap, {
 *       updatedInstance: function(instance, props) {
 *           instance = smartMerge(instance, props);
 *           canMapBehavior.callbackInstanceEvents("updated", instance);
 *       }
 *   }], {})
 *   ```
 *
 *   @param {String} eventName name of the the event to be triggered
 *   @param {can-connect/can/map/map._Map} instance a [can-connect/can/map/map._Map] instance.
 */
canMapBehavior.callbackInstanceEvents = function (funcName, instance) {
	var constructor = instance.constructor;

	// triggers change event that bubble's like
	// handler( 'change','1.destroyed' ). This is used
	// to remove items on destroyed from Model Lists.
	// but there should be a better way.
	queues.batch.start();
	eventQueue.dispatch.call(instance, {type: funcName, target: instance});

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		if (this.id) {
			dev.log("can-connect/can/map/map.js - " + (constructor.shortName || this.name) + " " + this.id(instance) + " " + funcName);
		}
	}
	//!steal-remove-end

	// Call event on the instance's Class
	eventQueue.dispatch.call(constructor, funcName, [instance]);
	queues.batch.stop();
};


var mapOverwrites = {
	static: {
		/**
		 * @function can-connect/can/map/map.getList getList
		 * @parent can-connect/can/map/map.map-static
		 *
		 * Retrieve a list of instance.
		 *
		 * @signature `Map.getList(query)`
		 *
		 * `.getList` is added to the configured [can-connect/can/map/map._Map] type. Retrieves a [can-connect/can/map/map._List] of
		 * [can-connect/can/map/map._Map] instances via the connection.
		 *
		 * ```js
		 * // import connection plugins
		 * var canMap = require("can-connect/can/map/map");
		 * var constructor = require("can-connect/constructor/constructor");
		 * var dataUrl = require("can-connect/data/url/url");
		 *
		 * // define connection types
		 * var Todo = DefineMap.extend({
		 *   id: "number",
		 *   complete: "boolean",
		 *   name: "string"
		 * });
		 *
		 * Todo.List = DefineList.extend({
		 *   completed: function() {
		 *     return this.filter(function(item) { return item.completed; });
		 *   }
		 * });
		 *
		 * // create connection
		 * connect([canMap, constructor, dataUrl],{
		 *   Map: Todo,
		 *   url: "/todos"
		 * })
		 *
		 * // retrieve instances
		 * Todo.getList({filter: {due: "today"}}).then(function(todos){
		 *   ...
		 * });
		 * ```
		 *
		 * @param {can-query-logic/query} query Definition of the list being retrieved.
		 * @return {Promise<Map>} `Promise` returning the [can-connect/can/map/map._List] of instances being retrieved
		 *
		 *
		 *
		 *
		 */
		getList: function (base, connection) {
			return function(set) {
				return connection.getList(set);
			};
		},
		/**
		 * @function can-connect/can/map/map.findAll findAll
		 * @parent can-connect/can/map/map.map-static
		 * @hide
		 *
		 * Alias of [can-connect/can/map/map.getList]. You should use `.getList()`.
		 */
		findAll: function (base, connection) {
			return function(set) {
				return connection.getList(set);
			};
		},
		/**
		 * @function can-connect/can/map/map.get get
		 * @parent can-connect/can/map/map.map-static
		 *
		 * Use it to get a single instance by id.
		 *
		 * @signature `Map.get(params)`
		 *
		 * `.get()` is added to the configured [can-connect/can/map/map._Map] type.
		 * Use it to get a single instance by the identity keys of the Map type.
		 *
		 * ```js
		 * // import connection plugins
		 * var canMap = require("can-connect/can/map/map");
		 * var constructor = require("can-connect/constructor/constructor");
		 * var dataUrl = require("can-connect/data/url/url");
		 *
		 * // define connection type
		 * var Todo = DefineMap.extend({
		 *   id: "number",
		 *   complete: "boolean",
		 *   name: "string"
		 * });
		 *
		 * // create connection
		 * connect([canMap, constructor, dataUrl],{
		 *   Map: Todo,
		 *   url: "/todos"
		 * })
		 *
		 * // retrieve instance
		 * Todo.get({id: 5}).then(function(todo){
		 *   ...
		 * });
		 * ```
		 *
		 * @param {Object} params Identifying parameters of the instance to retrieve. Typically, this is an object
		 * with the identity property and its value like: `{_id: 5}`.
		 * @return {Promise<Map>} `Promise` returning the [can-connect/can/map/map._Map] instance being retrieved
		 *
		 * @body
		 *
		 * ## Get a single record by filtering non-identity keys
		 *
		 * Sometimes, you want a single record, but by filtering non-identity keys.  Instead of using
		 * `.get`, use `.getList` like:
		 *
		 * ```js
		 * var firstCompleteTodo = Todo.getList({
		 *   filter: {complete: false},
		 *   page: {start: 0, end: 0}
		 * }).then(function(list){
		 *   return list.length ? list[0] : Promise.reject({message: "reject message"});
		 * });
		 * ```
		 *
		 */
		get: function (base, connection) {
			return function(params) {
				// adds .then for compat
				return connection.get(params);
			};
		},
		/**
		 * @function can-connect/can/map/map.findOne findOne
		 * @parent can-connect/can/map/map.map-static
		 * @hide
		 *
		 * Alias of [can-connect/can/map/map.get]. You should use `.get()`.
		 */
		findOne: function (base, connection) {
			return function(params) {
				// adds .then for compat
				return connection.get(params);
			};
		}
	},
	prototype: {
		isNew: function (base, connection) {
			/**
			 * @function can-connect/can/map/map.prototype.isNew isNew
			 * @parent can-connect/can/map/map.map
			 *
			 * If the data is not in the dat
			 *
			 * @signature `instance.isNew()`
			 *
			 * Returns if the instance has not been loaded from or saved to the data source.
			 *
			 * ```js
			 * connect([...],{
			 *   Map: Todo
			 * });
			 *
			 * var todo = new Todo();
			 * todo.isNew()   //-> true
			 *
			 * todo.save().then(function(){
			 *   todo.isNew() //-> false
			 * })
			 * ```
			 *
			 * @return {Boolean} Returns `true` if [can-connect/base/base.id] is `null` or `undefined`.
			 */
			return function () {
				return connection.isNew(this);
			};
		},

		isSaving: function (base, connection) {
			/**
			 * @function can-connect/can/map/map.prototype.isSaving isSaving
			 * @parent can-connect/can/map/map.map
			 *
			 * Returns if the instance is currently being saved.
			 *
			 * @signature `instance.isSaving()`
			 *
			 * Observes if a promise returned by [can-connect/connection.save `connection.save`] is in progress for this
			 * instance.  This is often used in a template like:
			 *
			 * ```html
			 * <button on:click="todo.save()"
			 *    disabled:from="todo.isSaving()">
			 *   Save Changes
			 * </button>
			 * ```
			 *
			 *   @return {Boolean} Returns `true` if [can-connect/connection.save `connection.save`] has been called for this
			 *   instance but the returned promise has not yet resolved.
			 */
			return function () {
				return !!canReflect.getKeyValue(this,"_saving");
			};
		},

		isDestroying: function (base, connection) {
			/**
			 * @function can-connect/can/map/map.prototype.isDestroying isDestroying
			 * @parent can-connect/can/map/map.map
			 *
			 * Returns if the instance is currently being destroyed.
			 *
			 * @signature `instance.isDestroying()`
			 *
			 * Observes if a promise returned by [can-connect/connection.destroy `connection.destroy`] is in progress for this
			 * instance.  This is often used in a template like:
			 *
			 * ```html
			 * <button on:click="todo.destroy()"
			 *         disabled:from="todo.isDestroying()">
			 *   Delete
			 * </button>
			 * ```
			 *
			 *   @return {Boolean} `true` if [can-connect/connection.destroy `connection.destroy`] has been called for this
			 *   instance but the returned promise has not resolved.
			 */
			return function () {
				return !!canReflect.getKeyValue(this,"_destroying");
			};
		},

		save: function (base, connection) {
			/**
			 * @function can-connect/can/map/map.prototype.save save
			 * @parent can-connect/can/map/map.map
			 *
			 * Save or update client data to the persisted data source.
			 *
			 * @signature `instance.save(success, error)`
			 *
			 * Calls [can-connect/connection.save].
			 *
			 * ```js
			 * // import connection plugins
			 * var canMap = require("can-connect/can/map/map");
			 * var constructor = require("can-connect/constructor/constructor");
			 * var dataUrl = require("can-connect/data/url/url");
			 *
			 * // define connection types
			 * var Todo = DefineMap.extend({
			 *   id: "number",
			 *   complete: "boolean",
			 *   name: "string"
			 * });
			 *
			 * // create connection
			 * connect([canMap, constructor, dataUrl], {
			 *   Map: Todo,
			 *   url: "/todos"
			 * })
			 *
			 * new Todo({name: "dishes"}).save();
			 * ```
			 *
			 *   @param {function} success A function that is called if the save is successful.
			 *   @param {function} error A function that is called if the save is rejected.
			 *   @return {Promise<Instance>} A promise that resolves to the instance if successful.
			 *
			 *
			 */
			return function(success, error){
				// return only one item for compatability
				var promise = connection.save(this);
				promise.then(success,error);
				return promise;
			};
		},
		destroy: function (base, connection) {
			/**
			 * @function can-connect/can/map/map.prototype.destroy destroy
			 * @parent can-connect/can/map/map.map
			 *
			 * Delete an instance from the service via the connection.
			 *
			 * @signature `instance.destroy(success, error)`
			 *
			 * Calls [can-connect/connection.destroy] for the `instance`.
			 *
			 * ```js
			 * // import connection plugins
			 * var canMap = require("can-connect/can/map/map");
			 * var constructor = require("can-connect/constructor/constructor");
			 * var dataUrl = require("can-connect/data/url/url");
			 *
			 * // define connection types
			 * var Todo = DefineMap.extend({
			 *   id: "number",
			 *   complete: "boolean",
			 *   name: "string"
			 * });
			 *
			 * // create connection
			 * connect([canMap, constructor, dataUrl],{
			 *   Map: Todo,
			 *   url: "/todos"
			 * })
			 *
			 * // read instance
			 * Todo.get({id: 5}).then(function(todo){
			 *   if (todo.complete) {
			 *     // delete instance
			 *     todo.destroy();
			 *   }
			 * });
			 * ```
			 *
			 * @param {function} success a function that is called if the [can-connect/connection.destroy] call is successful.
			 * @param {function} error a function that is called if the [can-connect/connection.destroy] call is rejected.
			 * @return {Promise<Instance>} a promise that resolves to the instance if successful
			 *
			 *
			 */
			return function(success, error){
				var promise = connection.destroy(this);
				promise.then(success,error);
				return promise;
			};
		}
	},
	properties: {
		_saving: {enumerable: false, value: false, configurable: true, writable: true},
		_destroying: {enumerable: false, value: false, configurable: true, writable: true}
	}
};

var listOverwrites = {
	static:  {
		_bubbleRule: function(base, connection) {
			return function(eventName, list) {
				var bubbleRules = base(eventName, list);
				bubbleRules.push('destroyed');
				return bubbleRules;
			};
		}
	},
	prototype: {
		setup: function(base, connection){
			return function (params) {
				// If there was a plain object passed to the List constructor,
				// we use those as parameters for an initial getList.
				if (isPlainObject(params) && !Array.isArray(params)) {
					this[connection.listQueryProp] = params;
					base.apply(this);
					this.replace(canReflect.isPromise(params) ? params : connection.getList(params));
				} else {
					// Otherwise, set up the list like normal.
					base.apply(this, arguments);
				}
			};
		}
	},
	properties: {}
};

var overwrite = function( connection, Constructor, overwrites) {
	var prop;
	for(prop in overwrites.properties) {
		canReflect.defineInstanceKey(Constructor, prop, overwrites.properties[prop]);
	}
	for(prop in overwrites.prototype) {
		Constructor.prototype[prop] = overwrites.prototype[prop](Constructor.prototype[prop], connection);
	}
	if(overwrites.static) {
		for(prop in overwrites.static) {
			Constructor[prop] = overwrites.static[prop](Constructor[prop], connection);
		}
	}
};

module.exports = canMapBehavior;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");

	module.exports = validate(
		canMapBehavior,
		[
			'id', 'get', 'updatedList', 'destroy', 'save', 'getList'
		]
	);
}
//!steal-remove-end
