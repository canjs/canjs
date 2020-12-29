"use strict";
var assign = require("can-reflect").assignMap;

/**
 * @module {function} can-connect/helpers/weak-reference-map WeakReferenceMap
 * @parent can-connect.modules
 *
 * Provides a map that only contains keys that are referenced.
 *
 * @signature `new WeakReferenceMap()`
 *
 *   Creates a new weak reference map.
 *
 * @body
 *
 * ## Use
 *
 * ```
 * var WeakReferenceMap = require("can-connect/helpers/weak-reference-map");
 * var wrm = new WeakReferenceMap();
 * var task1 = {id: 1, name: "do dishes"};
 *
 * wrm.addReference("1", task1);
 * wrm.has("1") //-> true
 * wrm.addReference("1", task1);
 * wrm.has("1") //-> true
 * wrm.deleteReference("1");
 * wrm.has("1") //-> true
 * wrm.deleteReference("1");
 * wrm.has("1") //-> false
 * ```
 */

var WeakReferenceMap = function(){
	this.set = {};
};

// if weakmap, we can add and never worry ...
// otherwise, we need to have a count ...

assign(WeakReferenceMap.prototype,
/**
 * @prototype
 */
	{
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.has has
	 * @signature `weakReferenceMap.has(key)`
	 *
	 *   Returns if key is in the set.
	 *
	 *   @param  {String} key A key to look for.
	 *   @return {Boolean} If the key exists.
	 */
	has: function(key){
		return !!this.set[key];
	},
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.addReference addReference
	 * @signature `WeakReferenceMap.addReference(key, item)`
	 *
	 *   Adds a reference to item as key and increments the reference count. This should be called
	 *   when a value should be managed by something, typically the [can-connect/constructor/store/store].
	 *
	 *   @param  {String} key The key of the item in the store.
	 */
	addReference: function(key, item, referenceCount){
		// !steal-remove-start
		if (typeof key === 'undefined'){
			throw new Error("can-connect: You must provide a key to store a value in a WeakReferenceMap");
		}
		// !steal-remove-end
		var data = this.set[key];
		if(!data) {
			data = this.set[key] = {
				item: item,
				referenceCount: 0,
				key: key
			};
		}
		data.referenceCount += (referenceCount || 1);
	},
	referenceCount: function(key) {
		var data = this.set[key];
		if(data) {
			return data.referenceCount;
		}
	},
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.deleteReference deleteReference
	 * @signature `weakReferenceMap.deleteReference(key)`
	 *
	 *   Decrements the reference count for key and removes it if the reference count is `0`. This should be called
	 *   when a value should not be managed by something, typically the [can-connect/constructor/store/store].
	 *
	 *   @param  {String} key The key of the item in the store.
	 */
	deleteReference: function(key){
		var data = this.set[key];
		if(data){
			data.referenceCount--;
			if( data.referenceCount === 0 ) {
				delete this.set[key];
			}
		}
	},
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.get get
	 * @signature `weakReferenceMap.get(key)`
	 *
	 *   Returns the value stored at key if it's in the store.
	 *
	 *   @param  {String} key The key of the item in the store.
	 *   @return {*|undefined} The item if it's available.
	 */
	get: function(key){
		var data = this.set[key];
		if(data) {
			return data.item;
		}
	},
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.forEach forEach
	 * @signature `weakReferenceMap.forEach(callback)`
	 *
	 *   Calls `callback` for every value in the store.
	 *
	 *   @param  {function(*,String)} callback(item,key) A callback handler.
	 */
	forEach: function(cb){
		for(var id in this.set) {
			cb(this.set[id].item, id);
		}
	}
});

module.exports = WeakReferenceMap;
