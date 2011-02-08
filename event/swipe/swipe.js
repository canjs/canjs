steal.plugins('jquery/event/livehack').then(function($){
var supportTouch = "ontouchend" in document,
	scrollEvent = "touchmove scroll",
	touchStartEvent = supportTouch ? "touchstart" : "mousedown",
	touchStopEvent = supportTouch ? "touchend" : "mouseup",
	touchMoveEvent = supportTouch ? "touchmove" : "mousemove",
	data = function(event){
		var d = event.originalEvent.touches ?
			event.originalEvent.touches[ 0 ] :
			event;
		return {
			time: (new Date).getTime(),
			coords: [ d.pageX, d.pageY ],
			origin: $( event.target )
		};
	};




/**
 * @add jQuery.event.special
 */
$.event.setupHelper( ["swipe",'swipeleft','swiperight'], touchStartEvent, function(ev){
	//listen to mouseup
	var start = data(ev),
		stop,
		delegate = ev.liveFired || ev.currentTarget,
		selector = ev.handleObj.selector,
		entered = this;
	
	function moveHandler(event){
		if ( !start ) {
			return;
		}
		stop = data(event);

		// prevent scrolling
		if ( Math.abs( start.coords[0] - stop.coords[0] ) > 10 ) {
			event.preventDefault();
		}
	};
	$(document.documentElement).bind(touchMoveEvent,moveHandler )
		.one(touchStopEvent, function(event){
			$(this).unbind( touchMoveEvent, moveHandler );
			if ( start && stop ) {
				if ( stop.time - start.time < 1000 && 
						Math.abs( start.coords[0] - stop.coords[0]) > 30 &&
						Math.abs( start.coords[1] - stop.coords[1]) < 75 ) {
					
					var direction = start.coords[0] > stop.coords[0] ? "swipeleft" : "swiperight";
					//trigger swipe events on this guy
					$.each($.event.find(delegate, ["swipe",direction], selector), function(){
						this.call(entered, ev, {start : start, end: stop})
					})
				
				}
			}
			start = stop = undefined;
		})
});

});