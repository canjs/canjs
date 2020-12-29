@function can-stache-converters.either-or either-or
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that two-way binds to a checkbox two values provided as arguments. This converter is useful when you have a binary decision between two fixed values.

@signature `either-or(chosen, a, b)`

When the getter is called, gets the value of the **chosen** compute and if it is equal to **a**, returns true, otherwise it returns false.

When the setter is called, if the new value is truthy, sets the **chosen** [can-compute] to **a**’s value, otherwise sets it to **b**’s value.

```handlebars
<span>Favorite superhero:</span>
<input type="checkbox" checked:bind="either-or(chosen, 'Batman', 'Superman')"> Batman?
```

@param {can-compute} chosen A compute where the chosen value (between `a` and `b` is stored). When the setter is called, this compute’s value will be updated.

@param {*} a The `true` value. If the checkbox is checked, then **a**’s value will be stored in the **chosen** compute.

@param {*} b The `false` value. If the checkbox is unchecked, then **b**’s value will be stored in the **chosen** compute.

@return {can-compute} A compute that will be used by [can-stache-bindings] as a getter/setter bound to the element or a component's viewModel.

@body

## Use

**either-or** is made to be used with `<input type=checkbox>` elements when there is a binary decision that can be made (so that multiple radio buttons are not needed).

You pass 3 arguments to this [can-stache.registerConverter converter]. The first argument is a compute that represents the chosen value. The second argument is the default, truthy, value. And the third argument is the falsey value.


```handlebars
<p>
	<input type="checkbox"
		checked:bind="either-or(pref, 'Star Trek', 'Star Wars')" />
	<span>Star Trek</span>
</p>

<p>Your fandom: {{pref}}</p>
```

```js
const template = stache.from( "demo-template" );

const fan = new DefineMap( {
	pref: "Star Trek"
} );

document.body.appendChild( template( fan ) );

// User unchecks the checkbox
fan.pref === "Star Wars";

// Changing the value in code:
fan.pref === "Star Trek";

// Checkbox is now checked again.
```

@demo demos/can-stache-converters/input-checkbox-binary.html
