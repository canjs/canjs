steal.apps('jquery').then(function($){
	$.event.special["resize"] = {
		add: function(handleObj){
			//jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) );
			
			var origHandler = handleObj.handler;
			handleObj.origHandler = origHandler;
			var resizeCount = 0, windowWidth, windowHeight;
			handleObj.handler = function(ev, data){
			    if(resizeCount == 0){
			        windowWidth = $(window).width();
				    windowHeight = $(window).height();
			    }								
			    if(this !== window || resizeCount === 0){
				     resizeCount++;
			         handleObj.origHandler.call(this, ev, data);
					 resizeCount--;
			    }
			    if(resizeCount ==  0){
			        if($(window).width() != windowWidth || $(window).height() != windowHeight) {
					    $(window).trigger("resize");
				    }
			    }					
			}
		},
		
		setup: function(){return true;}
	}
})

