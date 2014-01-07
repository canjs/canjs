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
	
});

test("cyclical objects (#521)", function(){
	
	var foo = {};
	foo.foo = foo;
	
	var fooed = new can.Map(foo);
	
	ok(true, "did not cause infinate recursion");
	
	ok(  fooed.attr('foo') === fooed, "map points to itself")
	
	var me = {name: "Justin"}
	var references = {husband: me, friend: me}
	var ref = new can.Map(references)
	
	ok( ref.attr('husband') === ref.attr('friend'),  "multiple properties point to the same thing")
	
})

test('Getting attribute that is a can.compute should return the compute and not the value of the compute (#530)', function() {
	var compute = can.compute('before');
	var map = new can.Map({
		time: compute
	});

	equal(map.time, compute, 'dot notation call of time is compute');
	equal(map.attr('time'), compute, '.attr() call of time is compute');
})

test('_cid add to original object', function() {
	var map = new can.Map(),
		obj = {'name': 'thecountofzero'};

	map.attr('myObj', obj);
	ok(!obj._cid, '_cid not added to original object');
})

test("can.each used with maps", function(){
	can.each(new can.Map({foo: "bar"}),function(val, attr){
		
		if(attr === "foo"){
			equal(val, "bar")
		} else {
			ok(false, "no properties other should be called "+attr)
		}
		
		
	})
})


test("can.Map serialize triggers reading (#626)", function(){
	var old = can.__reading;

	var attributesRead = [];
	var readingTriggeredForKeys = false;

	can.__reading = function(object, attribute) {
		if (attribute === "__keys"){
			readingTriggeredForKeys = true;
		} else {
			attributesRead.push(attribute);
		}
        }

	var testMap = new can.Map({ cats: "meow", dogs: "bark" });

	testMap.serialize();

	ok(attributesRead.indexOf("cats") !== -1 && attributesRead.indexOf("dogs") !== -1, "map serialization triggered __reading on all attributes");
	ok(readingTriggeredForKeys, "map serialization triggered __reading for __keys");

	can.__reading = old;
})

})();
