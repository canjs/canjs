@page can.EJS.Helpers Helpers
@parent can.EJS

@body
By adding functions to can.EJS.Helpers.prototype, those functions will be available in the views.

The following helper converts a given string to upper case:

    can.EJS.Helpers.prototype.toUpper = function(params) {
        return params.toUpperCase();
    }

Use it like this in any EJS template:

    <%= toUpper('javascriptmvc') %>

To access the current DOM element return a function that takes the element as a parameter:

    can.EJS.Helpers.prototype.upperHtml = function(params) {
        return function(el) {
            $(el).html(params.toUpperCase());
        }
    }

In your EJS view you can then call the helper on an element tag:

    <div <%= upperHtml('javascriptmvc') %>></div>