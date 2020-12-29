@typedef {{}} load load
@parent StealJS.types

The **load** object is a POJO that is used to refer to a module during module loading lifecycle hooks.

@option {String} name The [moduleName] of this module. The **name** property always exists on the *load* object. The load object is only created after the module name is known; after the [steal.hooks.normalize] step.

@option {String} [address] The URL / filesystem path, or generic location of which the module can be fetched. The address is known after the [steal.hooks.locate] step.

@option {String} [source] The actual source code for this module.

@option {load.metadata} metadata The metadata associated with this module, such as which module format is being used.
