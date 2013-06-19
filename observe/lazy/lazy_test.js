(function(){
	
	module("can/observe/lazy")

	test("Basics", 5, function() {
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
		ok(person.name.facts[0] instanceof can.LazyMap, "Nested attribute converted to LazyMap");

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


	test("Setting an attribute", 1, function(){
		var person = new can.LazyMap({});
		
		person.bind("change",function(ev, attr, how, newVal){
			ok(newVal instanceof can.LazyMap, "Setting (new) attribute converts it into LazyMap")
		})
		
		person.attr("name",{
			first: "Justin"
		})		
	})

	test("Internal array reordering", 7, function(){

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
				equal(newVal, "A", "Second element in list gets the right value")
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

	test("changing an object unbinds", 4, function(){
		var state = new can.LazyMap({
			category : 5,
			productType : 4,
			properties : {
				brand: [],
				model : [],
				price : []
			}
		}),
			count = 0;

		// converts to LazyList
		var brand = state.attr("properties.brand");

		state.bind("change", function(ev, attr, how, val, old){
			equals(attr, "properties.brand", "Right attribute changed.");
			equals(count, 0, "Called only once");
			count++;
			equals(how, "set", "Right method used.")
			equals(val[0], "hi", "Right value set.")
		});
		 
		// replace previous LazyList with a new one
		state.attr("properties.brand", ["hi"]);

		// this shouldn't trigger 'change' any more
		brand.push(1,2,3);
	});
	 
	/* LazyList specific tests */

	test("LazyList - adding attribute changes length", 1, function(){
		var l = new can.LazyList([0,1,2])
		l.attr(3,3)
		equals(l.length, 4, "Got the right lenght after adding an attribute.");
	})

	test("LazyList - splice", 7, function(){
		var l = new can.LazyList([0,1,2,3]),
			first = true;
		
		l.bind('change', function( ev, attr, how, newVals, oldVals ) {
			equals (attr, "1", "Right index to splice.")
			if(first){
				equals( how, "remove", "Removing existing items ..." )
				equals( newVals, undefined, " ... without new values." )
			} else {
				equals( how, "add", "Adding new items ..." )
				same( newVals, ["a","b"] , "... with right new values.")
			}			
			first = false;
		})
		
		l.splice(1,2, "a", "b"); 
		same(l.serialize(), [0,"a","b", 3], "Serialized!")
	});

	test("LazyList - pop", 5, function(){
		var l = new can.LazyList([0,1,2,3]);
		
		l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
			equals (attr, "3", "Right index to pop.")
			
			equals( how, "remove", "Removing the item" )
			equals( newVals, undefined, "Without new value" )
			same( oldVals, [3], "Old value equals to last element in list." )
		})
		
		l.pop(); 
		same(l.serialize(), [0,1,2], "Serialized!")
	})
	
})()
