@page using-steal With StealJS
@parent Using 2

StealJS is the dependency manager that comes with [JavaScriptMVC](http://javascriptmvc.com) and that is natively used by CanJS.
Since JavaScriptMVC comes with CanJS and Steal, the easiest way to use them together is by [downloading JavaScriptMVC](http://javascriptmvc.com/dist/javascriptmvc-3.3.zip). You can also use the `steal/` folder from the CanJS download or Bower package.

With the JavaScriptMVC download, in the main folder, you can simply run the application generator:

> ./js jmvc/generate/app app

In `app/app.js` you should see something like:

    steal(
        './app.less',
        './models/fixtures/fixtures.js',
    function(){

    })

This file will be loaded when opening `app/index.html` and you are ready to use CanJS with StealJS and make [using-production production builds].
For more information follow up in the [JavaScriptMVC documentation](http://javascriptmvc.com/docs).
