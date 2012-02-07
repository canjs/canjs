Can = {};
if( window.STEALMOO) {
	steal('can/util/mootools')
} else if(window.STEALZEPTO){
	steal('can/util/zepto');
} else {
	steal('can/util/jquery')
}
steal(function(){
	
	// creates a document fragement of the html provided (this can probably be removed)
	Can.frag = function(html, node){
		// converting an array of elements into a fragmeent
		var frag
		if(html){
			frag = html.nodeType == 11 || html.appendTo ? html : Can.buildFragment([html], [node||document]).fragment
		} else {
			frag = document.createDocumentFragment();
			frag.appendChild(document.createTextNode(""))
		}
		return frag;
	}
	
})



