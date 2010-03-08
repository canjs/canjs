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
				$(this).delegate(handleObj.selector,"xfocus", focusin)
				$(this).delegate(handleObj.selector,"xblur", focusout)
			}else{
				$(this).bind("xfocus", focusin).
						bind("xblur", focusout)
			}
		},
		remove : function(handleObj){
			if(handleObj.selector){
				$(this).undelegate(handleObj.selector,"xfocus", focusin)
				$(this).undelegate(handleObj.selector,"xblur", focusout)
			}else{
				$(this).unbind("xfocus", focusin).
						unbind("xblur", focusout)
			}
		}
	}
	document.addEventListener('focus', function(ev){
		$(ev.target).trigger("xfocus")
	},true);
	document.addEventListener('blur', function(ev){
		$(ev.target).trigger("xblur")
	},true);
})
