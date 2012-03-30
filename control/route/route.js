steal('can/route','can/control', function(){
	
	// ## control/route.js  
	// _Controller route integration._
	
	can.Control.processors.route = function( el, event, selector, funcName, controller ) {
		can.route( selector || "" )
		var batchNum,
			check = function( ev, attr, how ) {
				if ( can.route.attr('route') === ( selector || "" ) && 
				   ( ev.batchNum === undefined || ev.batchNum !== batchNum ) ) {
					
					batchNum = ev.batchNum;
					
					var d = can.route.attr();
					delete d.route;
					
					controller[funcName]( d )
				}
			}
		can.route.bind( 'change', check );
		return function() {
			can.route.unbind( 'change', check )
		}
	}
})
