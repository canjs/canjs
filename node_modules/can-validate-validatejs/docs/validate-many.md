@function can-validate-validatejs.many many
@parent can-validate-validatejs.methods

@signature `makeValidator.many(constraints)`

  Returns a validator function that can be used to validate many values at once.

  ```js
const validatePerson = makeValidator.many( {
	age: {
		numericality: true
	},
	name: {
		presence: true
	}
} );
```

  @param {Object} constraints A map of objects which contain definitions used by the Validate.js library.

  @return {Validator} A [can-validate.validator] type function that takes an object of values and validates every value based on the provided constraints.


@body

## Example

  ```js
import makeValidator from "can-validate-validatejs";
const validatePerson = makeValidator.many( {
	age: {
		numericality: true
	},
	name: {
		presence: true
	}
} );

const invalidPerson = {
	name: "",
	age: "hello"
};
validatePerson( invalidPerson ); //> {name: ['is required'], age: ['is not a number']}

const validPerson = {
	name: "Juan",
	age: 35
};
validatePerson( validPerson ); //> undefined
```
