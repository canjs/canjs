/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#util/vdom/build_fragment/build_fragment*/
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