"use strict";
var canReflect = require("can-reflect");
var diffList = require("../list/list");

function smartMerge(instance, props) {

	props = canReflect.serialize(props);

	if (canReflect.isMoreListLikeThanMapLike(instance)) {
		mergeList(instance, props);
	} else {
		mergeMap(instance, props);
	}
	return instance;
}

// date is expected to be mutable here
function mergeMap(instance, data) {

	// for each key in
	canReflect.eachKey(instance, function(value, prop) {
		if(!canReflect.hasKey(data, prop)) {
			canReflect.deleteKeyValue(instance, prop);
			return;
		}
		var newValue = canReflect.getKeyValue(data, prop);
		canReflect.deleteKeyValue(data, prop);

		// cases:
		// a. list
		// b. map
		// c. primitive

		// if the data is typed, we would just replace it
		if (canReflect.isPrimitive(value)) {
			canReflect.setKeyValue(instance, prop, newValue);
			return;
		}


		var newValueIsList = Array.isArray(newValue),
			currentValueIsList = canReflect.isMoreListLikeThanMapLike(value);

		if (currentValueIsList && newValueIsList) {

			mergeList(value, newValue);

		} else if (!newValueIsList && !currentValueIsList && canReflect.isMapLike(value) && canReflect.isPlainObject(newValue)) {

			// TODO: the `TYPE` should probably be infered from the `_define` property definition.
			var schema = canReflect.getSchema(value);
			if (schema && schema.identity && schema.identity.length) {
				var id = canReflect.getIdentity(value, schema);
				if (id != null && id === canReflect.getIdentity(newValue, schema)) {
					mergeMap(value, newValue);
					return;
				}
			}
			canReflect.setKeyValue(instance, prop, canReflect.new(value.constructor, newValue));
		} else {
			canReflect.setKeyValue(instance, prop, newValue);
		}
	});
	canReflect.eachKey(data, function(value, prop) {
		canReflect.setKeyValue(instance, prop, value);
	});
}

function mergeList(list, data) {
	var ItemType, itemSchema;
	var listSchema = canReflect.getSchema(list);
	if (listSchema) {
		ItemType = listSchema.values;
	}

	if (ItemType) {
		itemSchema = canReflect.getSchema(ItemType);
	}
	if (!itemSchema && canReflect.size(list) > 0) {
		itemSchema = canReflect.getSchema(canReflect.getKeyValue(list, 0));
	}

	var identity;
	if(itemSchema && itemSchema.identity && itemSchema.identity.length) {
		identity = function(a, b) {
		   var aId = canReflect.getIdentity(a, itemSchema),
			   bId = canReflect.getIdentity(b, itemSchema);
		   var eq = aId === bId;
		   if (eq) {
			   // If id is the same we merge data in. Case #2
			   mergeMap(a, b);
		   }
		   return eq;
	   };
   } else {
	   identity = function(a, b) {
		  var eq = a === b;
		  if (eq) {
			  // If id is the same we merge data in. Case #2
			  if(! canReflect.isPrimitive(a) ) {
				   mergeMap(a, b);
			  }

		  }
		  return eq;
	  }
   }


	var patches = diffList(list, data, identity);



	var hydrate = ItemType ? canReflect.new.bind(canReflect, ItemType) : function(v) {
		return v;
	};


	// If there are no patches then data contains only updates for all of the existing items, and we just leave.
	if (!patches.length) {
		return list;
	}

	// Apply patches (add new, remove) #3. For any insertion use a hydrator.
	patches.forEach(function(patch) {
		applyPatch(list, patch, hydrate);
	});
}

function applyPatch(list, patch, makeInstance) {
	// Splice signature compared to patch:
	//   array.splice(start, deleteCount, item1, item2, ...)
	//   patch = {index: 1, deleteCount: 0, insert: [1.5]}
	var insert = makeInstance && patch.insert.map(function(val){
		return makeInstance(val);
	}) || patch.insert;

	var args = [patch.index, patch.deleteCount].concat(insert);
	list.splice.apply(list, args);

	return list;
}

smartMerge.applyPatch = applyPatch;

module.exports = smartMerge;
