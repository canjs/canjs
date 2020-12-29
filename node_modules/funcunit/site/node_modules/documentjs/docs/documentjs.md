@page DocumentJS DocumentJS
@group DocumentJS.guides 0 guides
@group DocumentJS.apis.config 2 Configuration APIS
@group DocumentJS.apis.document 3 Document APIS
@group DocumentJS.apis.command-line 4 Command Line APIS
@group DocumentJS.apis.internal 5 Internal APIS

DocumentJS creates beautiful, articulate, multi-versioned documentation. With DocumentJS, you can:

 - Write documentation inline or in markdown files. 
 - Specify your code's behavior precisely with JSDoc
   and [Google Closure Compiler](https://developers.google.com/closure/compiler/docs/js-for-compiler) 
   annotations.
 - Customize your site's theme and layout.
 - Generate multi-version documentation.

The remainder of this page walks you through a "Quick Start Guide" that
reads through all the `.js`, `.md` and `.markdown` files
in a folder and creates a sibling `docs` folder with the 
generated documentation. Read the other guides for more detailed instructions.

## Install

Install [Node.js](http://nodejs.org/) on your 
computer. Open a console to your project. Use [npm](https://www.npmjs.org/) to 
install DocumentJS:

    > cd path/to/myproject
    > npm install documentjs --save-dev

## Generate Documentation

Run `./node_modules/.bin/documentjs`:

    > ./node_modules/.bin/documentjs

This will find every file that ends with `.js`, `.md` and `.markdown` and
try to create documentation from it. 

## Configure

You probably don't want to document everything, and 
might want to configure the behavior of things like:

 - What files are documented
 - Where the output of the documentation is written
 - What shows up in the navigation sidebar
 - Custom templates, styles, and behavior

To customize DocumentJS's default behavior, create a `documentjs.json`
file in the top level of your project like:

    {
      "sites": {
        "docs": {
          "glob": "src/**/*.{js,md}",
          "out": "api"
        },
        "guides": {
          "glob": "guides/**/*.md",
          "templates": "./site/templates"
        }
      }
    }

This is the [DocumentJS.docConfig docConfig] object.  Each one of 
its [DocumentJS.siteConfig sites configuration objects]
configures the output of a site generated from some source.  In this case, all
JavaScript and Markdown files in `src` are used to generate an `api` site and
all Markdown files in `guides` are used to generate a `guides` 
site rendered with custom templates. Read through the [DocumentJS.docConfig] API to better 
understand all the potential options.

## Document

DocumentJS supports a large amount of [documentjs.tags tags] used to mark up the
comments in your code. The following demonstrates some common examples:

### Document modules that export multiple values

Document a module that exports a function an an object of constants like:

```
/**
 * @module {Module} utils/math
 * @parent utils
 *
 * The module's description is the first paragraph.
 *
 * The body of the module's documentation.
 */
import _ from 'lodash';

/**
 * @function
 * 
 * This function's description is the first
 * paragraph.
 *
 * This starts the body.  This text comes after the signature. 
 *
 * @param {Number} first This param's description.
 * @param {Number} second This param's description.
 * @return {Number} This return value's description.
 */
export function sum(first, second){ ... };

/**
 * @property {{}} 
 * 
 * This function's description is the first
 * paragraph.
 *
 * @option {Number} pi The description of pi.
 *
 * @option {Number} e The description of e.
 */
export var constants = {
  pi: 3.14159265359,
  e: 2.71828
};
```

This will create three pages: `utils/math.html` which will be the parent
of `utils/math.sum.html` and `utils/math.constants.html`.

### Document modules that export a single value

The following documents a module that exports a single function so the module
and the function are documented on the same page:

```
/**
 * @module {function} utils/add
 * @parent utils
 * 
 * The module's description is the first paragraph.
 * 
 * The body of the module's documentation.
 * 
 * @param {Number} first This param's description.
 * @param {Number} second This param's description.
 * @return {Number} This return value's description.
 */
export default function(){ ... };
```

This exports a single `utils/add.html` page.

## Run Automatically

If you don't want to keep running `documentjs` everytime you make a change,
add `--watch` and DocumentJS will produce a new site whenever a file is changed:

    > ./node_modules/.bin/documentjs --watch

Read the [DocumentJS.apis.generate.documentjs command line] API for other options.
