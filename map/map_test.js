(function(undefined) {

module('can/map')

test("Basic Map",4,function(){
	
	var state = new can.Map({
		category : 5,
		productType : 4
	});
	
	var added;
	
	state.bind("change", function(ev, attr, how, val, old){
		equal(attr, "category", "correct change name")
		equal(how, "set")
		equal(val,6, "correct")
		equal(old,5, "correct")
	});
	
	

	state.attr("category",6);

	state.unbind("change");


});

test("Nested Map", 5, function(){
	var me = new can.Map({
		name : {first: "Justin", last: "Meyer"}
	});
	
	ok(me.attr("name") instanceof can.Map);
	
	me.bind("change", function(ev, attr, how, val, old){
		equal(attr, "name.first", "correct change name")
		equal(how, "set")
		equal(val,"Brian", "correct")
		equal(old,"Justin", "correct")
	})
	
	me.attr("name.first","Brian");
	
	me.unbind("change")
	
})

test("remove attr", function(){
	var state = new can.Map({
		category : 5,
		productType : 4
	});
	state.removeAttr("category");
	deepEqual( can.Map.keys(state), ["productType"], "one property" );
});

test("nested event handlers are not run by changing the parent property (#280)", function(){
	
	var person = new can.Map({
		name: {first: "Justin"}
	})
	person.bind("name.first", function(ev, newName){
		ok(false,"name.first should never be called")
		//equal(newName, "hank", "name.first handler called back with correct new name")
	});
	person.bind("name", function(){
		ok(true, "name event triggered")
	})
	
	person.attr("name",{first: "Hank"});
	
})


})();
