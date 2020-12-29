@page DocumentJS.guides.installing installing
@parent DocumentJS.guides 0

Learn how to install DocumentJS.

@body

There are two primary ways to install DocumentJS so it can be used for a project:

1. Install DocumentJS as a npm package dependency.
1. Install DocumentJS globally.


Installing globally allows you to use [DocumentJS.apis.generate.documentjs documentjs] command
from anywhere. However, it will not be installed 
automatically for `npm` projects. For this reason, we encourage people to install it as
an `npm` dependency.

## Prerequisites

Install [Node.js](http://nodejs.org/) on your computer.

## Installing as an npm package dependency

In your node project's parent folder, run:

    > npm install documentjs --save-dev

Node will copy documentjs's executable to `./node_modules/.bin/documentjs`. On linux/mac, you
can run the [DocumentJS.apis.generate.documentjs documentjs command] with:

    > ./node_modules/.bin/documentjs


## Installing globally

Run:

    > npm install documentjs



## Installing for Grunt

DocumentJS comes with a Grunt task. Simply import it in your `Gruntfile.js` and
configure the `documentjs` task with the [DocumentJS.docConfig]:

    // Gruntfile.js
    module.exports = function(grunt){
      grunt.loadNpmTasks('documentjs');
      grunt.initConfig({
        documentjs: {
          versions: { ... },
          sites: { ... }
        }
      });
    };


## Installing for Gulp

coming soon