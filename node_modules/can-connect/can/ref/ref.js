"use strict";
/**
 * @module {connect.Behavior} can-connect/can/ref/ref can/ref
 * @parent can-connect.behaviors
 * @group can-connect/can/ref/ref.hydrators hydrators
 * @group can-connect/can/ref/ref.methods methods
 *
 * @description Handle references to instances in the data returned by the server. Allows several means of
 * loading referenced instances, determined on-the-fly.
 *
 * @signature `canRef( baseConnection )`
 *
 * Adds a reference type to [can-connect/can/map/map._Map `connection.Map`] that loads the related type or holds onto
 * an existing one. This handles circular references and loads relevant data as needed. The reference type can be loaded
 * by:
 * - it's data being included in the response for the referencing instance
 * - having an existing instance available in the [can-connect/constructor/store/store.instanceStore]
 * - lazy loading via the connection for the reference type
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `can/ref` behavior added on to it.
 * Expects the [can-connect/can/map/map] behavior to already be added to this base connection. If the `connect` helper
 * is used to build the connection, the behaviors will automatically be ordered as required.
 *
 * @return {{}} a connection with the [can-connect/can/map/map._Map `Map`] having the reference type property
 * (`Map.Ref.type`) created by `can/ref`.
 *
 * @body
 *
 * ## Use
 *
 * `can/ref` is useful when the server might return either a reference to
 * a value or the value itself.  For example, in a MongoDB setup,
 * a request like `GET /game/5` might return:
 *
 * ```
 * {
 *   id: 5,
 *   teamRef: 7,
 *   score: 21
 * }
 * ```
 *
 * But a request like `GET /game/5?$populate=teamRef` might return:
 *
 * ```
 * {
 *   id: 5,
 *   teamRef: {id: 7, name: "Cubs"},
 *   score: 21
 * }
 * ```
 *
 * `can/ref` can handle this ambiguity and even make lazy loading possible.
 *
 * To use `can/ref`, first create a Map and a connection for the referenced type:
 *
 * ```
 * var Team = DefineMap.extend({
 *   id: 'string'
 * });
 *
 * connect([
 *   require("can-connect/constructor/constructor"),
 *   require("can-connect/constructor/store/store"),
 *   require("can-connect/can/map/map"),
 *   require("can-connect/can/ref/ref")
 * ],{
 *     Map: Team,
 *     List: Team.List,
 *     ...
 * })
 * ```
 *
 * The connection is necessary because it creates an instance store which will
 * hold instances of `Team` that the `Team.Ref` type will be able to access.
 *
 * Now we can create a reference to the Team within a Game map and the Game's connection:
 *
 * ```
 * var Game = DefineMap.extend({
 *   id: 'string',
 *   teamRef: {type: Team.Ref.type},
 *   score: "number"
 * });
 *
 * superMap({
 *   Map: Game,
 *   List: Game.List
 * })
 * ```
 *
 * Now, `teamRef` is a [can-connect/can/ref/ref.Map.Ref] type, which will
 * house the id of the reference no matter how the server returns data, e.g.
 * `game.teamRef.id`.
 *
 * For example, without populating the team data:
 *
 * ```
 * Game.get({id: 5}).then(function(game){
 *   game.teamRef.id //-> 7
 * });
 * ```
 *
 * With populating the team data:
 *
 * ```
 * Game.get({id: 5, $populate: "teamRef"}).then(function(game){
 *   game.teamRef.id //-> 7
 * });
 * ```
 *
 * The values of other properties and methods on the [can-connect/can/ref/ref.Map.Ref] type
 * are determined by if the reference was populated or the referenced item already exists
 * in the [can-connect/constructor/store/store.instanceStore].
 *
 * For example, `value`, which points to the referenced instance, will be populated if the reference was populated:
 *
 * ```
 * Game.get({id: 5, $populate: "teamRef"}).then(function(game){
 *   game.teamRef.value.name //-> 5
 * });
 * ```
 *
 * Or, it will be populated if that instance had been loaded through another means and
 * it’s in the instance store:
 *
 * ```
 * Team.get({id: 7}).then(function(team){
 *   // binding adds things to the store
 *   team.on("name", function(){})
 * }).then(function(){
 *   Game.get({id: 5}).then(function(game){
 *     game.teamRef.value.name //-> 5
 *   });
 * })
 * ```
 *
 * `value` is an [can-define.types.get asynchronous getter], which means that even if
 * the referenced value isn't populated or loaded through the store, it can be lazy loaded. This
 * is generally most useful in a template.
 *
 * The following will make an initial request for game `5`, but when the template
 * tried to read and listen to `game.teamRef.value.name`, a request for team `7`
 * will be made.
 *
 * ```
 * var template = stache("{{game.teamRef.value.name}} scored {{game.score}} points");
 * Game.get({id: 5}).then(function(game){
 *   template({game: game});
 * });
 * ```
 *
 *
 */
var connect = require("../../can-connect");
var WeakReferenceMap = require("../../helpers/weak-reference-map");
var ObservationRecorder = require("can-observation-recorder");
var constructorStore = require("../../constructor/store/store");
var define = require("can-define");
var canReflect = require("can-reflect");

var makeRef = function(connection) {
	var idProp = canReflect.getSchema(connection.queryLogic).identity[0];
	/**
	 * @property {constructor} can-connect/can/ref/ref.Map.Ref Map.Ref
	 * @parent can-connect/can/ref/ref.hydrators
	 * @group can-connect/can/ref/ref.Map.Ref.static static
	 * @group can-connect/can/ref/ref.Map.Ref.prototype prototype
	 *
	 * A reference type with `instanceRef.value` primed to return an existing instance of the
	 * [can-connect/can/map/map._Map] type, if available, or lazy load an instance upon accessing `instanceRef.value`.
	 *
	 * @signature `new Map.Ref(id, value)`
	 * @param  {string} id    string representing the record id
	 * @param  {Object} value properties to be loaded / hydrated
	 * @return {Map.Ref}       instance reference object for the id
	 */
	var Ref = (function(){
		return function(id, value) {
			if (typeof id === "object") {
				value = id;
				id = value[idProp];
			}
			// check if this is in the store
			var storeRef = Ref.store.get(id);
			if (storeRef) {
				if (value && !storeRef._value) {
					if (value instanceof connection.Map) {
						storeRef._value = value;
					} else {
						storeRef._value = connection.hydrateInstance(value);
					}
				}
				return storeRef;
			}
			// if not, create it
			this[idProp] = id;
			if (value) {
				// if the value is already an instance, use it.

				if (value instanceof connection.Map) {
					this._value = value;
				} else {
					this._value = connection.hydrateInstance(value);
				}
			}


			// check if this is being made during a request
			// if it is, save it
			if (constructorStore.requests.count() > 0) {
				if (!Ref._requestInstances[id]) {
					Ref.store.addReference(id, this);
					Ref._requestInstances[id] = this;
				}
			}
		};
	})();
	/**
	 * @property {can-connect/helpers/weak-reference-map} can-connect/can/ref/ref.Map.Ref.store store
	 * @parent can-connect/can/ref/ref.Map.Ref.static
	 * @hide // not something that needs to be documented for the average user
	 * A WeakReferenceMap that contains instances being created by their `._cid` property.
	 */
	Ref.store = new WeakReferenceMap();
	Ref._requestInstances = {};
	/**
	 * @function can-connect/can/ref/ref.Map.Ref.type type
	 * @parent can-connect/can/ref/ref.Map.Ref.static
	 *
	 * Returns a new instance of `Map.Ref`.
	 *
	 * @signature `Map.Ref.type(reference)`
	 *
	 *   @param {Object|String|Number} reference either data or an id for an instance of [can-connect/can/map/map._Map].
	 *   @return {can-connect/can/ref/ref.Map.Ref} reference instance for the passed data or identifier.
	 */
	Ref.type = function(ref) {
		if (ref && typeof ref !== "object") {
			// get or make the existing reference from the store
			return new Ref(ref);
		} else {
			// get or make the reference in the store, update the instance too
			return new Ref(ref[idProp], ref);
		}
	};
	var defs = {
		/**
		 * @property {Promise} can-connect/can/ref/ref.Map.Ref.prototype.promise promise
		 * @parent can-connect/can/ref/ref.Map.Ref.prototype
		 * @hide // don't know if this is part of the public API
		 *
		 * Returns a resolved promise if the referenced instance is already available, if not, returns a new promise
		 * to retrieve the instance by the id.
		 *
		 * @signature `ref.promise`
		 * @return {Promise} Promise resolving the instance referenced
		 */
		promise: {
			get: function() {
				if (this._value) {
					return Promise.resolve(this._value);
				} else {
					var props = {};
					props[idProp] = this[idProp];
					return connection.Map.get(props);
				}
			}
		},

		_state: {
			get: function(lastSet, resolve) {
				if (resolve) {
					this.promise.then(function() {
						resolve("resolved");
					}, function() {
						resolve("rejected");
					});
				}

				return "pending";
			}
		},

		/**
		 * @property {*} can-connect/can/ref/ref.Map.Ref.prototype.value value
		 * @parent can-connect/can/ref/ref.Map.Ref.prototype
		 *
		 * Returns the actual instance the reference points to. Returns `undefined` if the instance is still being loaded.
		 * Accessing this property will start lazy loading if the instance isn't already available.
		 *
		 * @signature `ref.value`
		 * @return {object} actual instance referenced or `undefined` if lazy loading ongoing
		 */
		value: {
			get: function(lastSet, resolve) {
				if (this._value) {
					return this._value;
				} else if (resolve) {
					this.promise.then(function(value) {
						resolve(value);
					});
				}
			}
		},

		/**
		 * @property {*} can-connect/can/ref/ref.Map.Ref.prototype.reason reason
		 * @parent can-connect/can/ref/ref.Map.Ref.prototype
		 *
		 * Returns the failure message from the lazy loading promise. Returns `undefined` if the referenced instance is
		 * available or loading is ongoing.
		 *
		 * @signature `ref.reason`
		 * @return {Object} error message if the promise is rejected
		 */
		reason: {
			get: function(lastSet, resolve) {
				if (this._value) {
					return undefined;
				} else {
					this.promise.catch(function(value) {
						resolve(value);
					});
				}
			}
		}
	};
	defs[idProp] = {
		type: "*",
		set: function() {
			this._value = undefined;
		}
	};

	define(Ref.prototype, defs);

	Ref.prototype.unobservedId = ObservationRecorder.ignore(function() {
		return this[idProp];
	});
	/**
	 * @function can-connect/can/ref/ref.Map.Ref.prototype.isResolved isResolved
	 * @parent can-connect/can/ref/ref.Map.Ref.prototype
	 *
	 * Observable property typically for use in templates to indicate to the user if lazy loading has succeeded.
	 *
	 * @signature `ref.isResolved`
	 * @return {boolean} `true` if the lazy loading promise was resolved.
	 */
	Ref.prototype.isResolved = function() {
		return !!this._value || this._state === "resolved";
	};
	/**
	 * @function can-connect/can/ref/ref.Map.Ref.prototype.isRejected isRejected
	 * @parent can-connect/can/ref/ref.Map.Ref.prototype
	 *
	 * Observable property typically for use in templates to indicate to the user if lazy loading has failed.
	 *
	 * @signature `ref.isRejected`
	 * @return {boolean} `true` if the lazy loading promise was rejected.
	 */
	Ref.prototype.isRejected = function() {
		return this._state === "rejected";
	};

	/**
	 * @function can-connect/can/ref/ref.Map.Ref.prototype.isPending isPending
	 * @parent can-connect/can/ref/ref.Map.Ref.prototype
	 *
	 * Observable property typically for use in templates to indicate to the user if lazy loading is ongoing.
	 *
	 * @signature `ref.isPending`
	 * @return {boolean} `true` if the lazy loading promise state is not resolved or rejected.
	 */
	Ref.prototype.isPending = function() {
		return !this._value && (this._state !== "resolved" || this._state !== "rejected");
	};

	/**
	 * @function can-connect/can/ref/ref.Map.Ref.prototype.serialize serialize
	 * @parent can-connect/can/ref/ref.Map.Ref.prototype
	 *
	 * Return the id of the referenced instance when serializing. Prevents the referenced instance from
	 * being entirely serialized when serializing the referencing instance.
	 *
	 * @signature `ref.serialize`
	 * @return {string} id the id of the referenced instance
	 */
	Ref.prototype.serialize = function() {
		return this[idProp];
	};
	canReflect.assignSymbols(Ref.prototype, {
		"can.serialize": Ref.prototype.serialize,
		"can.getName": function(){
			return canReflect.getName(this.constructor)+"{"+this[idProp]+"}";
		}
	});

	var baseEventSetup = Ref.prototype._eventSetup;
	Ref.prototype._eventSetup = function() {
		Ref.store.addReference(this.unobservedId(), this);
		return baseEventSetup.apply(this, arguments);
	};
	var baseTeardown = Ref.prototype._eventTeardown;
	Ref.prototype._eventTeardown = function() {
		Ref.store.deleteReference(this.unobservedId(), this);
		return baseTeardown.apply(this, arguments);
	};


	constructorStore.requests.on("end", function() {
		for (var id in Ref._requestInstances) {
			Ref.store.deleteReference(id);
		}
		Ref._requestInstances = {};
	});

	//!steal-remove-start
	Object.defineProperty(Ref, "name", {
		value: canReflect.getName(connection.Map) + "Ref",
		configurable: true
	});
	//!steal-remove-end

	return Ref;
};


module.exports = connect.behavior("can/ref", function(baseConnection) {
	return {
		/**
		 * @can-connect/can/ref/ref.init init
		 * @parent can-connect/can/ref/ref.methods
		 *
		 * @signature `connection.init()`
		 *
		 * Initializes the base connection and then creates and sets [can-connect/can/ref/ref.Map.Ref].
		 * Typically called by the `connect` helper after the connection behaviors have been assembled.
		 *
		 * @return {undefined} no return value
		 **/
		init: function() {
			baseConnection.init.apply(this, arguments);
			this.Map.Ref = makeRef(this);
		}
	};
});
