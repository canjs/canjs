steal.then(function(){
	// el.find('li').closest([">li a"], this.element)
	var oldClosest = jQuery.fn.closest;
	jQuery.fn.closest = function(selectors){
		var rooted = {}, res, me, thing, i, 
			self = this;;
		$.each(selectors, function(i, selector){
		    if(selector.indexOf(">") == 0 ){
				if(selector.indexOf(" ") != -1) throw "no!"
				rooted[selector.substr(1)] = selector;
				selectors[i] = selector.substr(1);
			}
		})
	
		res = oldClosest.apply(this, arguments);
		for (i = 0; i < res.length; i++) {
			me = res[i]
			if (rooted[me.selector]) {
				if(me.elem.parentNode !== self[0].parentNode) { // no match
					res.splice(i, 1)
				} else {
					res[i].selector = rooted[me.selector];
				}
			}
		}
		return res;
	}
})