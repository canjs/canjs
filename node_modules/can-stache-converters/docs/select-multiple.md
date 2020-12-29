@function can-stache-converters.examples.select-multiple select[multiple]
@parent can-stache-converters.examples

Cross bind a value to a `<select>` element with multiple selections permitted.

@signature `<select multiple values:bind="KEY"/>`

Cross binds the selected option values with an observable value.

@param {can.stache.key} KEY A named value in the current 
scope. `KEY`’s value is cross bound with the selected `<option>` in
the `<select>`. `KEY`’s value should be an Array-like,
or `undefined`.

@body

## Use

Select elements with the multiple attribute (`<select multiple values:bind="KEY"/>`)
have a specified behavior if the value of KEY is Array-like or
`undefined`.

## Cross binding to Arrays

`<select>` tags with a multiple attribute cross bind
a [can-map] property, [can-compute.computed] or [can-list]
in sync with the selected items of the `<select>` element.

For example, the following template:

    <select multiple values:bind="colors">
      <option value='red'>Red</option>
      <option value='green'>Green</option>
      <option value='yellow'>Yellow</option>
    </select>

Could be rendered with one of the following:

    // A can-map property
    new DefineMap({colors: []})

    // A compute
    { colors: compute([]) }

    // A DefineList
    { colors: new DefineList() }
    
@demo demos/can-stache-converters/multi-values.html
