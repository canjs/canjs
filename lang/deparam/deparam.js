steal.plugins('jquery').then(function($){
	
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g;
	
	$.deparam = function(search){
		
		if(! search || ! search.match(/([^?#]*)(#.*)?$/) ) {
			return {};
		} 
	   
	
		var data = {},
			pairs = search.split('&'),
			current;
			
		for(var i=0; i < pairs.length; i++){
			current = data;
			var pair = pairs[i].split('=');
			
			// if we find foo=1+1=2
			if(pair.length != 2) { 
				pair = [pair[0], pair.slice(1).join("=")]
			}
			
			var key = decodeURIComponent(pair[0]), 
				value = decodeURIComponent(pair[1]),
				parts = key.match(keyBreaker);
	
			for ( var j = 0; j < parts.length - 1; j++ ) {
				var part = parts[j];
				if (!current[part] ) {
					current[part] = digitTest.test(part) || parts[j+1] == "[]" ? [] : {}
				}
				current = current[part];
			}
			lastPart = parts[parts.length - 1];
			if(lastPart == "[]"){
				current.push(value)
			}else{
				current[lastPart] = value;
			}
		}
		return data;
	}
	
})
