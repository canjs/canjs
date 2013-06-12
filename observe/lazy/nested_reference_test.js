(function(){
	
module("can/observe/lazy/nested_reference")

test("nested basics",function(){
	var data = [
			{id: 0, items: [{id: "0.0"},{id: "0.1"}]},
			{id: 1, items: [{id: "1.0"},{id: "1.1"}]}
		]
	
	
	var nested = new can.NestedReference(data);
	
	var ref1 = nested.make("1.items.1");
	
	
	data[1].items.shift()
	
	equal( ref1(), "1.items.0" ,"path updated correctly");
	
	
	nested.removeChildren("1.items",function(child){
		equal(child,data[1].items[0])
	})
	
	
	
})

test("nested each",function(){
	
	var data = [
			{id: 0, items: [{id: "0.0"},{id: "0.1"}]},
			{id: 1, items: [{id: "1.0"},{id: "1.1"}]}
		]
	
	
	var nested = new can.NestedReference(data);
	
	nested.make("0.items");
	
	nested.make("1.items.0");
	
	var callbackCount = 0;
	nested.each(function(child, ref, path){
		callbackCount++;
		if(callbackCount == 1){
			equal(child,data[0].items)
		} else {
			equal(child,data[1].items[0])
		}
		
		
	})
})


})();
