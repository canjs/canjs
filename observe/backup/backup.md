@page can.Observe.backup backup
@parent can.Observe.plugins
@plugin can/observe/backup
@test can/observe/backup/test.html

can.Observe.backup is a plugin that provides a dirty bit for properties on an Observe,
and lets you restore the original values of an Observe's properties after they are changed.

Here is an example showing how to use `[can.Observe.prototype.backup backup]` to save values,
`[can.Observe.prototype.restore restore]` to restore them, and `[can.Observe.prototype.isDirty isDirty]`
to check if the Observe has changed:

@codestart
var recipe = new can.Observe({
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