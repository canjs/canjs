steal.then(function(){
	// el.find('li').closest([">li a"], this.element)
	var oldClosest = jQuery.fn.closest;
	jQuery.fn.closest = function(selectors){
		var rooted = {}, res, me, thing, i, j, selector, self = this, rootedIsEmpty = true, cleanArray = function(arr){
			return jQuery.grep(arr, function(n, i){
				return (n);
			});
		}
		$.each(selectors, function(i, selector){
		    if(selector.indexOf(">") == 0 ){
				if(selector.indexOf(" ") != -1) throw "no!"
				rooted[selector.substr(1)] = selector;
				selectors[i] = selector.substr(1);
				rootedIsEmpty = false;
			}
		})
		
		res = oldClosest.apply(this, arguments);
		
		if(rootedIsEmpty) return res;
		
		for (i = 0; i < res.length; i++) {
			me = res[i]
			if (rooted[me.selector]) {
				if(me.elem.parentNode !== self[0].parentNode) { // no match
					res[i] = null;
				} else {
					res[i].selector = rooted[me.selector];
				}
			}
		}
		
		res = cleanArray(res)
		
		return res;
	}
})