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
			cur = base.add(new can.Observe());
		
		
		cur._data.bind("items",function(ev, newVal, oldVal){
			ok(newVal.length, "newVal is an array")
		})
		
		cur.attr("items",[1])
		
	})
	
	test("current context",function(){
		var base = new Scope({}),
			cur = base.add("foo")
			
		equal( cur.get(".").value, "foo", ". returns value");
		
		equal( cur.attr("."), "foo", ". returns value");
		
		equal( cur.get("this").value, "foo", "this returns value");
		
		equal( cur.attr("this"), "foo", "this returns value");
	})
	
	test("highest scope observe is parent observe",function(){
		var parent = new can.Observe({name: "Justin"})
		var child = new can.Observe({vals: "something"})
		
		var base = new Scope(parent),
			cur = base.add(child);
			
		var data = cur.get("bar")
		
		equal(data.parent, parent, "gives highest parent observe")
		equal(data.value, undefined, "no value")
	})
	
	test("computes on scope",function(){
		var base = new Scope({}),
			cur = base.add(can.compute({name: {first: "justin"}}));
			
		var data = cur.get("name.first");
		equal(data.value, "justin", "computes on path will be evaluted")
	})
	
	
})
