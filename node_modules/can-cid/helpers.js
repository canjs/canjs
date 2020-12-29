"use strict";
module.exports = {
    each: function(obj, cb, context) {
        for(var prop in obj) {
            cb.call(context, obj[prop], prop);
        }
        return obj;
    }
};
