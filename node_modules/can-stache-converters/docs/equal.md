@function can-stache-converters.equal equal
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that is usually for binding to a `<input type="radio">` group, so that a scope value can be set the radio group’s selected value.

@signature `equal(compute, value)`

When the getter is called **compute**, a [can-compute.computed], is compared to **value** and if they are equal, returns true.

When the setter is called, if the radio is now checked the **compute**'s setter is called with **value** as the value.

```handlebars
<input type="radio" checked:bind="equal(color, 'red')" /> Red
<input type="radio" checked:bind="equal(color, 'blue')" /> Blue
```

In this example, the `color` scope value will be set to 'red' when the first radio is selected and 'blue' when the second radio is selected.

@param {can-compute} compute A compute whose value will be compared to the second argument.
@param {*} value A value of any type, that will be compared to the compute's internal value.

@return {can-compute} A compute that will be two-way bound to the radio's checked property.

@signature `equal(valueOne, valueTwo)`

When the getter is called the two values will be compared and if they are equal, returns true.

In this example there is only a one-way binding, parent to child, so there is no setter case.

```handlebars
<my-modal show:from="equal(showModal, true)" />
```

In this example, the `show` value of `my-modal`'s view model will be set to `true` when `showModal` in the scope is set to true.

@param {*} valueOne A value of any type, that will be compared to valueTwo.
@param {*} valueTwo A value of any type, that will be compared to valueOne.

@return {can-compute} A compute that will be one-way bound to the `show` property.

@body 

## Use

This [can-stache-converters converter] will most often be used in conjunction with a radio input in order to bind a scope’s value (such as string, but could be any value) based on the selection of the radio group.

In this example we are using objects, to select a captain from one of three players:

```handlebars
{{#each players}}
	<input type="radio" checked:bind="equal(captain, this)" /> {{name}}
{{/each}}
```

```js
const template = stache.from( "demo" );
const vm = new DefineMap( {
	captain: null,
	players: [
		{ name: "Matthew" },
		{ name: "Wilbur" },
		{ name: "Anne" }
	]
} );
vm.captain = vm.players[ 0 ];

const frag = template( vm );
document.body.appendChild( frag );
```

@demo demos/can-stache-converters/input-radio.html

