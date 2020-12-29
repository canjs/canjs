@module {Object} validatejs-shim ValidateJS Shim
@parent can-validate-legacy.shims

@type

Hello world

@description
This shim requires ValidateJS in the consuming app's package.json. It processes
the passed in options so they can be properly used by the ValidateJS libarary.
@body

## Initialization
Import ValidateJS, validate plugin and this shim to immediately use the
ValidateJS in a CanJS project plugin.
```js
import "validatejs";
import "can-validate/can-validate";
import "can-validate/shims/validatejs.shim";
```

## Usage

@signature `validate(MAP_OF_VALUES, MAP_OF_CONSTRAINTS)`

```javascript
var errors = validate.validate(user, constraints);
```

Validate is a can.Construct that is set to can.validate. It is possible to create
an instance for the purpose of storing errors in the instance. It is recommended
to use can.Map, can.Map.define, and can.Map.validate instead.

@signature `once(VALUE, CONSTRAINTS, VALUE_NAME)`

```javascript
var errors = validate.once(user.firstName, constraints.firstName, 'firstName');
```
@signature `isValid(VALUE, CONSTRAINTS, VALUE_NAME)`

```javascript
var errors = validate.once(user.firstName, constraints.firstName, 'firstName');
```
