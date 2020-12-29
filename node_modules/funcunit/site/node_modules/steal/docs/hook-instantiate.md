@page steal.hooks.instantiate instantiate
@parent StealJS.hooks

A loader hook that determines the module's dependencies and provides a function that will result in its value.

@signature `instantiate(load)`

@param {load} load The load object associated with this module.

@return {Promise|instantiateResult} The [instantiateResult] is an object that describes the module by providing its dependencies and a function that will provide its value.
