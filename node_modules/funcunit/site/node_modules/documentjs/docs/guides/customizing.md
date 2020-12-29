@page DocumentJS.guides.customizing customizing
@parent DocumentJS.guides 4

Learn how to change the appearance and JavaScript behavior of your generated html documentation.

@body

The [documentjs.generators.html html generator] allows you to completely
customize the look and behavior of the site. You can also supply your
own generators to build other forms of documentation.

## Customizing the default HTML generator

You can customize the templates and helpers
used to render a [documentjs.process.docObject docObject] and customize
the JavaScript and CSS used by the HTML pages.  This behavior
is controlled mostly by the [DocumentJS.siteConfig siteConfig]'s
`templates` and `static` options.  However, some tags like [documentjs.tags.hide @hide]
allow you to alter the behavior slightly.

## Changing the HTML

The [documentjs.generators.html html generator] uses 
[Handlebars](http://handlebarsjs.com/) templates and helpers 
to render [documentjs.process.docObject docObjects]. Overwrite the 
default templates with the [DocumentJS.siteConfig siteConfig] `templates` 
option. If you are producing a multi-versioned site, and you want all versions
to have the same template, your website's [DocumentJS.docConfig documentjs.json] might
look like:

    {
      "versions": { ... }
      "siteDefaults": {
        "templates": "theme/templates"
      }
    } 

The `templates` path should be specified relative to the `documentjs.json` folder.

This will use the templates (and helpers) in "theme/templates" to overwrite
the default helpers and templates. The default templates can be found 
in `documentjs/site/default/templates`.  

`documentjs/site/default/templates` has the following templates:

 - _layout.mustache_ - Contains the outer most content that is the same on every page. 
   The page's script tags are loaded here.
 - _content.mustache_ - Rendered within _layout.mustache_. It calls out to all other templates as partials.
 - _menu.mustache_ - The sidebar menu.
 - _active-menu.mustache_ - The part of the sidebar menu that shows the children of the active item.
 - _signature.mustache_ - Shows a "signature" block.  A signature block for a function has the signature of the function and the params listed within it.
 - _title.mustache_ - The header of each rendered page.
 - _types.mustache_ - Given a [documentjs.process.valueData valueData], iterates through each of its [documentjs.process.typeData types] and creates a signature with it.

For example, to make a change to the layout, copy _documentjs/site/default/templates/layout.mustache_
to _theme/templates_ and make changes in your copy.

#### Adding Helpers

You can add and use your own Handlebars helpers by creating a `.js` file in
your templates directory.  For example, you can 
create _theme/templates/helpers.js_.  Any `.js` file will be required
as a module with CommonJS.  The module is expect to export a 
[documentjs.generators.html.types.makeHelpers makeHelpers function] like:

    // theme/templates/helpers.js
    module.exports = function(docMap, options, getCurrent){
      return {
        "hello-world" : function(){
          return "Hello World!"
        }
      }
    };

This allows you to write `{{hello-world}}` and get back:

    Hello World!

This behavior is provided by [documentjs.generators.html.build.helpers generators.html.build.helpers].

## Changing static resources: Styles, Images, and JavaScript

The html generator [documentjs.generators.html.build.staticDist builds a static distributable] that
includes the CSS, Images, and JavaScript used by the site.  The default content
used to build the site can be found within _documentjs/site/default/static_.

You can overwrite the 
default static content with the [DocumentJS.siteConfig siteConfig] `static` 
option. If you are producing a multi-versioned site, and you want all versions
to have the same static content, your website's [DocumentJS.docConfig documentjs.json] might
look like:

    {
      "versions": { ... }
      "siteDefaults": {
        "static": "theme/static"
      }
    } 

After the default and static content have been combined, the `static/build.js` file
is required with CommonJS and run. `static/build.js` is expected to export a
[documentjs.generators.html.types.builder builder] function that builds the final static content
and copies it to a distributable location.

The default builder uses [StealJS](http://stealjs.com) to build a [CanJS](http://canjs.com) and
[LESS](http://lesscss.org) application.  It copies the minfied `css` and `js` bundles as well as
all files in the _static/fonts_, _static/img_, and _static/templates_ folder to the distributable location.  

It's likely you don't have to write a custom builder and can instead overwrite the default CSS, Image, and
JS files used by the builder.

### Changing Styles

_documentjs/site/default/static/styles_ contains the default styles. The styles are 
broken down functionally:

 - _styles.less_ - Loads all styles.
 - _variables.less_ - Configuration of colors and image location variables.
 - _icons.less_ - Classes set up for icon usage.
 - _api.less_ - Styles for the main content area.  
 - _base.less_ - Styles for html tags, sans typography.
 - _typography.less_ - Styles for all text.
 - _brand.less_ - Styles for the logo `.brand` class.
 - _code.less_ - Styles for code blocks.
 - _ie.less_- If internet explorer is used, this style is used.
 - _layout.less_ - Styles for the _layout.mustache_ template.
 - _helper.less_ - Helper classes to control layout.
 - _reset.less_ - A css reset.
 - _sidebar.less_ - Styles for the sidebar.
 - _buttons.less_ - Styles for the default button.
 
To change the default styles, copy one of the `less` files above to your 
`siteConfig.static`'s _styles_ folder and make changes.

#### Changing Colors

To change colors, copy _variables.less_ and change the color palette options:

     @@haze: ##cccccc;
     
Below the color palette definitions, you can see how they are mapped to
parts of the application.

#### Adding other styles

To add another style, create the less or css file in 
your `siteConfig.static`'s _styles_ folder. Then, copy _styles.less_ and import your 
stylesheet:

    @@import 'ie.less';
    @@import 'mystyles.less'

### Changing Images

To change the default images, add your replacement images 
to `siteConfig.static`'s _img_ folder.  You probably want to create a:

 - _img/logo.svg_ - Your project's logo.
 - _img/logo-grey.svg_ Your project's logo in greyscale.

### Changing JavaScript

The default builder loads and builds the _documentjs/site/default/static/static.js_ file
using [StealJS](http://stealjs.com). This imports various modules and initializes
their behavior.  StealJS supports importing ES6, AMD, and CJS modules.  To add your own 
behavior:

1. Add your JavaScript files to the `siteConfig.static` folder.
2. Copy _documentjs/site/default/static/static.js_ to `siteConfig.static` folder.
3. Edit your copy of `static.js` to import and initialize your JavaScript code:

        steal(
          "./your_module.js"
          "./content_list.js",
	      "./frame_helper.js",
	      "./versions.js",
	      "./styles/styles.less!",
	      "./prettify",function(YourModule, ContentList, FrameHelper, ...){
	        // call your module
            YourModule()
            // leave the rest of the code
            var codes = document.getElementsByTagName("code");
	        ...
	    });

## Writing your own generator

You can create your own [documentjs.generator generator] module which gives you
complete control over how a [documentjs.process.docMap docMap] is converted to
some output.

If you do decide to create your own generator, the best place to do that is within
its own project that is registered on npm.  To do that, create a github project with
a `main.js` that exports a [documentjs.generator generator] function like:

    var Q = require('q'),
        fs = require('fs'),
        writeFile = Q.denodify(fs.writeFile),
        path = require('path');
        
    module.exports = function(docMapPromise, options){
       return docMapPromise.then(function(docMap){
         return writeFile(
             path.join(options.dest,'docMap.json'), 
             JSON.stringify(docMap) );
       });
    };

Publish this to npm. For this example, we'll assume it's published as "doc-map-json".

In a project that wants to use this generator, make sure it's listed
as a devDependency in _package.json_:

    {
      ...
      "devDependencies": {
        "documentjs" : ">0.0.0",
        "doc-map-json": ">0.0.0"
      }
    }

In _documentjs.json_, make sure to list that generator and any options it needs in
your [DocumentJS.siteConfig siteConfigs].

    {
      "sites": {
        "api": {
          "generators": ["html","doc-map-json"],
          "dest": "docs"
        }
      }
    }

