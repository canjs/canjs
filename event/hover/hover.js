steal.plugins('jquery','jquery/event/livehack').then(function(){
	jQuery.hoverTimers = jQuery.hoverTimers || [];
	var $ = jQuery,
		event = jQuery.event, 
		handle  = event.handle,
		onmouseenter = function(ev){
			//now start checking mousemoves to update location
			var delegate = ev.liveFired || ev.currentTarget;
			var selector = ev.handleObj.selector;
			var loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				}, 
				dist = 0, 
				timer, 
				entered = this, 
				called = false,
				lastEv = ev, 
				delay = 100;
			var hovered = {
				setDelay: function(time){
					delay = time;
				}
			}
			$(entered).bind("mousemove.specialMouseEnter", {}, function(ev){
				dist += Math.pow( ev.pageX-loc.pageX, 2 ) + Math.pow( ev.pageY-loc.pageY, 2 ); 
				loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				}
				lastEv = ev
			}).bind("mouseleave.specialMouseLeave",{}, function(ev){
				clearTimeout(timer);
				if(called){
					$.each(event.find(delegate, ["hoverleave"], selector), function(){
						this.call(entered, ev)
					})
				}
				$(entered).unbind("mouseleave.specialMouseLeave")
			})
			timer = setTimeout(function(){
				//check that we aren't moveing around
				if(dist < 10 && $(entered).queue().length == 0){
					$.each(event.find(delegate, ["hoverenter"], selector), function(){
						this.call(entered, lastEv, hovered)
					})
					called = true;
					$(entered).unbind("mousemove.specialMouseEnter")
					
				}else{
					dist = 0;
					timer = setTimeout(arguments.callee, delay)
				}
				
				
			}, delay)
			$.each(event.find(delegate, ["hoverinit"], selector), function(){
				this.call(entered, ev, hovered)
			})
			while(jQuery.hoverTimers.length)
				clearTimeout(jQuery.hoverTimers.shift());
				
			jQuery.hoverTimers.push(timer)
		};
		
		/**
		 * @add jQuery.event.special static
		 */
		event.setupHelper( [
		/**
		 * @attribute hoverinit
		 */
		"hoverinit", "hoverenter","hoverleave","hovermove"], "mouseenter", onmouseenter )
		

	
})