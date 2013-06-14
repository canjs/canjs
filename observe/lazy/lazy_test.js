(function(){
	
	module("can/observe/lazy")

	test("Basics", 4, function() {
		var person = new can.LazyMap({
			name: {
				first: "Justin",
				last: "Meyer",
				facts: [
					{id: 1, description: "Middle names get passed down"},
					{id: 2, description: "JBM"}
				]
			},
			age: 30
		});

		// convert nested object to LazyMap
		var firstFact = person.attr("name.facts.0");

		// check lazy conversion on .attr()
		//ok(person.name.facts[0] instanceof can.LazyMap, "Nested attribute converted to LazyMap");
		//TODO ^^^^^^^^^^^ make props accessable as on plain object

		// listen changes on parent, checks bubbling
		person.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "name.facts.0.description", "Parent triggers on nested LazyMap update - correct attr");
			equal(newVal, "Boom", "Parent triggers on nested LazyMap update - correct new value");
		});

		// listen changes on nested element
		firstFact.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "description", "Nested LazyMap triggers on change - correct attr");
			equal(newVal, "Boom", "Nested LazyMap triggers on change - correct new value");
		});
		
		// update nested LazyMap
		firstFact.attr("description", "Boom");
	});
	
	test("Check 'rewiring' after converting in-the-middle object", 4, function() {
		var person = new can.LazyMap({
			name: {
				first: "Justin",
				last: "Meyer",
				facts: [
					{id: 1, description: "Middle names get passed down"},
					{id: 2, description: "JBM"}
				]
			},
			age: 30
		});

		// convert an nested object to LazyMap
		var firstFact = person.attr("name.facts.0"),

			// convert in-the-middle object to LazyMap, 'rewiring' occures
			name = person.attr("name"),
			count1 = 0, count2 = 0;

		// listen changes on in-the-middle LazyMap
		name.bind("change",function(ev, attr, how, newVal, oldVal){
			equal(attr, "facts.0.description", "In-the-middle LazyMap trigger on child update - correct attr")
			equal(newVal, "Boom", "In-the-middle LazyMap trigger on child update - correct value")
		});

		// listen changes on parent, checks bubbling
		person.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "name.facts.0.description", "Parent triggers on nested LazyMap update - correct attr");
			equal(newVal, "Boom", "Parent triggers on nested LazyMap update - correct new value");
		});

		// trigger by changing attribute in nested LazyMap
		firstFact.attr("description", "Boom")
	});


	test("LazyMap set", 1, function(){
		var person = new can.LazyMap({});
		
		person.bind("change",function(ev, attr, how, newVal){
			ok(newVal instanceof can.LazyMap, "Setting (new) attribute converts it into LazyMap")
		})
		
		person.attr("name",{
			first: "Justin"
		})		
	})

	test("Internal array reordering", 6, function(){

		var ll = new can.LazyMap({
			id: 1,
			items: [
				{id: "1.0"},
				{id: "1.1"}
			]
		}),	
			onePointOne = ll.attr('items.1'),
			count = 0;

		ll.bind("change",function(ev, attr, how, newVal, oldVal){
			count++;
			if( count == 1 ){
				equal(attr, "items.1.name", "Second element in list gets the attribute")
			} else if( count == 2 ){
				equal(attr, "items.0", "First element is removed from array - correct attr")
				equal(how, "remove", "First element is removed from array - correct how")
				ok(oldVal[0] instanceof can.LazyMap, "Removed element is an instance of LazyMap")
			} else if( count == 3 ){
				equal(attr, "items.0.name", "After reordering right element gets updated - correct attr")
				equal(newVal, "B", "After reordering right element gets updated - correct newVal")
			}
		});

		// trigger change on 1.1, it's second element in the array
		onePointOne.attr("name", "A");
		
		// this is evil / dangerous
		// the problem is that it messes up the indexes of 1.items.1. 
		// removeAttr can't do it's business
		ll.removeAttr('items.0');
		// when 0 is removed, it should re-adjust everything else ...
		// *1*.items.*0*.name
		// *1*.items.*1*.name

		// trigger change on 1.1 again, but now it's first element in the array
		onePointOne.attr("name", "B");
	})
	
})()
