@typedef {*} @loader
@parent StealJS.modules

**@loader** is a module that refers to the loader that is loading the module. Any time you need to configure the loader or dynamically import modules, it's best to use `@loader` rather than the global `steal.loader`.

In most cases they are the same, but during the build there are multiple loaders; and if using [steal.steal-clone] to test injected modules.

@option {*} The **@loader** module is the `Loader` that is loading your code.

@body

## Use

To use **@loader** simply import it and use it in the same way you
would use [steal.loader](steal#section_LoaderandSystemnamespaces).

    import loader from "@loader";

	loader.config({
		map: {
			a: "b"
		}
	});

	loader.import("someOtherModule").then(function(mod){

	});

This works with any syntax supported by Steal.
