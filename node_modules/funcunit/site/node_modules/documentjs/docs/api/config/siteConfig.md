@typedef {{}} DocumentJS.siteConfig siteConfig
@parent DocumentJS.apis.config

The configuration options within a [DocumentJS.docConfig]'s `sites` objects or `sitesDefaults` object.


@option {String|documentjs.find.globObject} [glob="**/*.\{js,md\}"] 

Configures the files that will be processed into documentation. The glob
option either specifies a [minmatch](https://github.com/isaacs/minimatch) 
pattern like:

    {glob: "*.js"}

Or a [documentjs.find.globObject GlobObject] that specifies the 
a [minmatch](https://github.com/isaacs/minimatch) pattern and
other options like:

    {
      glob: {
        pattern: "*.js",
        cwd: __dirname,
        ignore: "{some_folder}/**/*" 
      }
    }

By default the pattern `"**/*.{js,md}"` is used, which
searches for all `.js` and `.md` files within the project. And
the default ignore is `"{node_modules,bower_components}/**/*"` which
ignores everything in the _node_modules_ and _bower_components_  folder.

@option {String} [dest] The location of the folder where DocumentJS should
write the output. Locations should be relative to the parent folder of the 
_documentjs.json_ file. If this is not provided, the site name of the configuration
is used.

@option {String} [parent] The name of the [documentjs.process.docObject] that will be 
shown at `index.html`. If one is not provided, one will be attempted to be found by:

 - Trying to find the docObject that is parent of every other docObject.
 - Trying to find the docObject that has the most children.

If that fails, an "index" docObject might be created and set as the parent of 
every other docObject that does not have a parent.


@option {Object} [pageConfig] An object that is made availalbe to the generated HTML pages.


@option {String} static The location of static content used to overwrite or
add to the default static content.

@option {Boolean} [forceBuild=false] If set to `true`, rebuilds the 
static bundle even if it has already been built.

@option {Boolean} [minifyBuild=true] If set to `false` the build will not 
be minified. This behavior should be implemented by the "build" module.

@option {Boolean} [devBuild=false] If set to `true` the build will not be built
so that individual files will be loaded. This behavior should be implemented by the "build" module.

@option {String} [templates] The location of templates used to overwrite or
add to the default templates.

@option {String} [tags] A path to a module that determines which tags will be used
to process the site. The module must export a function that takes the default [documentjs.tags] object and returns
the tags that will be used.

Example use:

```
tags: "./theme/tags"
```

Example module:

```js
// theme/tags.js
module.exports = function(defaultTags) {
	tags = _.extend({},defaultTags);
    tags.customTag = {add: function(){}, ...}
    return tags;
};
```

@option {moduleName|Array<moduleName>} [generators]

Generators specifies a generator module or array of modules used to create an 
output for documentation. The default generator is "html" which maps
to documentjs's internal [documentjs.generators.html html generator].

You can specify other modules which will be passed a promise containing
the [documentjs.process.docMap docMap] and the `options` and be expected
to return a promise that resolves when they are complete.

@option {Boolean} [singlePage=false] If `true` only a single HTML page will be written out. The
`parent` docObject will be [documentjs.generators.html.build.renderer rendered] with an 
additional `.docMap` property set to the [documentjs.process.docMap].  If you set this,
the default templates are not designed to work with this.  Make sure you set `templates` to
overwrite them.


@body 

## Use

A `siteConfig` object configures a single call to [documentjs.generate].  It 
specifies files to be converted to documentation and configures how the output should be 
generated.  It looks like:

```
{
  glob: "*.js",
  dest: "../docs",
  templates: "theme/templates"
}
```


A `siteConfig` object is within a [DocumentJS.docConfig]'s `sites` or `siteDefaults`
objects like:

    {
      siteDefaults: {
        templates: "theme/templates"
      },
      sites: {
        "api": {
          glob: "*.js",
          dest: "../docs"
        }
      }
    }



