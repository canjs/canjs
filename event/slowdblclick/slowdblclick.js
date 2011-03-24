steal.plugins('jquery/event').then(function($){
	
	// listens to a number of clicks, calls back on the last one
	
	var target = null, 
		//max amount of time ...
		max = 2000;
	jQuery.event.special.slowdblclick = {
	    setup: function(data, namespaces) {
	        var elem = this, $elem = jQuery(elem);
	        $elem.bind('click', jQuery.event.special.slowdblclick.handler);
			$elem.bind('dblclick', jQuery.event.special.slowdblclick.handler);
	    },
	
	    teardown: function(namespaces) {
	        var elem = this, $elem = jQuery(elem);
	        $elem.unbind('click', jQuery.event.special.slowdblclick.handler);
			$elem.unbind('dblclick', jQuery.event.special.slowdblclick.handler);
	    },
	
	    handler: function(event) {
			
			var elem = event.target, 
				orig = this,
				$elem = jQuery(elem), 
				clicks = $elem.data('_slowdblclick') || {count : 0},
				clearTimer,
				createTimer,
				clear = function(){
					$elem.removeData('_slowdblclick')
					clearTimeout(clicks.clearTimer);
					clearTimeout(clicks.createTimer)
				}
			
			clicks.count++;

			if(target && target !== event.target){
				
				$.removeData(target,"_slowdblclick");
				
			}
			
			target = event.target;
			if(clicks.count === 1){
				clicks.clearTimer = setTimeout(clear,max);
			}else if(event.type == 'dblclick'){
				clear()
				
			}else if(clicks.count === 2){ // there has been a second click
				//set a brief timeout to make sure a dblclick hasn't followed us ...
				clicks.createTimer = setTimeout(function(){
					clear();
					event.type = "slowdblclick";
		            // let jQuery handle the triggering of "tripleclick" event handlers
		            jQuery.event.handle.call(orig, event)
				},10)
			}
			
			$elem.data('_slowdblclick', clicks)
			
	    }
	};
})
