@function steal-tools.cmd.bundle steal-tools bundle
@parent steal-tools.cmd 

Call steal-tools [steal-tools.bundle] from the command line.

@signature `steal-tools bundle [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `config` or `options` name in [steal-tools.bundle].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.

@body

## Use

> Note: The `steal-tools bundle` command-line
utility calls [steal-tools.bundle steal-tools.bundle] 
internally. This page documents the specifics of the command-line utility. Read
[steal-tools.bundle steal-tools.bundle's documentation] for how to use
the bundle in various workflows and detailed information
on the options available.

`steal-tools` can be installed into the command line, like:

    > npm install steal-tools -g

Then you can run `steal-tools bundle`, like:

    > steal-tools build --config app/config.js --main app/app

Or, you can access `steal-tools` in _node_modules/.bin_, like:

    > ./node_modules/.bin/steal-tools bundle \
          --config app/config.js \
          --main app/app

If you are using the [npm] plugin you don't need to specify `--config` or `--main`:

    > steal-tools

will default to `package.json!npm` as the config and build out to the root folder of your project.

## Dependencies bundle and development bundles

The `steal-tools bundle` command provides two options to easily create development bundles if you're using [npm].

    > steal-tools bundle --dev

The command above will create a bundle including the application dependencies located in the `node_modules` folder and the `package.json!npm` module with is the default config module. 

If you don't want to generate the bundle each time config changes, or you only want to create a bundle of the modules in `node_modules` you can run:

    > steal-tools bundle --deps

See [steal-tools.bundle steal-tools.bundle's documentation] for details on how to load the development bundles.
