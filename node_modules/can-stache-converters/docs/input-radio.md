@page can-stache-converters.examples.input-radio input[type=radio]
@parent can-stache-converters.examples

Cross bind a value to a radio input.

@body

## Binding to radios

To bind to a radio input, if you have a set of boolean values you can bind to the input’s `checked` property as you do with [can-stache-converters.examples.input-checkbox].

```handlebars
<input type="radio" checked:bind="one" /> One
<input type="radio" checked:bind="two" /> Two
```

```js
const template = stache.from( "demo" );
const map = new DefineMap( {
	one: true,
	two: false
} );

document.body.appendChild( template( map ) );
```

## Binding to a selected value

More often than binding to boolean values of each radio's `checked` value, you will want to know what the `value` is of the radio group. Since each radio has its own `value`, the radio's selected value is the value of the radio item that is selected.

Using the [can-stache-converters.equal] [can-stache.registerConverter converter] you can bind a value within your scope to the radio group’s selected value:

@demo demos/can-stache-converters/input-radio.html
