steal("can/view/vdom", "steal-qunit", function(vdom){
	
	test("appendChild with a normal node", function(){
		var div = vdom.createElement("div");
		var span = vdom.createElement("span");
		var span2 = vdom.createElement("span2")
		
		equal(div.nodeName, "div");
		
		div.appendChild(span);
		
		equal(div.firstChild, span);
		equal(div.lastChild, span);
		equal(span.parentNode, div);
		
		div.appendChild(span2);
		
		equal(div.firstChild, span);
		equal(div.lastChild, span2);
		equal(span2.parentNode, div);
		equal(span2.previousSibling, span);
		equal(span.nextSibling, span2);
	});
	
	test("appendChild with a frag", function(){
		var div = vdom.createElement("div");
		var span = vdom.createElement("span");
		var span2 = vdom.createElement("span2");
		var frag = vdom.createDocumentFragment();
		
		frag.appendChild(span);
		frag.appendChild(span2);
		
		equal(span.parentNode, frag);
		equal(span2.parentNode, frag);
		equal(span2.previousSibling, span);
		equal(span.nextSibling, span2);
		
		div.appendChild(frag);
		
		equal(frag.firstChild, null);
		equal(frag.lastChild, null);
		
		equal(div.firstChild, span);
		equal(div.lastChild, span2);
		equal(span.parentNode, div);
		equal(span2.parentNode, div);
		equal(span2.previousSibling, span);
		equal(span.nextSibling, span2);
	});
	
	test("clone", function(){
		var div = vdom.createElement("div");
		var span = vdom.createElement("span");
		var span2 = vdom.createElement("span2");
		div.appendChild(span);
		div.appendChild(span2);
		
		var divB = div.cloneNode(true);
		ok(div !== divB, "not equal");
		
		var divBspan = divB.firstChild;
		var divBspan2 = divB.lastChild;
		
		equal(divB.firstChild, divBspan);
		equal(divB.lastChild, divBspan2);
		equal(divBspan.parentNode, divB);
		equal(divBspan2.parentNode, divB);
		equal(divBspan2.previousSibling, divBspan);
		equal(divBspan.nextSibling, divBspan2);
	});
	
});