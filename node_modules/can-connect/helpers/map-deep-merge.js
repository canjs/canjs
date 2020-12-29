"use strict";
// TODO: This implementation deeply depends on `can-define/map/` and `can-define/list/`.
// Track the issue `https://github.com/canjs/canjs/issues/2931` to figure out how to apply smartMerge
// to regular objects and arrays.

var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var diff = require('can-diff');
var assign = require("can-assign");
var canReflect = require("can-reflect");

/**
 * @module {function} can-connect/helpers/map-deep-merge map-deep-merge
 * @parent can-connect.modules
 *
 * Perform a smart merge of deeply nested maps and lists.
 *
 * @signature `mapDeepMerge( instance, data )`
 *
 * The `can-connect/helpers/map-deep-merge` module exports a function that
 * merges nested [can-define/map/map] or [can-define/list/list] instances.
 *
 *
 * ```
 * var mapDeepMerge = require('can-connect/helpers/map-deep-merge');
 *
 * var type = new Type({ ... });
 *
 * mapDeepMerge(type, { ... });
 *
 * var list = new Type.List([ ... ]);
 * mapDeepMerge(list, [ ... ]);
 * ```
 *
 * To properly know how to merge [can-define] instances of a [can-define/list/list],
 * `mapDeepMerge` needs to know how to:
 *
 * - uniquely identify the instances
 * - create instances from raw data (hydration)
 *
 * `mapDeepMerge` solves this by first identifying the [can-define.types.TypeConstructor]
 * of the [can-define/list/list.prototype.wildcardItems] (index) property definition.
 *
 * With the `Type` known of each item in the list, `mapDeepMerge` looks for for a `Type.algebra` to
 * specify the unique [can-set.props.id] of `Type` instances.  If `Type.algebra` does
 * not exist, it looks for an `id` and then `_id` property.
 *
 * With the `Type` known of each item in the list, `mapDeepMerge` looks for a `Type.connection.hydrateInstance(props)`
 * method.  If one does not exist, `new Type(props)` is used instead.
 *
 *   @param {can-define/map/map|can-define/map/list} instance An instance to apply a merge to.
 *   @param {Object|Array} data An object or array with the updated data.
 *
 * @body
 *
 * ## Use
 *
 * This method is often used by mixing in the [can-connect/can/merge/merge] behavior
 * into a connection.
 *
 * It can be used directly to update a [can-define/map/map] instance or
 * [can-define/list/list] instance with nested data as follows:
 *
 * ```js
 * var mapDeepMerge = require("can-connect/helpers/map-deep-merge");
 *
 * var myMonth = new ContributionMonth({
 *     id: 1,
 *     month: "Feb",
 *     osProjects: [ { id: 1, title: "canjs" }, {id: 2, title: "jQuery++"} ],
 *     author: {id: 5, name: "ilya"}
 * });
 *
 * mapDeepMerge( myMonth, {
 *     id: 1,
 *     month: "February",
 *     osProjects: [ { id: 1, title: "CanJS" }, {id: 3, title: "StealJS"}, {id: 2, title: "jQuery++"} ],
 *     author: {id: 6, name: "ilya"}
 * });
 * ```
 *
 * This will create the following changes:
 *
 * ```js
 * // 1 - a property update
 * contributionMonth.name = "February";
 * // 2 - a property update on an item of a list
 * contributionMonth.osProjects[0].name = "CanJS";
 * // 3 - item insertion
 * contributionMonth.osProjects.splice(1,0, hydrateInstance({id: 3, name: "StealJS"}) )
 *  // 4 - a map replacement (`id` is different)
 * contributionMonth.author = hydrateInstance( {id: 6, name: "ilya"} )
 * ```
 */
function smartMerge( instance, props ) {
	if( instance instanceof DefineList ) {
		mergeList( instance, props );
	} else {
		mergeInstance( instance, props );
	}
}

function mergeInstance( instance, data ) {
	data = assign({}, data);

	instance.forEach( function( value, prop ){
		var newValue = data[prop];
		delete data[prop];
		// cases:
		// a. list
		// b. map
		// c. primitive
		var newValueIsArray = Array.isArray( newValue );
		if( value instanceof DefineList && newValueIsArray ) {

			mergeList( value, newValue );

		} else if( value instanceof DefineMap && canReflect.isPlainObject(newValue) && !newValueIsArray) {

			// TODO: the `TYPE` should probably be infered from the `_define` property definition.
			var Type = value.constructor;
			var id = idFromType( Type );
			var hydrate = hydratorFromType( Type );

			// Merge if id is the same:
			if( id && id( value ) === id( newValue ) ) {
				mergeInstance( value, newValue );
			} else {
				// Instantiate if id is different:
				instance.set(prop, hydrate( newValue ) );
			}

		} else {

			instance.set(prop, newValue );

		}
	});
	canReflect.each(data, function(value, prop){
		if (prop !== "_cid") {
            instance.set(prop, value);
        }
	});
}

function mergeList (list, data) {
	var Type = typeFromList(list);
	var id = idFromType(Type);
	var identity = function(a, b){
		var eq = id(a) === id(b);
		if(eq) {
			// If id is the same we merge data in. Case #2
			mergeInstance( a, b );
		}
		return eq;
	};
	var hydrate = hydratorFromType( Type );
	var patches = diff( list, data , identity );

	// If there are no patches then data contains only updates for all of the existing items, and we just leave.
	if (!patches.length){
		return list;
	}

	// Apply patches (add new, remove) #3. For any insertion use a hydrator.
	patches.forEach(function(patch){
		applyPatch( list, patch, hydrate );
	});
}

function typeFromList( list ){
	return list && list._define && list._define.definitions["#"] && list._define.definitions["#"].Type;
}
function idFromType( Type ){
	return Type && Type.connection && function(o){ return Type.connection.id(o); } ||
		Type && Type.algebra && Type.algebra.clauses && Type.algebra.clauses.id && function(o){
			var idProp = Object.keys(Type.algebra.clauses.id)[0];
			return o[idProp];
		} || function(o){
			return o.id || o._id;
		};
}
function hydratorFromType( Type ){
	return Type && Type.connection && Type.connection.makeInstance || function( data ){ return new Type( data ); };
}


function applyPatch( list, patch, makeInstance ){
	// Splice signature compared to patch:
	//   array.splice(start, deleteCount, item1, item2, ...)
	//   patch = {index: 1, deleteCount: 0, insert: [1.5]}
	var insert = makeInstance && patch.insert.map( makeInstance ) || patch.insert;

	var args = [patch.index, patch.deleteCount].concat( insert );
	list.splice.apply(list, args);

	return list;
}
function applyPatchPure( list, patch, makeInstance ){
	var copy = list.slice();
	return applyPatch( copy, patch, makeInstance );
}

module.exports = smartMerge;

smartMerge.mergeInstance = mergeInstance;
smartMerge.mergeList = mergeList;
smartMerge.applyPatch = applyPatch;
smartMerge.applyPatchPure = applyPatchPure;
smartMerge.idFromType = idFromType;
