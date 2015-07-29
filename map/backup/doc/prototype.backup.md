@function can.Map.backup.prototype.backup backup
@plugin can/map/backup
@parent can.Map.backup 0

@description Save the values of the properties of an Map.

@signature `map.backup( [options] )`

`backup` backs up the current state of the properties of an Observe and marks
the Observe as clean. If any of the properties change value, the original
values can be restored with [can.Map.backup.prototype.restore restore].

By default `backup` uses `attr` function on the map to get value backup value, 
if you want to use `serialize` or custom method use `options` parameter 

@param {object|string|bool} backup options:
 `object` - options object supports following params: `serialize`, `fn`, `removeAttr`.  
 `{serialize: true, removeAttr: true}` - means `serialize` method will be used for backup value, 
 `removeAttr` means that while restore absent attributes in backup value will be removed from map, 
 (note that if `serialize` or custom method is used for backup, `removeAttr` is `false` if not stated explicitly)  
 `string` - means method on map to be used for backup the same as `{fn: 'string'}` 
 `true` - is the same if `serialize` string is passed
 
  
@return {can.Map} The map, for chaining.

@body

## Example

```
var recipe = new can.Map({
title: 'Pancake Mix',
yields: '3 batches',
ingredients: [{
 ingredient: 'flour',
 quantity: '6 cups'
},{
 ingredient: 'baking soda',
 quantity: '1 1/2 teaspoons'
},{
 ingredient: 'baking powder',
 quantity: '3 teaspoons'
},{
 ingredient: 'salt',
 quantity: '1 tablespoon'
},{
 ingredient: 'sugar',
 quantity: '2 tablespoons'
}]
});

recipe.backup('serialize'); // `serialize` method will be used

recipe.attr('title', 'Flapjack Mix');
recipe.title;     // 'Flapjack Mix'

recipe.restore();
recipe.title;     // 'Pancake Mix'
```