@property {Array<String>|String} config.main main
@parent StealJS.config

The entry point of the application.

@signature `main="packageName/main"`

Loads an entry point by referencing it in association with the [config.packageName] of your application.

```html
<script src="node_modules/steal/steal.js"
  main="todo-app/app"></script>
```

@param {String} packageName The name of the package from the package.json `name` field.

@param {String} main The name of the entry module (usually a JavaScript file).

@signature `main="~/main"`

Loads an entry point by referencing in association with the [tilde homeAlias].

```html
<script src="node_modules/steal/steal.js"
  main="~/app"></script>
```

@param {String} main The name of the entry module (usually a JavaScript file).

@signature `{ main: "packageName/main" }`

Loads an entry point by referencing the main in a configuration setting (such as within [steal-tools]). Any tool which takes a steal configuration object can accept a main, for example:

```js
const stealTools = require("steal-tools");

stealTools.build({
  config: __dirname + "/package.json!npm",
  main: "todo-app/app"
});
```

This method can also be used to configure steal within HTML, by setting the main prior to the steal script tag like so:

```html
<script>
  steal = {
    baseURL: "/apps/todos",
    main: "~/main"
  };
</script>
<script src="node_modules/steal/steal.js"></script>
```

@body

## Omitting the main

The __main__ module is not loaded by default. Merely adding a steal script tag will not load any code:

```js
<script src="node_modules/steal/steal.js"></script>
```

This is particular useful for demo pages where there isn't an associated JavaScript file for that particular page, and code is written inline using a [steal.steal-module] tag:

```js
<div id="root"></div>

<script src="node_modules/steal/steal.js"></script>

<script type="steal-module">
  import TodoList from "~/components/todo-list";

  document.querySelector("#root").appendChild(new TodoList());
</script>
```

## Missing main warning

![No main is loaded](https://user-images.githubusercontent.com/361671/42763505-425adc50-88e1-11e8-9c01-17957b3f5ce5.png)

This warning is reported to the console when steal starts and no other modules are loaded. This is usually a mistake as you wouldn't be using steal if you didn't intend to load modules with it. It could be that:

* You forgot to include a `main` attribute in the steal script tag. See the above signatures for how to do that.
* You intend to create an inline code demo using a [steal.steal-module] or one of the other techniques for loading code dynamically such as [steal.import].

[steal] uses a heuristic to determine if this warning should be shown. If you believe the warning is shown by mistake please [submit an issue](https://github.com/stealjs/steal/issues/new).
