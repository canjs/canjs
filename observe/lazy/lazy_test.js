(function(){
	
module("can/observe/bind")

test("basics",function(){
	
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
	
	// creates an observe there ...
	var firstFact = person.attr("name.facts.0"),
		desctiptionCallbackedTimes = 0;
	
	
	// calls bindsetup which must go to that fact and tell it to
	// send messages to person
	person.bind("name.facts.0.description",function(ev, newVal, oldVal){
		desctiptionCallbackedTimes++;
		if( desctiptionCallbackedTimes== 1){
			equal(newVal, "Boo erns");
		} else {
			equal(newVal, "Boom");
		}
		
		
	})
	
	// sends those messages
	firstFact.attr('description',"Boo erns")
	
	// creates an observe at name ... 
	var name = person.attr("name")
	
	// must wire fact0 to go to name and name to person
	
	name.bind("change",function(ev, attr, how, newVal,oldVal){
		equal(attr, "facts.0.description")
	});
	
	firstFact.attr('description',"Boom")
})

test("LazyMap set",function(){
	
	
	var person = new can.LazyMap({});
	
	person.bind("change",function(ev, attr, how, newVal){
		ok(newVal instanceof can.LazyMap)
	})
	
	person.attr("name",{
		first: "Justin"
	})
	
})

test("LazyMap has internal array reordering",function(){

	var ll = new can.LazyMap({id: 1, items: [{id: "1.0"},{id: "1.1"}]});
	
	var onePointOne = ll.attr('items.1')
	
	
	var count = 0;
	
	ll.bind("change",function(ev, attr, how, newVal, oldVal){
		count++;
		console.log(count, attr, how, newVal, oldVal)
		if( count ==1 ){
			equal(attr,"items.1.name","gets the right attr")
		} else if(count == 2 ){
			equal(attr,"items.0","gets the right attr")
			equal(how,"remove","item was removed")
			ok(oldVal[0] instanceof can.LazyMap, "removed an instance of lazy map")
		} else if(count == 3){
			equal(attr,"items.0.name","gets the right attr")
		}
	});
	
	
	onePointOne.attr('name',"A");
	
	// this is evil / dangerous
	// the problem is that it messes up the indexes of 1.items.1. 
	// removeAttr can't do it's business
	ll.removeAttr('items.0');
	// when 0 is removed, it should re-adjust everything else ...
	// *1*.items.*0*.name
	// *1*.items.*1*.name
	
	onePointOne.attr('name',"B");
	
	// what if you change
})



test("Basic Map",9,function(){
	
	var state = new can.LazyMap({
		category : 5,
		productType : 4,
		properties : {
		  brand: [],
		  model : [],
		  price : []
		}
	});
	
	var added;
	
	state.bind("change", function(ev, attr, how, val, old){
		equals(attr, "properties.brand.0", "Adding to a list - correct change name")
		equals(how, "add", "Adding to a list - correct change type")
		equals(val[0].attr("foo"),"bar", "correct", "Adding to a list - correct newVal")
		
		added = val[0];
	});
	
	
	
	state.attr("properties.brand").push({foo: "bar"});
	
	state.unbind("change");
	
	added.bind("change", function(ev, attr, how, val, old){
		equals(attr, "foo","Middle bubble - foo property set on added")
		equals(how, "set","Middle bubble - added")
		equals(val, "zoo","Middle bubble - added")
	})
	state.bind("change", function(ev, attr, how, val, old){
		equals(attr, "properties.brand.0.foo")
		equals(how, "set")
		equals(val,"zoo")
	});
	added.attr("foo", "zoo");
	
});



	
	
})()
