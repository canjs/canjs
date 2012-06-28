steal("can/control", "can/util/function", function() {

	// Hang on to original action
	var originalAction = can.Control._action,
	    originalShifter = can.Control._shifter;

	// Redefine _isAction to handle new syntax
	can.extend( can.Control, {

		_action: function( methodName, options ) {

			var parts = methodName.split(":"),
			    name = parts.shift();

			return originalAction.apply( this, [ name, options ] );
		},

		_shifter: function( context, name ) {
			var fn = originalShifter.apply( this, arguments ),
			    parts = name.split(":"),
			    fnName, args, modifier;

			// If there's still a part left, this means we have a modifier
			if ( parts[1] ) {
				parts = parts.pop().match(/([\w]+)\((.+)\)/);

				fnName = parts[1];
				args = parts[2] ? parts[2].split(","): [];

				modifier = can.getObject( fnName, [ context.options, can, window ]);

				if ( modifier ) {
					args.unshift( fn );
					fn = modifier.apply( null, args );
				}
			}
			return fn;
		}
	});

});
