@page can.List.prototype.sort
@parent can.List.prototype
@plugin can/list/sort
@test can/list/sort/test.html

Two-way bind a [can.List]'s sort order to the DOM.

@body

## Use

The [can.List::sort can.List.sort] plugin makes it easy to define
and maintain how items are arranged in a [can.List]. To use it,
simply define a `comparator` on the [can.List]'s prototype. It can be a
`String` or a `Function`.

```
var cart = new can.List([
	{ title: 'Bread', price: 3.00 },
	{ title: 'Butter', price: 3.50 },
	{ title: 'Juice', price: 3.25 }
]);
cart.comparator = 'price';
cart.sort(); // -> [Bread, Butter, Juice]
```


When a `String` is defined the default comparator function
arranges the items in ascending order. To change the sort order
define your own comparator function.

```
var stockPrices = new can.List([
	0.01, 0.98, 0.75, 0.12, 0.05, 0.16
]);
stockPrices.comparator = function (a, b) {
	return a === b ? 0 : a < b ? 1 : -1; // Descending
}
stockPrices.sort(); // -> [0.98, 0.75, 0.16, 0.12, 0.05, 0.01];

```


String comparators will be passed to [can.List.attr] to
retrieve the values being compared.

```
var table = new can.List([
	[6, 3, 4],
	[1, 8, 2],
	[7, 9, 5]
]);
table.comparator = '2'
table.sort(); // -> [1, 8, 2],
                    [6, 3, 4],
                    [7, 9, 5]
```


At any point in time you can overwrite the prototype's
comparator by passing a value to [can.List.sort]

```
var table = new can.List([
	[6, 3, 4],
	[1, 8, 2],
	[7, 9, 5]
]);
table.comparator = '2'
table.sort('1'); // -> [6, 3, 4],
                       [1, 8, 2],
                       [7, 9, 5]
```


The [can.List::sort can.List.sort] plugin also ensures that the
sort order is preserved while the [can.List] is being manipulated
by `push`, `unshift`, or `splice` operations.

```
var animals = new can.List();
animals.comparator = 'weight';

animals.push({
	type: 'Dog',
	weight`: 50
}); // -> [Dog]

animals.push({
	type: 'Mouse',
	weight`: 0.5
}); // -> [Mouse, Dog]

animals.unshift({
	type: 'Bear',
	weight`: 500
}); // -> [Mouse, Dog, Bear]

// Replace Mouse
animals.splice(2, 1, {
	type: 'Elephant',
	weight`: 8000
}); // -> [Dog, Bear, Elephant]
```


Whenever there are changes to items in the [can.List], the
[can.List::sort can.List.sort] plugin moves the item to the correct
index and fires a "move" event.

```
var cart = new can.List([
	{ title: 'Bread', price: 3.00 },
	{ title: 'Butter', price: 3.50 },
	{ title: 'Juice', price: 3.25 }
]);
cart.comparator = 'price';
cart.sort(); // -> [Bread, Butter, Juice]

cart.bind('move', function (ev, item, newIndex, oldIndex) {
	console.log('Moved:', item.title + ', from:', oldIndex + ', to:', newIndex);
})

cart.attr('0.price', 4.00); // Moved: Bread, from: 0, to: 3
														// -> [Juice, Butter, Bread]
```
