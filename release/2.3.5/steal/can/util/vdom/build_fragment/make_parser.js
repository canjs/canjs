/*!
 * CanJS - 2.3.5
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 03 Dec 2015 23:34:11 GMT
 * Licensed MIT
 */

/*can@2.3.5#util/vdom/build_fragment/make_parser*/
steal('can/view/parser', 'can-simple-dom', function (canParser, simpleDOM) {
    return function (document) {
        return new simpleDOM.HTMLParser(function (string) {
            var tokens = [];
            var currentTag, currentAttr;
            canParser(string, {
                start: function (tagName, unary) {
                    currentTag = {
                        type: 'StartTag',
                        attributes: [],
                        tagName: tagName
                    };
                },
                end: function (tagName, unary) {
                    tokens.push(currentTag);
                    currentTag = undefined;
                },
                close: function (tagName) {
                    tokens.push({
                        type: 'EndTag',
                        tagName: tagName
                    });
                },
                attrStart: function (attrName) {
                    currentAttr = [
                        attrName,
                        ''
                    ];
                    currentTag.attributes.push(currentAttr);
                },
                attrEnd: function (attrName) {
                },
                attrValue: function (value) {
                    currentAttr[1] += value;
                },
                chars: function (value) {
                    tokens.push({
                        type: 'Chars',
                        chars: value
                    });
                },
                comment: function (value) {
                    tokens.push({
                        type: 'Comment',
                        chars: value
                    });
                },
                special: function (value) {
                },
                done: function () {
                }
            });
            return tokens;
        }, document, simpleDOM.voidMap);
    };
});