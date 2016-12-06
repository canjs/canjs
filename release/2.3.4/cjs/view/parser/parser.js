/*!
 * CanJS - 2.3.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 02 Dec 2015 22:49:52 GMT
 * Licensed MIT
 */

/*can@2.3.4#view/parser/parser*/
function each(items, callback) {
    for (var i = 0; i < items.length; i++) {
        callback(items[i], i);
    }
}
function makeMap(str) {
    var obj = {}, items = str.split(',');
    each(items, function (name) {
        obj[name] = true;
    });
    return obj;
}
function handleIntermediate(intermediate, handler) {
    for (var i = 0, len = intermediate.length; i < len; i++) {
        var item = intermediate[i];
        handler[item.tokenType].apply(handler, item.args);
    }
    return intermediate;
}
var alphaNumericHU = '-:A-Za-z0-9_', attributeNames = '[^=>\\s\\/]+', spaceEQspace = '\\s*=\\s*', singleCurly = '\\{[^\\}\\{]\\}', doubleCurly = '\\{\\{[^\\}]\\}\\}\\}?', attributeEqAndValue = '(?:' + spaceEQspace + '(?:' + '(?:' + doubleCurly + ')|(?:' + singleCurly + ')|(?:"[^"]*")|(?:\'[^\']*\')|[^>\\s]+))?', matchStash = '\\{\\{[^\\}]*\\}\\}\\}?', stash = '\\{\\{([^\\}]*)\\}\\}\\}?', startTag = new RegExp('^<([' + alphaNumericHU + ']+)' + '(' + '(?:\\s*' + '(?:(?:' + '(?:' + attributeNames + ')?' + attributeEqAndValue + ')|' + '(?:' + matchStash + ')+)' + ')*' + ')\\s*(\\/?)>'), endTag = new RegExp('^<\\/([' + alphaNumericHU + ']+)[^>]*>'), mustache = new RegExp(stash, 'g'), txtBreak = /<|\{\{/, space = /\s/;
var empty = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed');
var block = makeMap('a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video');
var inline = makeMap('abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var');
var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');
var special = makeMap('script');
var tokenTypes = 'start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done'.split(',');
var fn = function () {
};
var HTMLParser = function (html, handler, returnIntermediate) {
    if (typeof html === 'object') {
        return handleIntermediate(html, handler);
    }
    var intermediate = [];
    handler = handler || {};
    if (returnIntermediate) {
        each(tokenTypes, function (name) {
            var callback = handler[name] || fn;
            handler[name] = function () {
                if (callback.apply(this, arguments) !== false) {
                    intermediate.push({
                        tokenType: name,
                        args: [].slice.call(arguments, 0)
                    });
                }
            };
        });
    }
    function parseStartTag(tag, tagName, rest, unary) {
        tagName = tagName.toLowerCase();
        if (block[tagName]) {
            while (stack.last() && inline[stack.last()]) {
                parseEndTag('', stack.last());
            }
        }
        if (closeSelf[tagName] && stack.last() === tagName) {
            parseEndTag('', tagName);
        }
        unary = empty[tagName] || !!unary;
        handler.start(tagName, unary);
        if (!unary) {
            stack.push(tagName);
        }
        HTMLParser.parseAttrs(rest, handler);
        handler.end(tagName, unary);
    }
    function parseEndTag(tag, tagName) {
        var pos;
        if (!tagName) {
            pos = 0;
        } else {
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos] === tagName) {
                    break;
                }
            }
        }
        if (pos >= 0) {
            for (var i = stack.length - 1; i >= pos; i--) {
                if (handler.close) {
                    handler.close(stack[i]);
                }
            }
            stack.length = pos;
        }
    }
    function parseMustache(mustache, inside) {
        if (handler.special) {
            handler.special(inside);
        }
    }
    var callChars = function () {
        if (charsText) {
            if (handler.chars) {
                handler.chars(charsText);
            }
        }
        charsText = '';
    };
    var index, chars, match, stack = [], last = html, charsText = '';
    stack.last = function () {
        return this[this.length - 1];
    };
    while (html) {
        chars = true;
        if (!stack.last() || !special[stack.last()]) {
            if (html.indexOf('<!--') === 0) {
                index = html.indexOf('-->');
                if (index >= 0) {
                    callChars();
                    if (handler.comment) {
                        handler.comment(html.substring(4, index));
                    }
                    html = html.substring(index + 3);
                    chars = false;
                }
            } else if (html.indexOf('</') === 0) {
                match = html.match(endTag);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(endTag, parseEndTag);
                    chars = false;
                }
            } else if (html.indexOf('<') === 0) {
                match = html.match(startTag);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(startTag, parseStartTag);
                    chars = false;
                }
            } else if (html.indexOf('{{') === 0) {
                match = html.match(mustache);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(mustache, parseMustache);
                }
            }
            if (chars) {
                index = html.search(txtBreak);
                if (index === 0 && html === last) {
                    charsText += html.charAt(0);
                    html = html.substr(1);
                    index = html.search(txtBreak);
                }
                var text = index < 0 ? html : html.substring(0, index);
                html = index < 0 ? '' : html.substring(index);
                if (text) {
                    charsText += text;
                }
            }
        } else {
            html = html.replace(new RegExp('([\\s\\S]*?)</' + stack.last() + '[^>]*>'), function (all, text) {
                text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
                if (handler.chars) {
                    handler.chars(text);
                }
                return '';
            });
            parseEndTag('', stack.last());
        }
        if (html === last) {
            throw new Error('Parse Error: ' + html);
        }
        last = html;
    }
    callChars();
    parseEndTag();
    handler.done();
    return intermediate;
};
var callAttrStart = function (state, curIndex, handler, rest) {
    state.attrStart = rest.substring(typeof state.nameStart === 'number' ? state.nameStart : curIndex, curIndex);
    handler.attrStart(state.attrStart);
    state.inName = false;
};
var callAttrEnd = function (state, curIndex, handler, rest) {
    if (state.valueStart !== undefined && state.valueStart < curIndex) {
        handler.attrValue(rest.substring(state.valueStart, curIndex));
    } else if (!state.inValue) {
    }
    handler.attrEnd(state.attrStart);
    state.attrStart = undefined;
    state.valueStart = undefined;
    state.inValue = false;
    state.inName = false;
    state.lookingForEq = false;
    state.inQuote = false;
    state.lookingForName = true;
};
HTMLParser.parseAttrs = function (rest, handler) {
    if (!rest) {
        return;
    }
    var i = 0;
    var curIndex;
    var state = {
            inDoubleCurly: false,
            inName: false,
            nameStart: undefined,
            inValue: false,
            valueStart: undefined,
            inQuote: false,
            attrStart: undefined,
            lookingForName: true,
            lookingForValue: false,
            lookingForEq: false
        };
    while (i < rest.length) {
        curIndex = i;
        var cur = rest.charAt(i);
        var next = rest.charAt(i + 1);
        var nextNext = rest.charAt(i + 2);
        i++;
        if (cur === '{' && next === '{') {
            if (state.inValue && curIndex > state.valueStart) {
                handler.attrValue(rest.substring(state.valueStart, curIndex));
            } else if (state.inName && state.nameStart < curIndex) {
                callAttrStart(state, curIndex, handler, rest);
                callAttrEnd(state, curIndex, handler, rest);
            } else if (state.lookingForValue) {
                state.inValue = true;
            } else if (state.lookingForEq && state.attrStart) {
                callAttrEnd(state, curIndex, handler, rest);
            }
            state.inDoubleCurly = true;
            state.doubleCurlyStart = curIndex + 2;
            i++;
        } else if (state.inDoubleCurly) {
            if (cur === '}' && next === '}') {
                var isTriple = nextNext === '}' ? 1 : 0;
                handler.special(rest.substring(state.doubleCurlyStart, curIndex));
                state.inDoubleCurly = false;
                if (state.inValue) {
                    state.valueStart = curIndex + 2 + isTriple;
                }
                i += 1 + isTriple;
            }
        } else if (state.inValue) {
            if (state.inQuote) {
                if (cur === state.inQuote) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
            } else if (space.test(cur)) {
                callAttrEnd(state, curIndex, handler, rest);
            }
        } else if (cur === '=' && (state.lookingForEq || state.lookingForName || state.inName)) {
            if (!state.attrStart) {
                callAttrStart(state, curIndex, handler, rest);
            }
            state.lookingForValue = true;
            state.lookingForEq = false;
            state.lookingForName = false;
        } else if (state.inName) {
            if (space.test(cur)) {
                callAttrStart(state, curIndex, handler, rest);
                state.lookingForEq = true;
            }
        } else if (state.lookingForName) {
            if (!space.test(cur)) {
                if (state.attrStart) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
                state.nameStart = curIndex;
                state.inName = true;
            }
        } else if (state.lookingForValue) {
            if (!space.test(cur)) {
                state.lookingForValue = false;
                state.inValue = true;
                if (cur === '\'' || cur === '"') {
                    state.inQuote = cur;
                    state.valueStart = curIndex + 1;
                } else {
                    state.valueStart = curIndex;
                }
            }
        }
    }
    if (state.inName) {
        callAttrStart(state, curIndex + 1, handler, rest);
        callAttrEnd(state, curIndex + 1, handler, rest);
    } else if (state.lookingForEq) {
        callAttrEnd(state, curIndex + 1, handler, rest);
    } else if (state.inValue) {
        callAttrEnd(state, curIndex + 1, handler, rest);
    }
};
module.exports = HTMLParser;