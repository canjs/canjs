steal("./make_parser", "can/util",function(makeParser, can){


	var oldBuildFrag = can.buildFragment;
	can.buildFragment = function(text, context){
		if(context && context.length) {
			context = context[0];
		}
		if( context && ((context.ownerDocument || context ) !== can.global.document)) {

			var parser = makeParser(context.ownerDocument || context);
			return parser.parse(text);

		} else {
			return oldBuildFrag.apply(this, arguments);
		}
	};

});
