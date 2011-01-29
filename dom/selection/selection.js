steal.plugins('jquery').then(function($){

var getWindow = function( element ) {
	return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
},
getSelection = function(el){
	var start,
		end;
	// use selectionStart if we can
	if (el.selectionStart !== undefined) {
		// this is for opera, so we don't have to focus to type how we think we would
		if(document.activeElement 
		 	&& document.activeElement != el 
			&& el.selectionStart == el.selectionEnd 
			&& el.selectionStart == 0){
			return {start: el.value.length, end: el.value.length};
		}
		return  {start: el.selectionStart, end: el.selectionEnd}
	} else if (getWindow(el).getSelection){
		//go through ranges and see if this element is part of a range selected
		var selection = getWindow(el).getSelection(),
			count = selection.rangeCount,
			range;
		
		for(var i =0; i < count; i++){
			range = selection.getRangeAt(i);
			var started = $.contains(el, range.startContainer),
				ended = $.contains(el, range.endContainer);
			
			if(started || ended){
				var res = children([el], function(el, data){
					if(el === range.startContainer){
						start = data.len+range.startOffset
					}
					if(el === range.endContainer){
						end = data.len+range.endOffset
					}
				});
				return {start: start||0, end: end === undefined ? res.len : end}
			}
		}
		
	} else{

		try {
			//try 2 different methods that work differently (IE breaks depending on type)
			if (el.nodeName.toLowerCase() == 'input') {
				var real = getWindow(el).document.selection.createRange(), r = el.createTextRange();
				r.setEndPoint("EndToStart", real);
				
				var start = r.text.length
				return {
					start: start,
					end: start + real.text.length
				}
			}
			else {
				var real = getWindow(el).document.selection.createRange(), r = real.duplicate(), r2 = real.duplicate(), r3 = real.duplicate();
				r2.collapse();
				r3.collapse(false);
				r2.moveStart('character', -1)
				r3.moveStart('character', -1)
				//select all of our element
				r.moveToElementText(el)
				//now move our endpoint to the end of our real range
				r.setEndPoint('EndToEnd', real);
				var start = r.text.length - real.text.length, end = r.text.length;
				if (start != 0 && r2.text == "") {
					start += 2;
				}
				if (end != 0 && r3.text == "") {
					end += 2;
				}
				//if we aren't at the start, but previous is empty, we are at start of newline
				return {
					start: start,
					end: end
				}
			}
		}catch(e){
			return {start: el.value.length, end: el.value.length};
		}
	} 
},
select = function( el, start, end ) {
	var win = getWindow(el)
	if(el.setSelectionRange){
		if(end === undefined){
            el.focus();
            el.setSelectionRange(start, start);
		} else {
			el.selectionStart = start;
			el.selectionEnd = end;
		}
	} else if (el.createTextRange) {
		//el.focus();
		var r = el.createTextRange();
		r.moveStart('character', start);
		end = end || start;
		r.moveEnd('character', end - el.value.length);
		
		r.select();
	} else if(win.getSelection){
		var	doc = win.document,
			sel = win.getSelection(),
			range = doc.createRange(),
			ranges = [start,  end !== undefined ? end : start];
        
		// 
		getCharElement([el],ranges);
		range.setStart(ranges[0].el, ranges[0].count);
		range.setEnd(ranges[1].el, ranges[1].count);
        //sel.removeAllRanges();
        sel.addRange(range);
	}

},
replaceWithLess = function(start, len, range, el){
	if(typeof range[0] === 'number' && range[0] < len){
			range[0] = {
				el: el,
				count: range[0] - start
			};
	}
	if(typeof range[1] === 'number' && range[1] <= len){
			range[1] = {
				el: el,
				count: range[1] - start
			};;
	}
},
//given elements and a [start,stop] range
//returns the elements and positions of the element
getCharElement = function( elems , range ) {
	children(elems, function(elem, data){
		var len = data.len+elem.nodeValue.length;
		if(typeof range[0] === 'number' && range[0] < len){
				range[0] = {
					el: el,
					count: range[0] - data.len
				};
		}
		if(typeof range[1] === 'number' && range[1] <= len){
				range[1] = {
					el: el,
					count: range[1] - data.len
				};;
		}
	})
},
children = function(elems, func, data){
	var elem,
		data = data || {str : [], len: 0},
		type, 
		len;
	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];
		type = elem.nodeType
		if ( type === 3 || type === 4 ) {
			
			len = elem.nodeValue.length || 0
			func(elem, data);
			data.str.push(elem.nodeValue)
			data.len += len;
		// Traverse everything else, except comment nodes
		} else if ( type !== 8 ) {
			children( elem.childNodes, func, data );
		}
	}
	return data;
};

$.fn.selection = function(start, end){
	if(start !== undefined){
		return this.each(function(){
			select(this, start, end)
		})
	}else{
		return getSelection(this[0])
	}
}
// for testing
$.fn.selection.getCharElement = getCharElement;

});