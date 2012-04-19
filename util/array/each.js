steal(function(){
	can.each = function(elements, callback) {
		var i = 0, key;
		if (typeof  elements.length == 'number' && elements.pop) {
			elements.attr && elements.attr('length');
			for(var len = elements.length; i < len; i++) {
				if(callback(elements[i], i, elements) === false) return elements;
			}
		} else {
			for(key in elements) {
				if(callback(elements[key], key) === false) return elements;
			}
		}
		return elements;
	}
})
