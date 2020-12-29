@typedef {function} can-validate.validator validator
@parent can-validate.types

A function that validates a value against predefined constraints and returns validation errors, if any are found.

@signature `validator(value)`

  ```js
function validator( value ) {
	if ( typeof value === "undefined" || value === "" ) {
		return "is required";
	}
}
```

  @param {*} value A simple value to validate

  @return {Error|String|undefined|Array<Error|String>}  Returns undefined if no errors found. Otherwise, will return an error type with the error message.

@body

## Creating a validator

Given that a `required` validation exists
```js
// Custom required check
const checkRequired = function( val ) {
	if ( typeof value === "undefined" || value === "" ) {
		return false;
	}
	return true;
};
```

Typically a validator can be created like so

```js
// Validator factory
const makeValidator = function( constraints ) {
	return function( value ) {
		if ( constraints.required && !checkRequired( value ) ) {
			return "is required";
		}
	};
};
```

Now, creating a validator for any value is possible by doing

```js
const nameValidator = makeValidator( { required: true } );
```

Which then allows validating values as needed

```js
nameValidator( "Juan" ); //> undefined
nameValidator(); //> 'is required'
```

## Validator Response

The response should match the [can-validate.errors] type. The most flexible response
is the [can-validate.error] type which describes the error message any value keys that
triggered the error state.
