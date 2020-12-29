@typedef {object} can-validate.error Error
@parent can-validate.types

An object that defines a validation failure.

@type {Object}

  @option {string} message A reason why value is in an invalid state.

  ```js
const error = { "message": "is required" };
```

  @option {string|array} [related=*] Key names that are related to triggering the
  invalid state of the current value.

  ```json
  { "message": "is required", "related": "age"}
  ```

  ```json
  { "message": "is required", "related": ["billingZip", "residenceZip"]}
  ```

  If no value is passed, the wild card value (`*`) is used internally for grouping.

@body

## Wild card

It is common to group errors by the property that triggered the error state. In
some cases, it possible to group errors where one error is not identified with
a property.

```js
const errors = [
	{ message: "is required" },
	{
		message: "must be a number",
		related: "age"
	}
];
```

In this situation, the first object in the array is not identified with a property.
This item will have a `related` assumed to be `*`. It possible for this error item
to be grouped with other "orphaned" errors.

```js
const errors = [
	{
		message: "is required",
		related: "*"
	}, {
		message: "must be a number",
		related: "age"
	}
];
```
