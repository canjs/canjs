steal('jquery/dom/route','jquery/controller', function(){
	/**
	 * 
	 *     ":type route" //
	 * 
	 * @param {Object} el
	 * @param {Object} event
	 * @param {Object} selector
	 * @param {Object} cb
	 */
	jQuery.Controller.processors.route = function(el, event, selector, funcName, controller){
		$.route(selector||"")
		var check = function(){
			if($.route.attr('route') === (selector||"")){
				controller[funcName]($.route.attr())
			}
		}
		$.route.bind('route',check);
		return function(){
			$.route.unbind('route',check)
		}
	}
})
