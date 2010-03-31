steal.then(function(){
	//adds open selector support to closest, but only on 1 element
	var oldClosest = jQuery.fn.closest;
	jQuery.fn.closest = function(selectors, context){
		var rooted = {}, res, result, thing, i, j, selector, rootedIsEmpty = true;
		
		$.each(selectors, function(i, selector){
		    if(selector.indexOf(">") == 0 ){
				if(selector.indexOf(" ") != -1){
					throw " closest does not work with > followed by spaces!"
				}
				rooted[( selectors[i] = selector.substr(1)  )] = selector;
				rootedIsEmpty = false;
			}
		})
		
		res = oldClosest.call(this, selectors, context);
		
		if(rootedIsEmpty) return res;
		i =0;
		while(i < res.length){
			result = res[i]
			if (rooted[result.selector]) {
				res[i].selector = rooted[res[i].selector];
				if(result.elem.parentNode !== context) { // no match
					res.splice(i,1);
					continue;
				}
			}
			i++;
		}
		return res;
	}
})