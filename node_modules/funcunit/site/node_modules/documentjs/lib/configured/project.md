@typedef {{}} documentjs.configured.projectConfig projectConfig
@parent documentjs.configured.types

The configuration options for a project to retrieve and document.

@option {String} source The source location of the project.



@option {String} [version] The version name of the project.

@option {String} [path] The location of where the project should be 
installed. The default

@option {String} [simulatedPath] Where the project appears to be installed if it is not being 
copied to that location.  This is typically set autmatically when a command line
overwrite is provided.


@option {Boolean} [skipGet=false] The project's resource will not be retrieved.  The 
documentation will produced from `simulatedPath`. This is typically set autmatically when a command line
overwrite is provided.

@option {Boolean} [npmInstall=false] Use npm to install the resource.

@option {DocumentJS.docConfig} [docConfig] The full docConfig of this project. If
provided, `documentjs.json` will not be read.


@option {Boolean} [watch=false] If true, setup a watch and regenerate.
