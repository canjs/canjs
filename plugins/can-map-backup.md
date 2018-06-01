@page can-map-backup
@parent canjs.plugins.official

@link http://www.npmjs.com/package/can-map-backup npm
@link http://canjs.github.io/can-map-backup/docs docs
@link http://github.com/canjs/can-map-backup github

- [Usage Guide](http://canjs.github.io/can-map-backup/docs/can.Map.backup.html)
- [API Docs](http://canjs.github.io/can-map-backup/docs/can.Map.backup.prototype.backup.html)
- [GitHub](http://github.com/canjs/can-view-modifiers)

can.Map.backup is a plugin that provides a dirty bit for properties on an Map, and lets you restore the original values of an Map's properties after they are changed.

Here is an example showing how to use [backup](http://canjs.github.io/can-map-backup/docs/can.Map.backup.prototype.backup.html) to save values, [restore](http://canjs.github.io/can-map-backup/docs/can.Map.backup.prototype.restore.html) to restore them, and [isDirty](http://canjs.github.io/can-map-backup/docs/can.Map.backup.prototype.isDirty.html) to check if the Map has changed:

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
recipe.backup();

recipe.attr('title', 'Flapjack Mix');
recipe.title;     // 'Flapjack Mix'
recipe.isDirty(); // true

recipe.restore();
recipe.title;     // 'Pancake Mix'
```