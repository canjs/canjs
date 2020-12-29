@function steal-tools.cmd.build steal-tools build
@parent steal-tools.cmd 

Call steal-tools [steal-tools.build] from the command line.

@signature `steal-tools build [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `config` or `options` name in [steal-tools.build].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.

@body

## Use

> Note: The `steal-tools build` command-line
utility calls [steal-tools.build steal-tools.build] 
internally. This page documents the specifics of the command-line utility. Read
[steal-tools.build steal-tools.build's documentation] for how to use
the build in various workflows and detailed information
on the options available.


`steal-tools` can be installed into the command line, like:

    > npm install steal-tools -g
    
Then you can run `steal-tools build`, like:

    > steal-tools build --config app/config.js --main app/app

Or, you can access `steal-tools` in _node_modules/.bin_, like:

    > ./node_modules/.bin/steal-tools build \
          --config app/config.js \
          --main app/app
          
If you are using the [npm] plugin you don't need to specify `--config` or `--main`:

    > steal-tools

will default to `package.json!npm` as the config and build out to `dist/`.
