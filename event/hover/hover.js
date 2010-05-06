steal.plugins('jquery','jquery/event/livehack').then(function($){
	/**
	 * @constructor jQuery.Hover
	 * Provides delegatable hover events.
	 * @demo jquery/event/hover/hover.html
	 * @parent specialevents
	 * @init creates a new hover
	 */
	jQuery.Hover = function(){
		this._delay =  jQuery.Hover.delay;
		this._distance = jQuery.Hover.distance;
	};
	/**
	 * @Static
	 */
	$.extend(jQuery.Hover,{
		/**
		 * @attribute delay
		 * A hover is  activated if it moves less than distance in this time.
		 */
		delay: 100,
		/**
		 * @attribute distance
		 * A hover is activated if it moves less than this distance in delay time.
		 */
		distance: 10
	})
	
	/**
	 * @Prototype
	 */
	$.extend(jQuery.Hover.prototype,{
		/**
		 * sets the delay for this hoverevent
		 * @param {Object} delay
		 */
		delay: function(delay){
			this._delay = delay;
		},
		/**
		 * sets the distance for this hoverevent
		 * @param {Object} distance
		 */
		distance: function(distance){
			this._distance = distance;
		}
	})
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
				hover = new jQuery.Hover();

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
			$.each(event.find(delegate, ["hoverinit"], selector), function(){
				this.call(entered, ev, hover)
			})
			timer = setTimeout(function(){
				//check that we aren't moveing around
				if(dist < hover._distance && $(entered).queue().length == 0){
					$.each(event.find(delegate, ["hoverenter"], selector), function(){
						this.call(entered, lastEv, hover)
					})
					called = true;
					$(entered).unbind("mousemove.specialMouseEnter")
					
				}else{
					dist = 0;
					timer = setTimeout(arguments.callee, hover._delay)
				}
				
				
			}, hover._delay)
			
		};
		
		/**
		 * @add jQuery.event.special static
		 */
		event.setupHelper( [
		/**
		 * @attribute hoverinit
		 */
		"hoverinit", 
		/**
		 * @attribute hoverenter
		 */
		"hoverenter",
		/**
		 * @attribute hoverleave
		 */
		"hoverleave",
		/**
		 * @attribute hovermove
		 */
		"hovermove"], "mouseenter", onmouseenter )
		

	
})