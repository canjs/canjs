@function steal-tools.cmd.optimize steal-tools optimize
@parent steal-tools.cmd 

Call steal-tools [steal-tools.optimize] from the command line.

@signature `steal-tools optimize [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `config` or `options` name in [steal-tools.build].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.

@body

## Use

> Note: The `steal-tools optimize` command-line
utility calls [steal-tools.optimize steal-tools.optimize] 
internally. This page documents the specifics of the command-line utility. Read
[steal-tools.optimize steal-tools.optimize's documentation] for how to use
the build in various workflows and detailed information
on the options available.

`steal-tools` can be installed into the command line, like:

    > npm install steal-tools -g
 
Then you can run `steal-tools optimize`, like:

    > steal-tools optimize --config app/config.js --main app/app --target node

Or, you can access `steal-tools` in _node_modules/.bin_, like:

    > ./node_modules/.bin/steal-tools optimize \
          --config app/config.js \
          --main app/app

To provide build targets pass any of the supported options separated by a space, like:

    > steal-tools build --config app/config.js --main app/app --target web node

If you are using the [npm] plugin you don't need to specify `--config` or `--main`:

    > steal-tools optimize

will default to `package.json!npm` as the config and build out to `dist/`.
