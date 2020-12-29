@function can-stache-converters.examples.select select 
@parent can-stache-converters.examples

Cross bind a value to a `<select>` element.

@signature `value:bind="KEY"`

Cross binds the selected option value with an observable value.

@param {can-stache.key} KEY A named value in the current 
scope. `KEY`’s value is cross bound with the selected `<option>` in
the `<select>`. `KEY` should specify either a [can-map]/[can-define/map/map] property or a [can-compute.computed].

@body

## Use

The following cross bind's a `<select>` to a `person` map's `attending` property:

@demo demos/can-stache-converters/select.html
