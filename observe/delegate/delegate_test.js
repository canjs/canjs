steal('can/util', 'can/observe/delegate', function(can) {


module('can/observe/delegate')

var matches = can.Observe.prototype.delegate.matches;

test("matches", function(){
	equals( matches(['**'], ['foo','bar','0']) ,
		'foo.bar.0' , "everything" );
		
	equals( matches(['*.**'], ['foo']) ,
		null , "everything at least one level deep" )
	
	equals( matches(['foo','*'], ['foo','bar','0']) ,
		'foo.bar' )
	
	equals(matches(['*'], 
					['foo','bar','0']) ,
					'foo' );
					
	equals( matches([ '*', 'bar' ], 
					['foo','bar','0']) ,
					'foo.bar' )
	// - props - 
	// - returns - 'foo.bar'
})




test("delegate", 4,function(){
	
	var state = new can.Observe({
		properties : {
		  prices : []
		}
	});
	var prices = state.attr('properties.prices');
	
	state.delegate("properties.prices","change", function(ev, attr, how, val, old){
		equals(attr, "0", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		ok(this === prices, "rooted element")
	});
	
	prices.push({foo: "bar"});
	
	state.undelegate();
	
})
test("delegate on add", 2, function(){
	
	var state = new can.Observe({});
	
	state.delegate("foo","add", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	}).delegate("foo","remove", function(){
		ok(false,"remove should not be called")
	});
	
	state.attr("foo","bar")
	
})

test("delegate set is called on add", 2, function(){
	var state = new can.Observe({});
	
	state.delegate("foo","set", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	});
	state.attr("foo","bar")
});

test("delegate's this", 5, function(){
	var state = new can.Observe({
		person : {
			name : {
				first : "justin",
				last : "meyer"
			}
		},
		prop : "foo"
	});
	var n = state.attr('person.name'),
		check
	
	// listen to person name changes
	state.delegate("person.name","set", check = function(ev, newValue, oldVal, from){
		// make sure we are getting back the person.name
		equals(this, n)
		equals(newValue, "Brian");
		equals(oldVal, "justin");
		// and how to get there
		equals(from,"first")
	});
	n.attr('first',"Brian");
	state.undelegate("person.name",'set',check)
	// stop listening
	
	// now listen to changes in prop
	state.delegate("prop","set", function(){
		equals(this, 'food');
	}); // this is weird, probably need to support direct bind ...
	
	// update the prop
	state.attr('prop','food')
})

test("* selectors firing for all matching events", function(){
	var oldPeople = {
		people : [{
			first : "justin",
			last : "meyer"
		},{
			first : "ralph",
			last : "holzmann"
		}]
	}
	var newPeople = {
		people : [{
			first : "justin2",
			last : "meyer2"
		},{
			first : "ralph2",
			last : "holzmann2"
		}]
	}
	var state = new can.Observe(oldPeople),
		changes = 0

	state.delegate("people.*.first", "changes", function(ev, attr, how, newVal, oldVal){
		equals(this, state.attr('people.' + changes + '.first'), "this is set right")
		equals(how, 'set', "how was correct")
		equals(newVal, state.attr('people.' + changes + '.first'), "newVal was correct")
		equals(oldVal, oldPeople.people[changes].first, "oldVal was correct")
		equals(attr, 'people.' + changes + '.first', "attr was correct")
		changes++
	});

	state.attr(newPeople)

	equals(changes, 2, "notifications were fired correctly")

});

test("* selectors firing for single event", function(){
	var oldPeople = {
		people : [{
			first : "justin",
			last : "meyer"
		},{
			first : "ralph",
			last : "holzmann"
		}]
	}
	var newPeople = {
		people : [{
			first : "justin2",
			last : "meyer2"
		},{
			first : "ralph2",
			last : "holzmann2"
		}]
	}
	var state = new can.Observe(oldPeople),
		changes = 0

	state.delegate("people.*.first", "change", function(ev, attr, how, newVal, oldVal){
		equals(this, state.attr('people.' + changes + '.first'), "this is set right")
		equals(how, 'set', "how was correct")
		equals(newVal, state.attr('people.' + changes + '.first'), "newVal was correct")
		equals(oldVal, oldPeople.people[changes].first, "oldVal was correct")
		equals(attr, 'people.' + changes + '.first', "attr was correct")
		changes++
	});

	state.attr(newPeople)

	equals(changes, 1, "notification was fired correctly")

});

test("delegate on deep properties with *", function(){
	var state = new can.Observe({
		person : {
			name : {
				first : "justin",
				last : "meyer"
			}
		}
	});
	
	state.delegate("person","set", function(ev, newVal, oldVal, attr){
		equals(this, state.attr('person'), "this is set right")
		equals(attr, "name.first")
	});
	state.attr("person.name.first","brian")
});

test("compound sets", function(){
	
	var state = new can.Observe({
		type : "person",
		id: "5"
	});
	var count = 0;
	state.delegate("type=person id","set", function(){
		equals(state.type, "person","type is person")
		ok(state.id !== undefined, "id has value");
		count++;
	})
	
	// should trigger a change
	state.attr("id",0);
	equals(count, 1, "changing the id to 0 caused a change");
	
	// should not fire a set
	state.removeAttr("id")
	equals(count, 1, "removing the id changed nothing");
	
	state.attr("id",3)
	equals(count, 2, "adding an id calls callback");
	
	state.attr("type","peter")
	equals(count, 2, "changing the type does not fire callback");
	
	state.removeAttr("type");
	state.removeAttr("id");
	
	equals(count, 2, "");
	
	state.attr({
		type : "person",
		id: "5"
	});
	
	equals(count, 3, "setting person and id only fires 1 event");
	
	state.removeAttr("type");
	
	state.attr({
		type : "person"
	});
	equals(count, 4, "setting only person fires 1 event");

	state.removeAttr("id");

	state.attr({
		id : "1"
	});
	equals(count, 5, "setting only id fires 1 event");
})

test("compound sets with wildcards, matching all events", function(){
	var oldPeople = {
		people : [{
			first : "justin",
			last : "meyer"
		},{
			first : "ralph",
			last : "holzmann"
		}]
	}
	var newPeople = {
		people : [{
			first : "justin2",
			last : "meyer2"
		},{
			first : "ralph2",
			last : "holzmann2"
		}]
	}
	var state = new can.Observe(oldPeople),
		changes = 0
	
	state.delegate("people.*.first people.*.last","changes", function(ev, attr, how, newVal, oldVal){
		equals(this, state.attr(attr), "this is set right")
		equals(how, 'set', "how was correct")
		changes++
	});

	state.attr(newPeople)

	equals(changes, 4, "notifications were fired correctly")

})

test("compound sets with wildcards, matching single event", function(){
	var oldPeople = {
		people : [{
			first : "justin",
			last : "meyer"
		},{
			first : "ralph",
			last : "holzmann"
		}]
	}
	var newPeople = {
		people : [{
			first : "justin2",
			last : "meyer2"
		},{
			first : "ralph2",
			last : "holzmann2"
		}]
	}
	var state = new can.Observe(oldPeople),
		changes = 0
	
	state.delegate("people.*.first people.*.last","change", function(ev, attr, how, newVal, oldVal){
		equals(this, state.attr(attr), "this is set right")
		equals(how, 'set', "how was correct")
		changes++
	});

	state.attr(newPeople)

	equals(changes, 1, "notifications were fired correctly")

})

test("compound sets with wildcards with value, matching multiple events", function(){
	var oldPeople = {
		people : [{
			first : "justin",
			last : "meyer"
		},{
			first : "ralph",
			last : "holzmann"
		}]
	}
	var newPeople = {
		people : [{
			first : "justin2",
			last : "meyer2"
		},{
			first : "ralph2",
			last : "holzmann2"
		}]
	}
	var state = new can.Observe(oldPeople),
		changes = 0

	state.delegate("people.*.first=justin2 people.*.last=holzmann2","changes", function(ev, attr, how, newVal, oldVal){
		equals(this, state.attr(attr), "this is set right")
		equals(how, 'set', "how was correct")
		changes++
	});

	state.attr(newPeople)

	equals(changes, 2, "notifications were fired correctly")	
})

test("undelegate within event loop",1, function(){

	var state = new can.Observe({
		type : "person",
		id: "5"
	});
	var f1 = function(){
		state.undelegate("type","add",f2);
	},
		f2 = function(){
			ok(false,"I am removed, how am I called")
		},
		f3 = function(){
			state.undelegate("type","add",f1);
		},
		f4 = function(){
			ok(true,"f4 called")
		};
	state.delegate("type", "set", f1);
	state.delegate("type","set",f2);
	state.delegate("type","set",f3);
	state.delegate("type","set",f4);
	state.attr("type","other");

})

})();