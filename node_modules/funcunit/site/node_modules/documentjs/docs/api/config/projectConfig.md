@typedef {{}} DocumentJS.projectConfig projectConfig
@parent DocumentJS.apis.config

The configuration options for a project to retrieve and document.

@option {String} source The source location of the project.

@option {String} [version] The version name of the project. The default value is
this project config's `versions` key.

@option {String} [path] The location of where the project should be 
installed. The default is to use [DocumentJS.docConfig]'s `versionDest`.

@option {Boolean} [npmInstall=false] Use npm to install the resource.

@option {Object<String,DocumentJS.siteConfig>} [sites] The sites that should be created for the
project if the project does not contain its own _documentjs.json_.

@body

## Use

A projectConfig object is used to configure the behavior of a project.  These objects are found
within a [DocumentJS.docConfig]'s `versions` property.  For example:

```
{
  versions: {
    "1.1": 
    // projectConfig start
    {
      "source": "git://github.com/bitovi/canjs#1.1-legacy",
      "sites": {
        "docs": {
          "parent" : "canjs"
        }
      },
      "path": "./old/1.1/can",
      "npmInstall": false
    }
    // projectConfig end
  },
  ...
}
```

A projectConfig specifies where and how to retrieve a project, where to install it, and sometimes includes
a "sites" object if the project being retrieved does not contain its own `documentjs.json`.



