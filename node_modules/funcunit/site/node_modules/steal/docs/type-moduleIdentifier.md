@typedef {String} moduleIdentifier
@parent StealJS.types

@option {String}

The string passed into import functions such as `require()` when using CommonJS, `import` when using ES6, and [System.import] when dynamically loading a module.

@body

A **moduleIdentifier** is a string written in code to import a module. It could be:

* Relative to the current module like `'./foo'`.
* The name of an NPM dependency of your project like `'lodash'`.
* The name you are using to refer to a module that has been [System.map mapped] to another [moduleName].

When Steal imports your code it sees the moduleIdentifiers and through [steal.hooks.normalize normalization] it converts these to [moduleName moduleNames] that it uses as keys in the module registry.
