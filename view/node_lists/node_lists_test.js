steal("can/view/live/node_lists","can/view/elements.js",function(nodeLists, elements){
	
	var toFrag = function(elements){
		var frag = document.createDocumentFragment();
		can.each(elements, function(element){
			frag.appendChild(element)
		})
		return frag
	}

	module("can/view/live/node_lists");
	
	
	test("unregisters child nodeLists",function(){
		
		var div = document.createElement("div");
		
		div.innerHTML = "<span>will be replaced</span>";
		
		var everything = can.makeArray( div.childNodes );
		
		nodeLists.register(everything, function(){
			console.log("unregistered everything")
		})
		
		
		
		div.innerHTML = "<p>first</p>"+
					"<span>will be replaced</span>" +
					"<p>second</p>";
		
		
		
		
		nodeLists.update( everything, div.childNodes );
		
		
		
		var toBeLabels = can.makeArray( div.getElementsByTagName("span") )
		
		// finds where this is and set this parent/child relationship
		nodeLists.register(toBeLabels, function(){
			
			ok(true, "unregistered labels")
			
		});
		
		var labels = [
			document.createElement("label") , 
			document.createElement("label")
		];
		
		elements.replace(toBeLabels,toFrag( labels ));
		nodeLists.update(toBeLabels,labels);
		
		div.innerHTML = "<form></form>"
		
		nodeLists.update(everything, can.makeArray( div.childNodes ))
		
	})
	
})