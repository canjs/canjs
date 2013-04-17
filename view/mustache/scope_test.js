steal('./scope','funcunit/qunit',function(Scope){
	
	test("basics",function(){
		
		var items = { people: [{name: "Justin"},[{name: "Brian"}]], count: 1000 }; 
		
		var itemsScope = new Scope(items),
			arrayScope = new Scope(itemsScope.attr('people'), itemsScope),
			firstItem = new Scope( arrayScope.attr('0'), arrayScope );
		
		var nameInfo = firstItem.get('name');
		equal(nameInfo.name, "name");
		equal(nameInfo.scope, firstItem);
		equal(nameInfo.value,"Justin");
		equal(nameInfo.parent, items.people[0]);
		
		var countInfo = firstItem.get('count');
		equal( countInfo.name, "count" );
		equal( countInfo.scope, itemsScope );
		equal(countInfo.value,1000);
		equal(countInfo.parent, items);
		
	});
	
	test("adding items",function(){
		expect(1);
		
		var base = new Scope({}),
			cur = base.add();
		
		
		cur._data.bind("items",function(ev, newVal, oldVal){
			ok(newVal.length, "newVal is an array")
		})
		
		cur.attr("items",[1])
		
	})
	
	
	
})
