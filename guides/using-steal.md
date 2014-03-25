@page using-steal With StealJS
@parent Using 2
@ignore

StealJS is the dependency manager that comes with [JavaScriptMVC](http://javascriptmvc.com) and that is natively used by CanJS. To use CanJS with Steal you can either directly clone the [CanJS repository](https://github.com/bitovi/canjs) or use the `steal/` folder from the CanJS download or Bower package.

The easiest way to get started up is using Bower:

> bower install steal canjs jquery --save

Create the following `stealconfig.js` in you project root:

    steal.config({
        map: {
            "*": {
                "jquery/jquery.js" : "jquery",
                "can/util/util.js": "can/util/jquery/jquery.js"
            }
        },
        paths: {
            "can": "bower_components/can/steal",
            "jquery": "bower_components/jquery/jquery.js",
        },
        shim : {
            jquery: {
                exports: "jQuery"
            }
        },
        ext: {
            js: "js",
            css: "css",
            less: "steal/less/less.js",
            coffee: "steal/coffee/coffee.js",
            ejs: "can/view/ejs/ejs.js",
            mustache: "can/view/mustache/mustache.js"
        }
    });

Then include StealJS on your page and you are ready to load dependencies:

