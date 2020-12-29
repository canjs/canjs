/*!
 * CanJS - 2.3.34
 * http://canjs.com/
 * Copyright (c) 2018 Bitovi
 * Fri, 20 Apr 2018 19:04:13 GMT
 * Licensed MIT
 */

/*can@2.3.34#view/callbacks/callbacks*/
var can = require('../../util/util.js');
require('../view.js');
var attr = can.view.attr = function (attributeName, attrHandler) {
    if (attrHandler) {
        if (typeof attributeName === 'string') {
            attributes[attributeName] = attrHandler;
        } else {
            regExpAttributes.push({
                match: attributeName,
                handler: attrHandler
            });
        }
    } else {
        var cb = attributes[attributeName];
        if (!cb) {
            for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                var attrMatcher = regExpAttributes[i];
                if (attrMatcher.match.test(attributeName)) {
                    cb = attrMatcher.handler;
                    break;
                }
            }
        }
        return cb;
    }
};
var attributes = {}, regExpAttributes = [], automaticCustomElementCharacters = /[-\:]/;
var tag = can.view.tag = function (tagName, tagHandler) {
    if (tagHandler) {
        if (can.global.html5) {
            can.global.html5.elements += ' ' + tagName;
            can.global.html5.shivDocument();
        }
        tags[tagName.toLowerCase()] = tagHandler;
    } else {
        var cb = tags[tagName.toLowerCase()];
        if (!cb && automaticCustomElementCharacters.test(tagName)) {
            cb = function () {
            };
        }
        return cb;
    }
};
var tags = {};
can.view.callbacks = {
    _tags: tags,
    _attributes: attributes,
    _regExpAttributes: regExpAttributes,
    tag: tag,
    attr: attr,
    tagHandler: function (el, tagName, tagData) {
        var helperTagCallback = tagData.options.get('tags.' + tagName, { proxyMethods: false }), tagCallback = helperTagCallback || tags[tagName];
        var scope = tagData.scope, res;
        if (tagCallback) {
            res = can.__notObserve(tagCallback)(el, tagData);
        } else {
            res = scope;
        }
        if (res && tagData.subtemplate) {
            if (scope !== res) {
                scope = scope.add(res);
            }
            var result = tagData.subtemplate(scope, tagData.options);
            var frag = typeof result === 'string' ? can.view.frag(result) : result;
            can.appendChild(el, frag);
        }
    }
};
module.exports = can.view.callbacks;