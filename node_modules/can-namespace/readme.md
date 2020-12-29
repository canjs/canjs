# can-namespace

Namespace where can-* packages are registered

## Usage

`can-namespace` exports an object that can be used to ensure only one version of a module is loaded in an app.

For example, if you have a module `can-unicorn` that you want to make sure is only loaded a single time, you can use `can-namespace`:

```js
var namespace = require('can-namespace');

var unicorn = {
	// ...
};

if (namespace.unicorn) {
	throw new Error("You can't have two versions of can-unicorn, check your dependencies");
} else {
	module.exports = namespace.unicorn = unicorn;
}
```

Any module requiring `can-namespace` will receive the same module because only one version of `can-namespace` will ever be published.
