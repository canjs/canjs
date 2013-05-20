steal('can/construct', 'can/observe', 'can/model', function(){

	// data storage construct class
	can.Construct('can.Model.Offline', {
		
		models: {},

		data: {},

		indexes: {}
		/**
		 *	Offline model constructior
		 */
		init: function(){
			console.log(arguments)
		},

		setup: function(){

		},

	});
});