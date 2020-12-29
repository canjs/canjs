@module {Object} can-validate-legacy
@parent can-data-validation
@collection can-legacy
@group can-validate-legacy.core 1 can-validate-legacy Core
@group can-validate-legacy.map-plugin 2 can-map Plugin
@group can-validate-legacy.shims 3 Shims
@package ../package.json

@description A plugin for CanJS that wraps any validation library to `can.validate`.
**Can-Validate doesn't do any validation of its own** but instead provides some abstraction to your library of choice. The chosen library is registered with can-validate using a shim.

@type {Object}

Can-Validate provides methods that can be used to validate values regardless of the validation library used.

  ```js
  var validate = require("can-validate-legacy");
  require("can-validate-legacy/shims/validatejs.shim");

  var user = {
	  firstName: "juan"
  };

  var constraints = {
	  firstName: {
		  required: true,
		  format: {
			  pattern: /^[A-Z].*/,
      		  message: "^ must be proper cased."
		  }
	  }
  };

  var errors = validate.validate(user, constraints);
  ```

@body

Can-Validate can be used in two ways, in a can-map instance or standalone.

## Usage

The module should require the following files

```javascript
import 'can-validate-legacy';
import 'validate.js';
import 'can-validate-legacy/shims/validatejs.shim';
```
Now, can-validate can be used in two ways, either in a can-map or standalone.

### Can-Map Plugin Usage

Using the plugin for can-map requires the can-map-define plugins as well.

```javascript
import 'can-validate-legacy/map/validate/validate';
import 'can/map/define/define';
```

All can-maps created in the module will now have an augmented setter that checks properties as they are set.

```javascript
var ViewModel = Map.extend({
  define: {
    name: {
      value: '',
      validate: {
        required: true
      }
    }
  }
});
var viewModel = new ViewModel({});
//
viewModel.validate();
// `errors` will have an error because the `name` value is empty
//  and required is true.
viewModel.attr('errors'); //> Returns the raw response from validation library
viewModel.attr('name', 'Juan');
viewModel.attr('errors'); // => Errors is now empty!
```

### Standalone Usage

First, make sure the correct files are required.

```javascript
// can.validate is now available
import 'can-validate-legacy';
// Substitute with your library of choice
import 'validate.js';
// If not using ValidateJS, then you'll need a custom shim
import 'can-validate-legacy/shims/validatejs.shim';
```

Now, we can validate many or a single property. Let's start with the
following values and constraints:


```javascript
var user = {
	firstName: "juan",
	lastName: "Orozco"
};

var constraints = {
	firstName: {
		required: true,
		format: {
			pattern: /^[A-Z].*/,
			message: "^ must be proper cased."
		}
	},
	lastName: {
		required: true,
		format: {
			pattern: /^[A-Z].*/,
			message: "^ must be proper cased."
		}
	}
};
```

To validate many properties, just run...

```javascript
var errors = validate.validate(user, constraints);
```

The `once` method allows validating just a single value.

```javascript
var errors = validate.once(user.firstName, constraints.firstName, 'firstName');
```


## Shims and Validation Libraries

A shim registers a validation library with can-validate. It also processes properties and values into a structure more acceptable by the validation library. This allows consuming libraries to switch validation libraries simply by switching out their shim - any new behavior or legacy behavior can be baked into the new shim.

Don't have a library of choice? Can.Validate ships with a shim for [ValidateJS](http://validatejs.org/).

## Change Log

A change log is maintained [here](changelog.html).

## Contributing

Want to contribute? [Read the contributing](contributing.html) guide to start.
