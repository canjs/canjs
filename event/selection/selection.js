// a text selection event that is useful in mobile safari

steal.plugins('jquery/dom/range','jquery/controller','jquery/event/livehack').then(function($){


	var event = $.event;
	
	var supportTouch = "ontouchend" in document,
		scrollEvent = "touchmove scroll",
		touchStartEvent = supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = supportTouch ? "touchmove" : "mousemove",
		coords = function(event){
			var d = event.originalEvent.touches ?
				event.originalEvent.touches[ 0 ] :
				event;
			return {
					pageX: d.pageX, 
					pageY: d.pageY
			};
		};
	
	
	event.selection = {
		delay : 300,
		preventDefault : event.supportTouch
	};
	
	event.setupHelper( ["selectionStart","selectionEnd","selectionEnding","selectionMoving","selectionMove"], touchStartEvent, function(ev){
		//now start checking mousemoves to update location
		var delegate = ev.liveFired || ev.currentTarget,
			selector = ev.handleObj.selector,
			startXY = coords(ev),
			ready = false,
			el = this,
			startRange = $.Range(ev),
			getRange = function(rangeev){
				var range = $.Range(rangeev),
					pos = startRange.compare("START_TO_START", range),
					entire;
				if(pos == -1 || pos == 0){
					return startRange.clone().move("END_TO_END", range)
				} else {
					return range.clone().move("END_TO_END", startRange)
				}
			},
			cleanUp = function(){
				$(delegate).unbind(touchMoveEvent, mousemove)
				   .unbind(touchStopEvent,mouseup);
				 clearTimeout(moveTimer);
				 startRange = null;
			},
			mouseup =  function(moveev){
				
				if(!ready){
					cleanUp();
					return 
				}
				$.each(event.find(delegate, ["selectionMoving"], selector), function(){
					this.call(el, moveev, range)
				});
				var range = getRange(moveev);
				cleanUp();
				$.each(event.find(delegate, ["selectionEnd"], selector), function(){
					this.call(el, ev, range);
				});
				
			},
			mousemove = function(moveev){
				var moveXY = coords(moveev);
				// safari keeps triggering moves even if we haven't moved
				if(moveXY.pageX == startXY.pageX && moveXY.pageY == startXY.pageY){
					return;
				}
				
				if(!ready){
					return cleanUp();
				}
				$.each(event.find(delegate, ["selectionMoving"], selector), function(){
					this.call(el, moveev, range)
				});
				var range = getRange(moveev);
				$.each(event.find(delegate, ["selectionMove"], selector), function(){
					this.call(el, moveev, range)
				});
			},
			start = function(){
				ready = true;
				var startEv = event.selection.preventDefault ? $.Event('selectionStart') : ev;
				startEv.target = startEv.target || ev.target;
				$.each(event.find(delegate, ["selectionStart"], selector), function(){
					this.call(el, startEv, startRange)
				});
				
				if(event.selection.preventDefault && startEv.isDefaultPrevented()){
					ready = false;
					cleanUp();
				}
			},
			moveTimer;
			
		if(event.selection.preventDefault){
			ev.preventDefault();
			moveTimer = setTimeout(start, event.selection.delay);
		} else {
			start();
		}
		
		
		$(delegate).bind(touchMoveEvent, mousemove)
				   .bind(touchStopEvent, mouseup)
	});
});