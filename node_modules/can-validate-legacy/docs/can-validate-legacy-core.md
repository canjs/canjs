@function can-validate-legacy.core Core
@parent can-validate-legacy

@description
 Returns an object with helpful methods that will call a validation library to validate
 values.

 How each method behaves depends on the chosen shim and validation library.

@body

## Initialization

```javascript
var validate = require('can-validate-legacy');
// Validation library
require('validate.js');
// Shim for library
require('can-validate-legacy/shims/validatejs');
```

The key initializing part is the shim. The shim will define how the can-validate methods
behave and will also define the necessary parameters.

## Registering a Shim

If a new shim is needed, it must first be register itself with can-validate.

@signature `validate.register(LIBRARY_NAME, MAP_OF_METHODS)`

The `MAP_OF_METHODS` consists of three methods that define the three main uses cases, validate many, validate one, and check one.

## Demo

@demo ./demo/core-demo/demo.html
