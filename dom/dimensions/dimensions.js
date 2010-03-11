steal.plugins('jquery').then(function($){
	var oldHeight = $.fn.outerHeight,
		oldWidth = $.fn.outerWidth;
	var weird = /button|select/i
	var getPaddingAndBorder ={}, 
	    checks  = {
			width: ["Left", "Right"],
			height: ['Top','Bottom']
		}
	
	$.each({width: "Width", height: "Height"},function(lower, Upper){
		
		//used to get the padding and border for an element in a given direction
		getPaddingAndBorder[lower] = function(el){
			var val =0;
			if(!weird.test(el.nodeName)){
				$.each(checks[lower], function(){
					val += parseFloat(jQuery.curCSS( el, "padding" + this, true)) || 0;
					val += parseFloat(jQuery.curCSS( el, "border" + this + "Width", true)) || 0;
				})
			}
			return val;
		}
		
		//getter / setter
		$.fn["outer"+Upper] =  function(v){
			if(typeof v == 'number'){
				this[lower](v-getPaddingAndBorder[lower](this[0]))
				return this;
			}else{
				return oldHeight.call(this, v)
			}
		}
		
		//provides animation
		$.fx.step["outer"+Upper] = function(fx){
			if ( fx.state == 0 ) {
				fx.start = $(fx.elem)[lower]();
				fx.end = fx.end - getPaddingAndBorder[lower](fx.elem);
			}
			fx.elem.style[lower] = (fx.pos * (fx.end - fx.start)+fx.start )+ "px"
		}
	})
	
})
