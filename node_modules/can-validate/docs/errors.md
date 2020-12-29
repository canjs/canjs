@typedef {undefined|null|string|ERROR|array} can-validate.errors Errors
@parent can-validate.types

The expected response from a validator if a value fails validation.

@option {undefined} Expected when value passes validation.

@option {null} Will be treated similarly as `undefined`; value passed validation.

@option {string} A message explaining the validation failure.

```js
"is required";
```

@option {array} Items can be any of the valid [can-validate.errors].

```json
[
    "is required",
    {
        "message": "is required",
        "related": ["billingZip", "residenceZip"]
    }
]
```

@option {ERROR} An object used to describe an error message. See [can-validate.error].

```json
{
    "message": "is required",
    "related": ["billingZip", "residenceZip"]
}
```
