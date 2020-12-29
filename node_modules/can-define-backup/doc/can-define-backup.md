@module {can-define} can-define-backup
@parent can-observables
@collection can-ecosystem
@group can-define-backup.defineMap DefineMap.prototype
@test src/test/test.html
@package ../package.json

@signature `require("can-define-backup")`

Provides a dirty bit for properties on a Map and lets you restore the original values of properties after they are changed.

@param {Object} Map The [can-define/map/map] constructor. Adds a [can-define-backup.backup], [can-define-backup.isDirty], and [can-define-backup.restore] method to the prototype of the map.
@body


## Overview

Here is an example showing how to use [can-define-backup.backup] to save values,
[can-define-backup.restore restore] to restore them, and [can-define-backup.isDirty isDirty] to check if the Map has changed:

```js
import DefineMap from "can-define/map/map";
import defineBackup from "can-define-backup";

const recipe = new DefineMap( {
	title: "Pancake Mix",
	yields: "3 batches",
	ingredients: [ {
		ingredient: "flour",
		quantity: "6 cups"
	}, {
		ingredient: "baking soda",
		quantity: "1 1/2 teaspoons"
	}, {
		ingredient: "baking powder",
		quantity: "3 teaspoons"
	}, {
		ingredient: "salt",
		quantity: "1 tablespoon"
	}, {
		ingredient: "sugar",
		quantity: "2 tablespoons"
	} ]
} );
defineBackup(recipe);
recipe.backup();

recipe.title = "Flapjack Mix";
recipe.title;     // "Flapjack Mix"
recipe.isDirty(); // true

recipe.restore();
recipe.title;     // "Pancake Mix"
```
