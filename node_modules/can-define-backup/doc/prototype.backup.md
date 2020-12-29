@function can-define-backup.backup backup
@parent can-define-backup.defineMap

@description Save the values of the properties of an Map.

@signature `map.backup()`

`backup` backs up the current state of the properties of an Observe and marks
the Observe as clean. If any of the properties change value, the original
values can be restored with [can.Define.map.backup.prototype.restore restore].

@return {can-define} The map, for chaining.

@body

## Example

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
recipe.title;     // "Flapjack Mix"

recipe.restore();
recipe.title;     // "Pancake Mix"
```
@highlight 26
