"use strict";
/**
 * @module {connect.Behavior} can-connect/can/constructor-hydrate/constructor-hydrate constructor-hydrate
 * @parent can-connect.behaviors
 *
 * Check the [can-connect/constructor/store/store.instanceStore] when creating new instances of the connected
 * [can-connect/can/map/map._Map] type. Return an existing instance if a match is found. Prevents duplication of
 * instances when instances are created outside of the `can-connect` connection.
 *
 * @signature `constructorHydrate( baseConnection )`
 *
 * Overrides [can-define/map/map DefineMaps]'s `setup` method and checks whether a newly created instance already
 * exists in the [can-connect/constructor/store/store.instanceStore]. If an instance exists in the
 * [can-connect/constructor/store/store.instanceStore] that instance will be returned instead of a new object.
 *
 * This behavior expects to be used with the [can-connect/constructor/store/store] and [can-connect/can/map/map can/map]
 * behaviors.
 *
 * @param {{}} baseConnection `can-connect` connection object that is having the `constructor-hydrate` behavior added
 *   on to it.
 *
 * @return {Object} a `can-connect` connection containing the methods provided by `constructor-hydrate`.
 *
 * @body
 *
 * ## Use
 *
 * During all initializations of the connection [can-connect/can/map/map._Map Map type], if an identity property exists then
 * the `constructor-hydrate` behavior will check the connection [can-connect/constructor/store/store.instanceStore] for
 * a matching instance. If one is found it will be returned instead of a new object.
 *
 * For example, this behavior is useful if [can-define.types.propDefinition `Type` converters] of
 * [can-define/map/map DefineMap] are used in your app.
 *
 * Let's say we have a page state type, two properties of which are of type `Student`:
 * ```js
 * var myPage = new (DefineMap.extend({
 *   student: { Type: Student },
 *   teamLead: { Type: Student },
 *   loadTeamLead: function() {...}
 * }));
 * ```
 *
 * The type `Student` is a DefineMap that has had a `can-connect` connection attached:
 * ```js
 * var dataUrl = require("can-connect/data/url/");
 * var constructor = require("can-connect/constructor/contructor");
 * var store = require("can-connect/constructor/store/store");
 * var dataUrl = require("can-connect/data/url/url");
 * var canMap = require("can-connect/can/map/map");
 * var constructorHydrate = require("can-connect/can/constructor-hydrate/constructor-hydrate");
 *
 * var Student = DefineMap.extend({...});
 * Student.List = DefineList.extend({
 *     '#': { Type: Student }
 * });
 *
 * Student.connection = connect(
 *   [dataUrl, constructor, store, canMap, constructorHydrate, dataUrl], {
 * 	   Map: Student,
 * 	   List: Student.List,
 * 	   url: "api/students"
 *   }
 * );
 * ```
 *
 * Now lets say your page loads `myPage.student` via the connection using `Student.get()`, and then it gets data for
 * `teamLead` without the connection via `myPage.loadTeamLead()`. In this example it so happens that the team lead is
 * the same person as the student:
 *
 * ```js
 * Student.get({id: 1}).then(function(person) {
 *   // loaded via can-connect, person.id === 1
 *   myPage.student = person;
  *
 *   // not loaded via can-connect, person.id === 1
 *   myPage.loadTeamLead(myPage.student.teamId).then(function(person){ myPage.teamLead = person; });
 * });
 * ```
 *
 * Without `constructor-hydrate` we would end up with two different instances of `Student` with the same id. Additionally,
 * `teamLead` would not be an instance that is stored in the connection's `instanceStore`, and thus would not benefit
 * from the real-time updates offered by the [can-connect/real-time/real-time real-time] behavior.
 *
 * `constructor-hydrate` solves this problem by checking `instanceStore` before creating a new instance. So, in our
 * example it will return the existing instance from `myPage.loadTeamLead()`. Now both `myPage.student` and
 * `myPage.teamLead` are referencing the same instance:
 *
 * ```js
 * var instanceStore = Student.connection.instanceStore;
 * myPage.student === myPage.teamLead;                           // => true
 * myPage.teamLead === instanceStore.get( myPage.teamLead.id );  // => true
 * ```
 */

var connect = require("../../can-connect");
var Construct = require("can-construct");

var constructorHydrateBehavior = connect.behavior("can-connect/can/construct-hydrate", function(baseConnect){
	return {
		init: function(){
			var oldSetup = this.Map.prototype.setup;
			var connection = this;
			this.Map.prototype.setup = function(props){
				if (connection.instanceStore.has( connection.id(props) )) {
					return new Construct.ReturnValue( connection.hydrateInstance(props) );
				}
				return oldSetup.apply(this, arguments);
			};
			baseConnect.init.apply(this, arguments);
		}
	};
});

module.exports = constructorHydrateBehavior;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require('can-connect/helpers/validate');
}
module.exports = validate(constructorHydrateBehavior, ['Map', 'List', 'instanceStore', 'hydrateInstance']);
//!steal-remove-end
