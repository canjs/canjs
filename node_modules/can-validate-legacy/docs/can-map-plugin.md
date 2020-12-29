@function can-validate-legacy.map-plugin Map Plugin
@parent can-validate-legacy

@description The can.Map plugin will works alongside can.Map.define to add validation
to properties on a can.Map. Importing the plugin, validation library, and a shim will
allow the ability to dynamically check values against validation configuration. errors
are stored on the can.Map instance and are observable.

@body

## Initialization
Import the validation library, validate plugin and a shim to immediately use the
can.Map.validate plugin.
```js
import "validatejs";
import "can-validate/map/validate";
import "can-validate/shims/validatejs.shim";
```

## Usage

Using can-validate Map plugin only requires two extra actions,

- add a validate object to the desired property
- add a check in the view for the errors object

The validate object depends on the desired valdiation library. The examples
below use ValidateJS.

```js
var ViewModel = can.Map.extend({
  define: {
    name: {
      value: "",
      validate: {
        required: true
      }
    }
  }
});
var viewModel = new ViewModel({});
viewModel.validate();
// `errors` will have an error because the `name` value is empty
//  and required is true.
viewModel.attr("errors");
viewModel.attr("name", "Juan");
viewModel.attr("errors"); // => Errors is now empty!
```

## Demo

@demo ./can-validate/map/validate/demo.html
