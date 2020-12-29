/*!
 * CanJS - 2.3.17
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 19 Feb 2016 22:54:51 GMT
 * Licensed MIT
 */

/*can@2.3.17#util/vdom/build_fragment/build_fragment*/
var makeParser = require('./make_parser.js');
var can = require('../../util.js');
var oldBuildFrag = can.buildFragment;
can.buildFragment = function (text, context) {
    if (context && context.length) {
        context = context[0];
    }
    if (context && (context.ownerDocument || context) !== can.global.document && !context._yuid) {
        var parser = makeParser(context.ownerDocument || context);
        return parser.parse(text);
    } else {
        return oldBuildFrag.apply(this, arguments);
    }
};