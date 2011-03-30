steal.plugins('jquery','jquery/dom/compare').then(function($){
// TODOS ...
// Ad

var convertType = function(type){
	return  type.replace(/([a-z])([a-z]+)/gi, function(all,first,  next){
			  return first+next.toLowerCase()	
			}).replace(/_/g,"");
},
reverse = function(type){
	return type.replace(/^([a-z]+)_TO_([a-z]+)/i, function(all, first, last){
		return last+"_TO_"+first;
	});
},
getWindow = function( element ) {
	return element ? element.ownerDocument.defaultView || element.ownerDocument.parentWindow : window
};


/**
 * @Class jQuery.Range
 * @parent dom
 * A range helper for jQuery
 * @param {Object} range
 */
$.Range = function(range){
	if(this.constructor !== $.Range){
		return new $.Range(range);
	}
	// create one
	if(!range || range.nodeType){
		this.win = getWindow(range)
		if(this.win.document.createRange){
			this.range = this.win.document.createRange()
		}else{
			this.range = this.win.document.body.createTextRange()
		}
	}else{
		this.range = range;
	}
};
$.Range.current = function(el){
	var win = getWindow(el)
	if(win.getSelection){
		return new $.Range( win.getSelection().getRangeAt(0) )
	}else{
		return  new $.Range( win.document.selection.createRange() );
	}
};
$.extend($.Range.prototype,{
	window : function(){
		return this.win || window;
	},
	/**
	 * Return true if any portion of these two ranges overlap.
	 * @param {Object} elRange
	 */
	overlaps : function(elRange){
		if(elRange.nodeType){
			elRange = $.Range(elRange).select(elRange);
		}
		//if the start is within the element ...
		var startToStart = this.compare("START_TO_START", elRange),
			endToEnd = this.compare("END_TO_END", elRange)
		
		// if we wrap elRange
		if(startToStart <=0 && endToEnd >=0){
			return true;
		}
		// if our start is inside of it
		if( startToStart >= 0 &&
			this.compare("START_TO_END", elRange) <= 0 )	{
			return true;
		}
		// if our end is inside of elRange
		if(this.compare("END_TO_START", elRange) >= 0 &&
			endToEnd <= 0 )	{
			return true;
		}
		return false;
	},
	collapse : function(toStart){
		this.range.collapse(toStart);
		return this;
	},
	toString : function(){
		return typeof this.range.text == "string"  ? this.range.text : this.range.toString();
	},
	start : function(){
		if(this.range.startContainer){
			return {
				container : this.range.startContainer,
				offset : this.range.startOffset
			}
		}else{
			var start = this.clone().collapse().parent();
			var startRange = $.Range(start).select(start).collapse();
			startRange.move("END_TO_START", this);
			return {
				container : start,
				offset : startRange.toString().length
			}
		}
	},
	end : function(){
		if(this.range.startContainer){
			return {
				container : this.range.endContainer,
				offset : this.range.endOffset
			}
		}else{
			var end = this.clone().collapse(false).parent();
			var endRange = $.Range(end).select(end).collapse();
			endRange.move("END_TO_END", this);
			return {
				container : end,
				offset : endRange.toString().length
			}
		}
	},
	parent : function(){
		return this.range.parentElement || this.range.commonAncestorContainer
	}
	
});
(function(){
	//method branching ....
	var fn = $.Range.prototype,
		range = $.Range().range;
	
	/**
	 * @function compare
	 * Compares one range to another range.  This is different from the spec b/c the spec is confusing.
	 * 
	 * source.compare("START_TO_END", toRange);
	 * 
	 * This returns -1 if source's start is before toRange's end.
	 * @param {Object} type
	 * @param {Object} range
	 */
	fn.compare = range.compareBoundaryPoints ? 
		function(type, range){
			return this.range.compareBoundaryPoints(this.window().Range[reverse( type )], range.range)
		}: 
		function(type, range){
			return this.range.compareEndPoints(convertType(type), range.range)
		}
	
	/**
	 * @function move
	 * Move the endpoints of a range
	 * @param {Object} type
	 * @param {Object} range
	 */
	fn.move = range.setStart ? 
		function(type, range){
	
			var rangesRange = range.range;
			switch(type){
				case "START_TO_END" : 
					this.range.setStart(rangesRange.endContainer, rangesRange.endOffset)
					break;
				case "START_TO_START" : 
					this.range.setStart(rangesRange.startContainer, rangesRange.startOffset)
					break;
				case "END_TO_END" : 
					this.range.setEnd(rangesRange.endContainer, rangesRange.endOffset)
					break;
				case "END_TO_START" : 
					this.range.setEnd(rangesRange.startContainer, rangesRange.startOffset)
					break;
			}
			
			return this;
		}:
		function(type, range){			
			this.range.setEndPoint(convertType(type), range.range)
			return this;
		};
	var cloneFunc = range.cloneRange ? "cloneRange" : "duplicate",
		selectFunc = range.selectNodeContents ? "selectNodeContents" : "moveToElementText";
	
	/**
	 * Clones the range and returns a new $.Range object.
	 */
	fn.clone = function(){
		return $.Range( this.range[cloneFunc]() );
	};
	
	/**
	 * Selects an element with this range
	 * @param {HTMLElement} el
	 */
	fn.select = function(el){
		this.range[selectFunc](el);
		return this;
	};
	
})();





});