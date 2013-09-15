(function(undefined) {

module('can/list')



test("list attr changes length", function(){
	var l = new can.List([0,1,2])
	l.attr(3,3)
	equal(l.length, 4);
})

test("list splice", function(){
	var l = new can.List([0,1,2,3]),
		first = true;
  
	l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
		equal(attr, "1")
		// where comes from the attr ...
		//equal(where, 1)
		if(first){
			equal( how, "remove", "removing items" )
			equal( newVals, undefined, "no new Vals" )
		} else {
			deepEqual( newVals, ["a","b"] , "got the right newVals")
			equal( how, "add", "adding items" )
		}
	
		first = false;
	})
	
	l.splice(1,2, "a", "b"); 
	deepEqual(l.serialize(), [0,"a","b", 3], "serialized")
});



test("list pop", function(){
	var l = new can.List([0,1,2,3]);
  
	l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
		equal(attr, "3")
		
		equal( how, "remove" )
		equal( newVals, undefined )
		deepEqual( oldVals, [3] )
	})
	
	l.pop(); 
	deepEqual(l.serialize(), [0,1,2])
})



test("remove nested property in item of array map", function(){
	var state = new can.List([{nested: true}]);
	
	state.bind("change", function(ev, attr, how, newVal, old){
		equal(attr, "0.nested");
		equal(how, "remove")
		deepEqual(old, true);
	})
	
	state.removeAttr("0.nested");
	equal(undefined,  state.attr("0.nested") );
});


test("pop unbinds", function(){
	var l = new can.List([{foo: 'bar'}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function(ev, attr, how, newVal, oldVal){
		count++;
		if(count == 1){
			// the prop change
			equal(attr, '0.foo', "count is set");
		} else if(count === 2 ){
			equal(how, "remove");
			equal(attr, "0")
		} else {
			ok(false, "called too many times")
		}
		
	})
	
	equal( o.attr('foo') , 'bar');
	
	o.attr('foo','car')
	l.pop();
	o.attr('foo','bad')
})

test("splice unbinds", function(){
	var l = new can.List([{foo: 'bar'}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function(ev, attr, how, newVal, oldVal){
		count++;
		if(count == 1){
			// the prop change
			equal(attr, '0.foo', "count is set");
		} else if(count === 2 ){
			equal(how, "remove");
			equal(attr, "0")
		} else {
			ok(false, "called too many times")
		}
		
	})
	
	equal( o.attr('foo') , 'bar');
	
	o.attr('foo','car')
	l.splice(0,1);
	o.attr('foo','bad')
});


test("always gets right attr even after moving array items", function(){
	var l = new can.List([{foo: 'bar'}]);
	
	// get the first item
	var o = l.attr(0);
	// add a new item
	l.unshift("A new Value")
	
	// listen to change
	l.bind('change', function(ev, attr, how){
		equal(attr, "1.foo")
	})
	
	// this should have bubbled right
	o.attr('foo','led you')
});
 


test("Array accessor methods", 11, function() {
	var l = new can.List([ 'a', 'b', 'c' ]),
		sliced = l.slice(2),
		joined = l.join(' | '),
		concatenated = l.concat([ 2, 1 ], new can.List([ 0 ]));

	ok(sliced instanceof can.List, 'Slice is an Observable list');
	equal(sliced.length, 1, 'Sliced off two elements');
	equal(sliced[0], 'c', 'Single element as expected');
	equal(joined, 'a | b | c', 'Joined list properly');
	ok(concatenated instanceof can.List, 'Concatenated is an Observable list');
	deepEqual(concatenated.serialize(), [ 'a', 'b', 'c', 2, 1, 0 ], 'List concatenated properly');
	l.forEach(function(letter, index) {
		ok(true, 'Iteration');
		if(index === 0) {
			equal(letter, 'a', 'First letter right');
		}
		if(index === 2) {
			equal(letter, 'c', 'Last letter right');
		}
	});
});


})();
