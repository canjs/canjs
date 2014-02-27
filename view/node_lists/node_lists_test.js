steal('can/view/node_lists', 'can/view/elements.js', function (nodeLists, elements) {
	var toFrag = function (elements) {
		var frag = document.createDocumentFragment();
		can.each(elements, function (element) {
			frag.appendChild(element);
		});
		return frag;
	};
	module('can/view/live/node_lists');
	test('unregisters child nodeLists', function () {
		expect(3)
		// two spans that might have been created by #each
		var spansFrag = can.buildFragment("<span>1</span><span>2</span>");
		var spansList = can.makeArray(spansFrag.childNodes),
			spansEls = spansList.slice(0);
		nodeLists.register(spansList, function(){
			ok(true,"unregistered spansList");
		});
		
		/*nodeLists.register(spansList, function(){
			console.log("spans unregistered")
		});*/
		
		// A label that might have been created by #foo
		var labelFrag = can.buildFragment("<label>l</label>");
		var labelList = can.makeArray(labelFrag.childNodes),
			labelEls = labelList.slice(0);
			
		nodeLists.register( labelList, function(){
			ok(true,"unregistered labelList");
		})
		
		// the html inside #if}
		var ifPreHookupFrag = elements.toFragment(["~","","-",""]),
			ifChildNodes = ifPreHookupFrag.childNodes,
			ifEls = can.makeArray(ifChildNodes);
		
		// 
		elements.replace([ifChildNodes[1]], spansFrag);
		
		// 4 because 2 elements are inserted
		elements.replace([ifChildNodes[4]], labelFrag);
		
		var ifList = can.makeArray(ifPreHookupFrag.childNodes);
		
		nodeLists.register(ifList, function(){
			ok(true,"unregistered ifList");
		});
		
		deepEqual(ifList,[
			ifEls[0],
			spansList,
			ifEls[2],
			labelList
		]);
		
		
		var oldNodes = nodeLists.update(ifList, [document.createTextNode("empty")])
		
	});
});
