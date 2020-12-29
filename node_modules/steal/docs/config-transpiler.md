@property {String} config.transpiler transpiler
@parent StealJS.config

Specifies which transpiler to use for ES6 modules. Traceur has been around for a longer time, but Babel provides advantages such as a smaller overhead.

@option {String=traceur} Which ES6 compiler to user to generate ES5 code. Possible values:

* `babel`: The default, uses [Babel](https://babeljs.io/).
* `traceur`: Uses [traceur-compiler](https://github.com/google/traceur-compiler).


@body

## Use

If you'd like to control which ES6 transpiler is used simply set in your config:

```json
"steal": {
	"transpiler": "traceur"
}
```
