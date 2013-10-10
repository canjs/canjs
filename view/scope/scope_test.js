(function(){
	
	test("basics",function(){
		
		var items = { people: [{name: "Justin"},[{name: "Brian"}]], count: 1000 }; 
		
		var itemsScope = new can.view.Scope(items),
			arrayScope = new can.view.Scope(itemsScope.attr('people'), itemsScope),
			firstItem = new can.view.Scope( arrayScope.attr('0'), arrayScope );
		
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
		
		var base = new can.view.Scope({}),
			cur = base.add(new can.Map());
		
		
		cur._data.bind("items",function(ev, newVal, oldVal){
			ok(newVal.length, "newVal is an array")
		})
		
		cur.attr("items",[1])
		
	})
	
	test("current context",function(){
		var base = new can.view.Scope({}),
			cur = base.add("foo")
			
		equal( cur.get(".").value, "foo", ". returns value");
		
		equal( cur.attr("."), "foo", ". returns value");
		
		equal( cur.get("this").value, "foo", "this returns value");
		
		equal( cur.attr("this"), "foo", "this returns value");
	})
	
	/*test("highest scope observe is parent observe",function(){
		var parent = new can.Map({name: "Justin"})
		var child = new can.Map({vals: "something"})
		
		var base = new can.view.Scope(parent),
			cur = base.add(child);
			
		var data = cur.get("bar")
		
		equal(data.parent, parent, "gives highest parent observe")
		equal(data.value, undefined, "no value")
	})*/
	
	test("computes on scope",function(){
		var base = new can.view.Scope({}),
			cur = base.add(can.compute({name: {first: "justin"}}));
			
		var data = cur.get("name.first");
		equal(data.value, "justin", "computes on path will be evaluted")
	})
	
	test("functions on an observe get called with this correctly", function(){
		
		var Person = can.Map.extend({
			fullName: function(){
				equal( this.attr('first'), "Justin" )
			}
		})
		
		var me = new Person({name: "Justin"})
		var base = new can.view.Scope(me),
			cur = base.add({other: "foo"})
		
		var data = cur.get("fullName");
		
		equal(data.value, Person.prototype.fullName, "got the raw function");
		equal(data.parent, me, "parent provided")
		
	})
	
	test("can.view.Scope.prototype.compute", function(){
		
		var map = new can.Map()
		
		var base = new can.view.Scope( map )
		
		var age = base.compute("age")
		
		equal(age(), undefined, "age is not set")
		
		age.bind("change", function(ev, newVal, oldVal){
			equal(newVal, 31, "newVal is provided correctly");
			equal(oldVal, undefined,"oldVal is undefined")
		})
		
		age(31);
		
		equal( map.attr("age"), 31, "maps age is set correctly");
		
		
	});
	
	test("backtrack path (#163)", function(){
		var row = new can.Map({first: "Justin"}),
			col = {format: "str"},
			base = new can.view.Scope( row ),
			cur = base.add(col);
			
		equal(cur.attr("."), col, "got col");
		
		equal(cur.attr(".."), row, "got row");
		
		equal(cur.attr("../first"), "Justin", "got row");
		
	});
	
	test("use highest default observe in stack", function(){
		var bottom = new can.Map({
			name: "bottom"
		});
		var top = new can.Map({
			name: "top"
		});
		
		var base = new can.view.Scope( bottom ),
			cur = base.add(top);
			
		var fooInfo = cur.get("foo");
		ok(fooInfo.parent ===  top, "we pick the current if we have no leads");
		
	})
	
	test("use highest default observe in stack unless you've found your way in something that does exist", function(){
		var bottom = new can.Map({
			name: {first: "Justin"}
		});
		var middle = new can.Map({
			name: {first: "Brian"}
		});
		var top = new can.Map({
			title: "top"
		});
		
		var cur = new can.view.Scope( bottom ).add(middle).add(top);
			
		var lastNameInfo = cur.get("name.last");
		
		
		ok(lastNameInfo.parent ===  middle.attr('name'), "pick the default observe with the highest depth");
	})
	
	
})()
