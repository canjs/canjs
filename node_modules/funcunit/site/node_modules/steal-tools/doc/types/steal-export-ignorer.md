@typedef {Function} steal-tools.export.ignorer ignorer
@parent steal-tools.export.output

Specifies a function that decides of a module should be ignored (not included) in the exported artifact.

@signature `ignorer(name, load)`

@param {moduleName} name The module name.
@param {load} load The load object for this module.

@return {Boolean} True if this module should be ignored.
