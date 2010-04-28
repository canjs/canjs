steal.plugins('jquery').then(function($){
	var resizeCount = 0, 
		win = $(window),
		windowWidth = win.width(), 
		windowHeight = win.height(), 
		timer;
	/**
	 * Noramalizes resize events across browsers.
	 * @param {Object} handleObj
	 */
	$.event.special["resize"] = {
		add: function(handleObj){
			//jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) );
			
			var origHandler = handleObj.handler;
			handleObj.origHandler = origHandler;
			
			handleObj.handler = function(ev, data){							
			    if((this !== window) || (resizeCount === 0 && !ev.originalEvent)){
				     resizeCount++;
			         handleObj.origHandler.call(this, ev, data);
					 resizeCount--;
			    }
			    var width = win.width();
				var height = win.height();
				if(resizeCount ===  0 && (width != windowWidth ||height != windowHeight)){
					windowWidth = width;
					windowHeight = height;
					clearTimeout(timer)
					timer = setTimeout(function(){
						win.triggerHandler("resize");
					},1)
			        
			    }					
			}
		},
		
		setup: function(){
			return this !== window;
		}
	}
})

