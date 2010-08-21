steal.plugins('jquery/event').then(function($){
	var currentSelected = null, 
		currentTimer, 
		pieces,
		focusin = function(ev){
			clearTimeout(currentTimer);
			ev.stopPropagation(); //prevent others from handling focusin
			var so = $.Event('selectout');
			so.relatedTarget = this;

			$(currentSelected).trigger(so);
			
			var si = $.Event('selectin');
			si.relatedTarget = currentSelected;
			si.byFocus = true;
			$(ev.target).trigger(si );
			currentSelected = null;

		},
		focusout = function(ev){
			ev.stopPropagation();
			currentSelected = ev.currentTarget;
			clearTimeout(currentTimer);
			currentTimer = setTimeout(function(){
				$(currentSelected).trigger('selectout');
				currentSelected = null;
			}, 100)
		}, 
		focusBubble = 'focusin',
		blurBubble = 'focusout';
		
		
	if(document.addEventListener){
		document.addEventListener('focus', function(ev){
			jQuery.event.trigger( 'focusbubble', null, ev.target )
		},true);
		document.addEventListener('blur', function(ev){
			jQuery.event.trigger( 'blurbubble', null, ev.target )
		},true);
		focusBubble = 'focusbubble',
		blurBubble = 'blurbubble';
	}
		
	$.event.special.selectin = {
		add: function( handleObj ) {
			if(handleObj.selector){
				$(this).delegate(handleObj.selector,focusBubble, focusin)
				$(this).delegate(handleObj.selector,blurBubble, focusout)
			}else{
				$(this).bind(focusBubble, focusin).
						bind(blurBubble, focusout)
			}
		},
		remove: function( handleObj ) {
			if(handleObj.selector){
				$(this).undelegate(handleObj.selector,focusBubble, focusin)
				$(this).undelegate(handleObj.selector,blurBubble, focusout)
			}else{
				$(this).unbind(focusBubble, focusin).
						unbind(blurBubble, focusout)
			}
		}
	}
	
})
