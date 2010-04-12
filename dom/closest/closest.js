steal.then(function(){
	//adds open selector support to closest, but only on 1 element
	var oldClosest = jQuery.fn.closest;
	jQuery.fn.closest = function(selectors, context){
		var rooted = {}, res, result, thing, i, j, selector, rootedIsEmpty = true, selector;
		if(typeof selectors == "string") selectors = [selectors];
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
			result = res[i], selector = result.selector;
			if (rooted[selector] !== undefined) {
				result.selector = rooted[selector];
				rooted[selector] = false;
				if(typeof result.selector !== "string"  || result.elem.parentNode !== context ){
					res.splice(i,1);
						continue;
				}
			}
			i++;
		}
		return res;
	}
})