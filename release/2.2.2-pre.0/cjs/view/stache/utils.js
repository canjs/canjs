/*!
 * CanJS - 2.2.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 27 Mar 2015 15:59:45 GMT
 * Licensed MIT
 */

/*can@2.2.1#view/stache/utils*/
require('../../util/util.js');
module.exports = {
    isArrayLike: function (obj) {
        return obj && obj.splice && typeof obj.length === 'number';
    },
    isObserveLike: function (obj) {
        return obj instanceof can.Map || obj && !!obj._get;
    },
    emptyHandler: function () {
    },
    jsonParse: function (str) {
        if (str[0] === '\'') {
            return str.substr(1, str.length - 2);
        } else if (str === 'undefined') {
            return undefined;
        } else if (can.global.JSON) {
            return JSON.parse(str);
        } else {
            return eval('(' + str + ')');
        }
    },
    mixins: {
        last: function () {
            return this.stack[this.stack.length - 1];
        },
        add: function (chars) {
            this.last().add(chars);
        },
        subSectionDepth: function () {
            return this.stack.length - 1;
        }
    }
};
