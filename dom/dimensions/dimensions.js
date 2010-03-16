steal.plugins('jquery').then(function($){
	//var oldHeight = $.fn.outerHeight,
	//	oldWidth = $.fn.outerWidth;
	var weird = /button|select/i,
		getPaddingAndBorder ={}, 
	    checks  = {
			width: ["Left", "Right"],
			height: ['Top','Bottom'],
			oldHeight : $.fn.outerHeight,
			oldWidth : $.fn.outerWidth
		}
	var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	rupper = /([A-Z])/g,
	rdashAlpha = /-([a-z])/ig,
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},
	getStyle  = function(elem){
		if (getComputedStyle) {
			return getComputedStyle(elem, null);
		}
		else if (elem.currentStyle) {
			return elem.currentStyle
		}
	}
	$.curStyles = function(el, styles){
		var currentS = getStyle(el);
		for(var name in styles){
			if(getComputedStyle){
				name = name.replace( rupper, "-$1" ).toLowerCase();
				styles[name] = currentS.getPropertyValue( name )
			}else{
				var camelCase = name.replace(rdashAlpha, fcamelCase);
				styles[name] = currentS[ name ] || currentS[ camelCase ];

			}
		}
		return styles;
	}
	
	$.each({width: "Width", height: "Height"},function(lower, Upper){
		
		//used to get the padding and border for an element in a given direction
		getPaddingAndBorder[lower] = function(el){
			var val =0;
			if(!weird.test(el.nodeName)){
				//make what to check for ....
				var myChecks = {};
				$.each(checks[lower], function(){
					myChecks["padding" + this] = true;
					myChecks["border" + this + "Width"] = true;
				})
				$.curStyles(el, myChecks)
				$.each(myChecks, function(name, value){
					val += (parseFloat(value) || 0);
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
				return checks["old"+Upper].call(this, v)
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
