/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#view/stache/intermediate_and_imports*/
var mustacheCore = require('./mustache_core.js');
var parser = require('../parser/parser.js');
require('../import/import.js');
module.exports = function (source) {
    var template = mustacheCore.cleanLineEndings(source);
    var imports = [], ases = {}, inImport = false, inFrom = false, inAs = false, currentAs = '', currentFrom = '';
    var intermediate = parser(template, {
            start: function (tagName, unary) {
                if (tagName === 'can-import') {
                    inImport = true;
                } else if (inImport) {
                    inImport = false;
                }
            },
            attrStart: function (attrName) {
                if (attrName === 'from') {
                    inFrom = true;
                } else if (inImport && attrName === '[.]') {
                    inAs = true;
                    currentAs = 'viewModel';
                    return false;
                }
            },
            attrEnd: function (attrName) {
                if (attrName === 'from') {
                    inFrom = false;
                } else if (inImport && attrName === '[.]') {
                    inAs = false;
                    return false;
                }
            },
            attrValue: function (value) {
                if (inFrom && inImport) {
                    imports.push(value);
                    currentFrom = value;
                } else if (inAs && currentAs === 'viewModel') {
                    return false;
                }
            },
            end: function (tagName) {
                if (tagName === 'can-import') {
                    if (currentAs) {
                        ases[currentAs] = currentFrom;
                        currentAs = '';
                        inAs = false;
                    }
                }
            },
            close: function (tagName) {
                if (tagName === 'can-import') {
                    imports.pop();
                }
            }
        }, true);
    return {
        intermediate: intermediate,
        imports: imports,
        ases: ases
    };
};