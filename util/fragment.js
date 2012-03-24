steal(function(){
	
	var table = document.createElement('table'),
    	tableRow = document.createElement('tr'),
		containers = {
		  'tr': document.createElement('tbody'),
		  'tbody': table, 'thead': table, 'tfoot': table,
		  'td': tableRow, 'th': tableRow,
		  '*': document.createElement('div')
		},
   		fragmentRE = /^\s*<(\w+)[^>]*>/,
   		fragment  = function(html, name) {
		    if (name === undefined) {
		    	name = fragmentRE.test(html) && RegExp.$1;
		    }
		    if (!(name in containers)) name = '*';
		    var container = containers[name];
		    container.innerHTML = '' + html;
		    return [].slice.call(container.childNodes);
		}
	
	can.buildFragment = function(htmls, nodes){
		var parts = fragment(htmls[0]),
			frag = document.createDocumentFragment();
		parts.forEach(function(part){
			frag.appendChild(part);
		})
		return {
			fragment: frag
		}
	};
	
})
