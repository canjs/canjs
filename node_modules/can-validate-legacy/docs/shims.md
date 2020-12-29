@function can-validate-legacy.shims Shims
@parent can-validate-legacy

Shims allow the flexibility of using any validation library with `can.validate`.
Creating a shim requires just three methods, `isValid`, `once`, and `validate`.
The shim should also import the validation library itself. The shim then registers
itself with can.validate and passes the methods object.

## Available Shims

The original validations plugin for CanJS included a basic validation library, it
was ported over to can-validate as it's own library and can be used with can-validate
using it's shim.

There is also a shim for the popular library ValidateJS.

More libraries/shims may be added in the future but it is very easy to create a shim
for any library in your project.


## Creating your own shim

Start by extending can.Construct.

```js
var Shim = can.Construct.extend({});
```

You'll need `can` and your library, so let's add them...

```js
import can from 'can';
import myLibrary from 'awesomeLibrary';

var Shim = can.Construct.extend({});
```

We might as well register the shim now...

```js
import can from 'can';
import myLibrary from 'awesomeLibrary';

var Shim = can.Construct.extend({});

can.validate.register('myLibrary', Shim);
```

Sweet. Looks good so far. Now let's add the meat.

```js
import can from 'can';
import myLibrary from 'awesomeLibrary';

var Shim = can.Construct.extend({
	isValid: function (value, options, name) {
		return;
	},
	once: function (value, options) {
		return;
	},
	validate: function (values, options) {
		return;
	}
});

can.validate.register('myLibrary', Shim);
```

This is all that is required. Not a lot of validation going on but the rest depends
on how your validation library works.

You may need to process the options or values a bit. You might even need to make
sure the errors object is correct.

**Remember, these methods should return `undefined` if no errors occurred. Otherwise,
they should return an array of errors.**
