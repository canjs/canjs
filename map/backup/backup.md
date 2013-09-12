@page can.Map.backup backup
@parent can.Map.plugins
@plugin can/map/backup
@test can/map/backup/test.html

can.Map.backup is a plugin that provides a dirty bit for properties on an Observe,
and lets you restore the original values of an Observe's properties after they are changed.

Here is an example showing how to use `[can.Map.prototype.backup backup]` to save values,
`[can.Map.prototype.restore restore]` to restore them, and `[can.Map.prototype.isDirty isDirty]`
to check if the Observe has changed:

@codestart
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
@codeend