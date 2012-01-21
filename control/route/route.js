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
	Can.Control.processors.route = function(el, event, selector, funcName, controller){
		Can.route(selector||"")
		var batchNum;
		var check = function(ev, attr, how){
			if(Can.route.attr('route') === (selector||"") && 
			 (ev.batchNum === undefined || ev.batchNum !== batchNum ) ){
				
				batchNum = ev.batchNum;
				
				var d = Can.route.attrs();
				delete d.route;
				
				controller[funcName](d)
			}
		}
		Can.route.bind('change',check);
		return function(){
			Can.route.unbind('change',check)
		}
	}
})
