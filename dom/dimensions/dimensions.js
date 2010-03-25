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
	},
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/;
	
	$.curStyles = function(el, styles){
		var currentS = getStyle(el), oldName, val, style = el.style;
		for(var name in styles){
			oldName = name;
			if(getComputedStyle){
				name = name.replace( rupper, "-$1" ).toLowerCase();
				styles[oldName] = currentS.getPropertyValue( name )
			}else{
				var camelCase = name.replace(rdashAlpha, fcamelCase);
				styles[oldName] = currentS[ name ] || currentS[ camelCase ];

				
				if ( !rnumpx.test( styles[oldName] ) && rnum.test( styles[oldName] ) ) { //convert to px
				// Remember the original values
					var left = style.left, rsLeft = el.runtimeStyle.left;
	
					// Put in the new values to get a computed value out
					el.runtimeStyle.left = el.currentStyle.left;
					style.left = camelCase === "fontSize" ? "1em" : (styles[oldName] || 0);
					styles[oldName] = style.pixelLeft + "px";
	
					// Revert the changed values
					style.left = left;
					el.runtimeStyle.left = rsLeft;
				}

			}
		}
		return styles;
	}
	
	$.each({width: "Width", height: "Height"},function(lower, Upper){
		
		//used to get the padding and border for an element in a given direction
		getPaddingAndBorder[lower] = function(el, margin){
			var val =0;
			if(!weird.test(el.nodeName)){
				//make what to check for ....
				var myChecks = {};
				$.each(checks[lower], function(){
					myChecks["padding" + this] = true;
					myChecks["border" + this + "Width"] = true;
					if(margin)
						myChecks["margin" + this] = true;
				})
				$.curStyles(el, myChecks)
				$.each(myChecks, function(name, value){
					val += (parseFloat(value) || 0);
				})
			}
			return val;
		}
		
		//getter / setter
		$.fn["outer"+Upper] =  function(v, margin){
			if(typeof v == 'number'){
				this[lower](v-getPaddingAndBorder[lower](this[0], margin))
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
