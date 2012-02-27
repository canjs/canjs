steal('can/route','can/control', function(){
	/**
	 * 
	 *     ":type route" //
	 * 
	 * @param {Object} el
	 * @param {Object} event
	 * @param {Object} selector
	 * @param {Object} cb
	 */
	can.Control.processors.route = function(el, event, selector, funcName, controller){
		can.route(selector||"")
		var batchNum,
			check = function(ev, attr, how){
				if(can.route.attr('route') === (selector||"") && 
				   (ev.batchNum === undefined || ev.batchNum !== batchNum ) ){
					
					batchNum = ev.batchNum;
					
					var d = can.route.attr();
					delete d.route;
					
					controller[funcName](d)
				}
			}
		can.route.bind('change',check);
		return function(){
			can.route.unbind('change',check)
		}
	}
})
