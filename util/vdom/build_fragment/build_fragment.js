var can = require("can/util/util");
var makeParser = require("./make_parser");

var oldBuildFrag = can.buildFragment;
can.buildFragment = function(text, context){
	if(context && context.length) {
		context = context[0];
	}
	// Also checks if this is a YUI wrapped node
	if (context && ((context.ownerDocument || context) !== can.global.document) &&
			!context._yuid) {
		var parser = makeParser(context.ownerDocument || context);
		return parser.parse(text);

	} else {
		return oldBuildFrag.apply(this, arguments);
	}
};
