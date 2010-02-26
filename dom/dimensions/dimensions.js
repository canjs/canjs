steal.plugins('jquery').then(function($){
	var oldHeight = $.fn.outerHeight,
		oldWidth = $.fn.outerWidth;
	$.fn.outerHeight = function(v){
		if(typeof v == 'number'){
			//subtract border and padding
			var val = 0, el = this[0]
			$.each(['Top','Bottom'], function(){
				val -= parseFloat(jQuery.curCSS( el, "padding" + this, true)) || 0;
				val -= parseFloat(jQuery.curCSS( el, "border" + this + "Width", true)) || 0;
			})
			
			this.height(v+val)
		}else{
			return oldHeight.call(this, v)
		}
	}
	
	
	$.fn.outerWidth = function(v){
		if(typeof v == 'number'){
			//subtract border and padding
			var val = 0, el = this[0]
			$.each(['Left','Right'], function(){
				val -= parseFloat(jQuery.curCSS( el, "padding" + this, true)) || 0;
				val -= parseFloat(jQuery.curCSS( el, "border" + this + "Width", true)) || 0;
			})
			
			this.width(v+val)
		}else{
			return oldWidth.call(this, v)
		}
	}
})
