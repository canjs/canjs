/*!
 * CanJS - 2.3.13
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 01 Feb 2016 23:57:40 GMT
 * Licensed MIT
 */

/*can@2.3.13#util/vdom/build_fragment/build_fragment*/
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