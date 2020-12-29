"use strict";
var utils = {
    isContainer: function (current) {
        var type = typeof current;
        return current && (type === "object" || type === "function");
    },
    strReplacer: /\{([^\}]+)\}/g,

    parts: function(name) {
        if(Array.isArray(name)) {
            return name;
        } else {
            return typeof name !== 'undefined' ? (name + '').replace(/\[/g,'.')
            		.replace(/]/g,'').split('.') : [];
        }
    }
};

module.exports= utils;
