@function steal-tools.cmd.export steal-tools export
@parent steal-tools.cmd

Export a project's modules to other forms and formats from the command line.

@signature `steal-tools export [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `steal`, `options`, or `outputs` name in
[steal-tools.export.object].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.  The `ignores` option
will be converted to a regular expression.

@return {String} Writes the output to the console.

@body

## Use

> Note: The `steal-tools export` command-line
utility calls [steal-tools.export steal-tools.export] internally.
This page documents the specifics of the command-line utility, which is useful
to export to default module outputs like `+amd`,`+cjs`, `+global-js` and
`+global-css` (by passing --amd, --cjs, --global or --all). Read
[steal-tools.export steal-tools.export's documentation] for how to use
export in various workflows and detailed information on the options available.


Access `steal-tools` in _node_modules/.bin_, like:

    > ./node_modules/.bin/steal-tools export \
               --config app/config.js \
               --main app \
               --all

Or, `steal-tools` can be installed into the command line, like:

    > npm install steal-tools -g

Then you can run `steal-tools transform`, like:

    > steal-tools export \
               --config app/config.js \
               --main app \
               --amd
