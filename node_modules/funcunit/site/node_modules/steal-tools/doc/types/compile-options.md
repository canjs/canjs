@typedef {Object} steal-tools.BuildOptions.compileOptions TranspileCompileOptions
@parent steal-tools.BuildOptions.transpiler

An object of options passed into your custom [steal-tools.BuildOptions.transpile] function.

@option {String} source The source code needing to be transpiled.

@option {String} module A module format needed to be transpiled to.

It is either:

* **commonjs**
* **amd**
* **system**
