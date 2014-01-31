@function can.view.bindings.can-value-checkbox input type=checkbox
@parent can.view.bindings.can-value

Cross bind a value to a checkbox.

@signature `<input type='checkbox' can-value='KEY' can-true-value='TRUEVALUE' can-false-value='FALSEVALUE'/>`

Cross binds the checked property to a true or false value. An alternative
true and false value can be specified by setting `can-true-value` and
`can-false-value` attributes.

@param {can.Mustache.key} KEY A named value in the current scope.

@param {String} [TRUEVALUE] Used to set the checked value of `KEY`.

@param {String} [FALSEVALUE] Used to set the unchecked value of `KEY`.

@body

## Use

@demo can/view/bindings/input-checkbox.html