Can = {};
steal('./jquery.js',function(){
	Can.trigger= function(parent, ev, args){
		$.event.trigger(ev, args, parent, true)
	}
	// creates a document fragement of the html provided
	
	Can.frag = function(html, nodes){
		// converting an array of elements into a fragmeent

		return html ? $.buildFragment([html], [nodes||document]).fragment :
			document.createDocumentFragment(document.createTextNode(""));
	}
	
})



