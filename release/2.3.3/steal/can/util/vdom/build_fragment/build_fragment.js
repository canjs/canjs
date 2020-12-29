/*!
 * CanJS - 2.3.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Mon, 30 Nov 2015 23:22:54 GMT
 * Licensed MIT
 */

/*can@2.3.3#util/vdom/build_fragment/build_fragment*/
steal('./make_parser', 'can/util', function (makeParser, can) {
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
});