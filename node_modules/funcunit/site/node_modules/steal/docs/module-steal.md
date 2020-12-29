@typedef {*} @steal
@parent StealJS.modules

`@steal` is a module that refers to the instance of **steal** that is loading your module. You might use @steal in scenarios where you need to use Steal's special methods, such as [steal.done], and don't want to rely on the global `window.steal`.

@option {*} The `@steal` module is the `steal` that is loading your code.

@body

## Use

To use `@steal` simply import it into your code:

    import steal from "@steal";

	// Wait for steal to finish loading
	steal.done().then(function(){

	});

This works with any syntax supported by StealJS.
