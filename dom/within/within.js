/**
 *  @add jQuery.fn
 */
steal.plugins('jquery/dom').then(function($){
   var withinBox = function(x, y, left, top, width, height ){
        return (y >= top &&
                y <  top + height &&
                x >= left &&
                x <  left + width);
    } 
/**
 * @function within
 * @parent dom
 * Returns if the elements are within the position
 * @param {Object} x
 * @param {Object} y
 * @param {Object} cache
 */
$.fn.within= function(x, y, cache) {
    var ret = []
    this.each(function(){
        var q = jQuery(this);

        if(this == document.documentElement) return ret.push(this);

        var offset = cache ? jQuery.data(this,"offset", q.offset()) : q.offset();

        var res =  withinBox(x, y, 
                                      offset.left, offset.top,
                                      this.offsetWidth, this.offsetHeight );

        if(res) ret.push(this);
    });
    
    return this.pushStack( jQuery.unique( ret ), "within", x+","+y );
}


/**
 * @function withinBox
 * returns if elements are within the box
 * @param {Object} left
 * @param {Object} top
 * @param {Object} width
 * @param {Object} height
 * @param {Object} cache
 */
$.fn.withinBox = function(left, top, width, height, cache){
  	var ret = []
    this.each(function(){
        var q = jQuery(this);

        if(this == document.documentElement) return  this.ret.push(this);

        var offset = cache ? jQuery.data(this,"offset", q.offset()) : q.offset();

        var ew = q.width(), eh = q.height();

		res =  !( (offset.top > top+height) || (offset.top +eh < top) || (offset.left > left+width ) || (offset.left+ew < left));

        if(res)
            ret.push(this);
    });
    return this.pushStack( jQuery.unique( ret ), "withinBox", jQuery.makeArray(arguments).join(",") );
}
    
})