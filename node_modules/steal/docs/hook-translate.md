@page steal.hooks.translate translate
@parent StealJS.hooks

A loader hook that converts a module's source, if needed. The most common usage of this hook is for transpiling a language down to JavaScript.

@signature `translate(load)`

@param {load} load The load object associated with this module.

@return {Promise|String} The translated source or a Promise that will resolve with the translated source.
