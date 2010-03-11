steal.plugins('jquery','jquery/destroyed').then(function($){
	//return;
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
			$(this).trigger(si );
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
		};
	$.event.special.selectin = {
		add : function(handleObj){
			if(handleObj.selector){
				$(this).delegate(handleObj.selector,"focusbubble", focusin)
				$(this).delegate(handleObj.selector,"blurbubble", focusout)
			}else{
				$(this).bind("focusbubble", focusin).
						bind("blurbubble", focusout)
			}
		},
		remove : function(handleObj){
			if(handleObj.selector){
				$(this).undelegate(handleObj.selector,"focusbubble", focusin)
				$(this).undelegate(handleObj.selector,"blurbubble", focusout)
			}else{
				$(this).unbind("focusbubble", focusin).
						unbind("blurbubble", focusout)
			}
		}
	}

	document.addEventListener('focus', function(ev){
		jQuery.event.trigger( 'focusbubble', null, ev.target )
	},true);
	document.addEventListener('blur', function(ev){
		jQuery.event.trigger( 'blurbubble', null, ev.target )
	},true);
})
