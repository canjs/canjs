@function steal-tools.cmd.steal-tools steal-tools
@parent steal-tools.cmd 

@body

The command line interface for building and exporting with StealTools. There are 2 subcommands:

- `build`: Builds bundles that can be progressively loaded. Use this option if you are creating a build for your production application. See [steal-tools.cmd.build] for more information.
- `transform`: Transforms your application/library into a single file that can be used without a loader. Use this option if you have a small application or library that you just want to use as a global. See [steal-tools.cmd.transform] for more information.


## Use

By default simply calling `steal-tools` will assume you are doing `build`. If you are using the [npm] plugin (and you really should be), this is the only thing you need to type. For example say you had an application like:

```
app/
	package.json
	app.html
	app.js
	adder/
		adder.js
	my_module/
		my_module.js
		my_module.less
```

And your `package.json` looks like:

```json
{
  "name": "my-app",
  "main": "app/app.js"
}
```

Perform your build:

```shell
steal-tools
```

Will produce a `dist/bundles` folder where your bundled application build is written.
