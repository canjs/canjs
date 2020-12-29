@function steal-tools.cmd.transform steal-tools transform
@parent steal-tools.cmd 

Transform a module from the command line.

@signature `steal-tools transform [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `config`, `pluginifierOptions`, or `options` name in 
[steal-tools.transformImport] or [steal-tools.transform transform].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.  The `ignores` option
will be converted to a regular expression.

@return {String} Writes the output to the console.

@body

## Use

> Note: The `steal-tools transform` command-line
utility calls [steal-tools.transform steal-tools.transform] and
[steal-tools.transformImport steal-tools.transformImport]
internally. This page documents the specifics of the command-line utility. Read
[steal-tools.transform steal-tools.transform's documentation] for how to use
transform in various workflows and detailed information
on the options available.

Access `steal-tools` in _node_modules/.bin_, like:

    > ./node_modules/.bin/steal-tools transform \
               --config app/config.js \
               --main app \
               --ignores foo/.+
               > app.js

Or, `steal-tools` can be installed into the command line, like:

    > npm install steal-tools -g
    
Then you can run `steal-tools transform`, like:

    > steal-tools transform \
               --config app/config.js \
               --main app \
               --ignores foo/.+
               > app.js
               