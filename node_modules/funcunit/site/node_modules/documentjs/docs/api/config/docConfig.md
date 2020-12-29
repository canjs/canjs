@typedef {{}} DocumentJS.docConfig docConfig
@parent DocumentJS.apis.config

Configures the behavior of DocumentJS.  The following are values found within
a _documentjs.json_ or the [DocumentJS.apis.generate.grunt] configuration.

@option {Object<String,DocumentJS.projectConfig|String>} [versions] A map of version names
to their source or to a [DocumentJS.projectConfig projectConfig] that specifies where and how
to install the release. For example:

    {
      "versions" : {
        "1.8.4": "https://github.com/org/project/tree/v1.8.4",
        "2.0.9": "https://github.com/org/project/tree/v2.0.9"
        "3.0.0-pre": {
          "source": "https://github.com/org/project#major",
          "npmInstall": true
        }
      }
    }

Each versions key is a version name and the value is either a [DocumentJS.projectConfig] or
will be made into a [DocumentJS.projectConfig]'s source.

Each version will be downloaded to a location depending on `versionDest`, `defaultDest` and
`defaultVersion`.  If the version key equals `defaultVersion` the project will be installed
using `defaultDest`; otherwise, the project will be installed using `versionDest`.

@option {String} [defaultVersion] The default version that will be copied
into the `defaultDest` location. This is so users can go to `http://site.com/api`
to find the latest docs and not `http://site.com/2.0.1/api`.

@option {String} [defaultDest="./<%\= name %>"] The location of where the default docs should
be rendered to.

@option {String} [versionDest="./<%\=version%>/<%\= name %>"] The templated directory name of where each version's download
and docs should be created.  The default is `"<%= version%>"`.  This means
that a _2.0.1_ version name will be downloaded to a _2.0.1_ folder. DocumentJS
will then look for that version's `documentjs.json` and run that.

@option {Object<String,DocumentJS.siteConfig>} sites A map of site names and
options that configure their behavior.

@option {DocumentJS.siteConfig} siteDefaults Default values for any sites configs.

@body

## Use

A `docConfig` is most commonly found in `documentjs.json`. It configures
the behavior of DocumentJS.  There are two main behaviors that `docObject` controls:

 - The retrieval of other projects or versions to be documented.
 - The documentation behavior of the current project.

A complex configuration, like the one used for [producing CanJS.com](http://github.com/bitovi/canjs.com),
might looks like:

    {
      versions: {
        "1.1.8" : "https://github.com/bitovi/canjs/tree/1.1-legacy",
        "2.1.4" : "https://github.com/bitovi/canjs/tree/v2.1.4",
        "2.2.0-pre" : "https://github.com/bitovi/canjs/tree/minor",
        "3.0.0-pre" : {
          "source": "https://github.com/bitovi/canjs/tree/major",
          "npmInstall" : true
        }
      },
      versionDest: "<%= version %>",
      defaultVersion: "2.1.4",
      defaultDest: ".",
      siteDefaults: {
        "templates" : "theme/templates"
      },
      sites: {
      	pages: {
      	  pattern: "_pages/*.md",
      	  dest: "."
      	}
      }
    }
    
This configuration will download the listed `versions` into "./<%= version %>/canjs" except for 
2.1.4, which be downloaded to "./canjs".  Then each version's `documentjs.json` will be 
generated. Finally, all markdown files in `_pages` will be generated to ".".
    
