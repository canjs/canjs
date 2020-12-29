@function DocumentJS.apis.generate.documentjs documentjs
@parent DocumentJS.apis.command-line

Generates documentation on the command line.

@signature `documentjs [NAME[@PATH]] --watch`

Reads the local directory's `documentjs.json`


@param {String} [NAME] The name of a version or site that this generation will
be limited too.

@param {String} [PATH] The path to the location of a local repository to stand-in for the
version specified by `name`.


@param {String} [--watch=false] If watch is specified, the docs will be rerun when a source file 
changes.


@param {String} [--forceBuild=true] If watch is specified, the docs will be rerun when a source file 
changes.