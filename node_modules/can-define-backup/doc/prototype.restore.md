@function can-define-backup.restore restore
@parent can-define-backup.defineMap

@description Restore saved values of an Observe's properties.

@signature `map.restore( [deep] )`

`restore` sets the properties of an Observe back to what they were the last time
[can-define-backup.prototype.backup backup] was called. If _deep_ is `true`,
`restore` will also restore the properties of nested Observes.

`restore` will not remove properties that were added since the last backup, but it
will re-add properties that have been removed.

@param {bool} [deep=false] whether to restore properties in nested Observes
@return {can-define} The Observe, for chaining.

@body

```js
import DefineMap from "can-define/map/map";
import defineBackup from "can-define-backup";

const recipe = new DefineMap( "Recipe", {
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
recipe.restore();
recipe.title; // "Pancake Mix"

recipe.ingredients[ 0 ].quantity = "7 cups";
recipe.restore();
recipe.ingredients[ 0 ].quantity; // "7 cups"
recipe.restore( true );
recipe.ingredients[ 0 ].quantity; // "6 cups"
```
@highlight 28,32,34
