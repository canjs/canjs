module('can/observe')

test("Basic Observe",9,function(){
	
	var state = new can.Observe({
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
		equals(attr, "properties.brand.0", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		
		added = val[0];
	});
	
	
	
	state.attr("properties.brand").push({foo: "bar"});
	
	state.unbind("change");
	
	added.bind("change", function(ev, attr, how, val, old){
		equals(attr, "foo","foo property set on added")
		equals(how, "set","added")
		equals(val, "zoo","added")
	})
	state.bind("change", function(ev, attr, how, val, old){
		equals(attr, "properties.brand.0.foo")
		equals(how, "set")
		equals(val,"zoo")
	});
	added.attr("foo", "zoo");
	
});

test("list attr changes length", function(){
	var l = new can.Observe.List([0,1,2])
	l.attr(3,3)
	equals(l.length, 4);
})

test("list splice", function(){
	var l = new can.Observe.List([0,1,2,3]),
		first = true;
  
	l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
		equals (attr, "1")
		// where comes from the attr ...
		//equals(where, 1)
		if(first){
			equals( how, "remove", "removing items" )
			equals( newVals, undefined, "no new Vals" )
		} else {
			same( newVals, ["a","b"] , "got the right newVals")
			equals( how, "add", "adding items" )
		}
	
		first = false;
	})
	
	l.splice(1,2, "a", "b"); 
	same(l.serialize(), [0,"a","b", 3], "serialized")
});



test("list pop", function(){
	var l = new can.Observe.List([0,1,2,3]);
  
	l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
		equals (attr, "3")
		
		equals( how, "remove" )
		equals( newVals, undefined )
		same( oldVals, [3] )
	})
	
	l.pop(); 
	same(l.serialize(), [0,1,2])
})

test("changing an object unbinds", function(){
	var state = new can.Observe({
		category : 5,
		productType : 4,
		properties : {
		  brand: [],
		  model : [],
		  price : []
		}
	}),
	count = 0;
	
	var  brand = state.attr("properties.brand");
	
	state.bind("change", function(ev, attr, how, val, old){
		equals(attr,"properties.brand");
		
		equals(count, 0, "count called once");
		count++;
		equals(how, "set")
		equals(val[0], "hi")
	});
	state.attr("properties.brand",["hi"]);
	
	brand.push(1,2,3);
	
});

test("replacing with an object that object becomes observable",function(){
	var state = new can.Observe({
		properties : {
		  brand: [],
		  model : [],
		  price : []
		}
	});
	
	ok(state.attr("properties").bind, "has bind function");
	
	state.attr("properties",{});
	
	ok(state.attr("properties").bind, "has bind function");
});

test("remove attr", function(){
	var state = new can.Observe({
		properties : {
		  brand: [],
		  model : [],
		  price : []
		}
	});
	
	state.bind("change", function(ev, attr, how, newVal, old){
		equals(attr, "properties");
		equals(how, "remove")
		same(old.serialize() ,{
		  brand: [],
		  model : [],
		  price : []
		} );
	})
	
	state.removeAttr("properties");
	equals(undefined,  state.attr("properties") );
});

test("attr with an object", function(){
	var state = new can.Observe({
		properties : {
		  foo: "bar",
		  brand: []
		}
	});
	
	state.bind("change", function(ev, attr, how, newVal){
		equals(attr, "properties.foo")
		equals(newVal, "bad")
	})
	
	state.attr({
		properties : {
		  foo: "bar",
		  brand: []
		}
	})
	
	state.attr({
		properties : {
		  foo: "bad",
		  brand: []
		}
	});
	
	state.unbind("change");
	
	state.bind("change", function(ev, attr, how, newVal){
		equals(attr, "properties.brand.0")
		equals(how,"add")
		same(newVal, ["bad"])
	});
	
	state.attr({
		properties : {
		  foo: "bad",
		  brand: ["bad"]
		}
	});
	
});

test("empty get", function(){
	var state = new can.Observe({});
	
	equals(state.attr('foo.bar'), undefined)
});

test("attr deep array ", function(){
	var state = new can.Observe({});
	var arr = [{
			foo: "bar"
		}],
		thing = {
			arr: arr
		};
	
	state.attr({
		thing: thing
	}, true);
	
	ok(thing.arr === arr, "thing unmolested");
});

test('attr semi-serialize', function(){
	var first = {
			foo : {bar: 'car'},
			arr: [1,2,3, {four: '5'}]
		},
		compare = {
			foo : {bar: 'car'},
			arr: [1,2,3, {four: '5'}]
		};
	
	var res = new can.Observe(first).attr();
	same(res,compare, "test")
})
	
test("attr sends events after it is done", function(){
	var state = new can.Observe({foo: 1, bar: 2})
	state.bind('change', function(){
		equals(state.attr('foo'), -1, "foo set");
		equals(state.attr('bar'), -2, "bar set")
	})
	state.attr({foo: -1, bar: -2});
})

test("direct property access", function(){
	var state = new can.Observe({foo: 1, attr: 2});
	equals(state.foo,1);
	equals(typeof state.attr, 'function')
})

test("pop unbinds", function(){
	var l = new can.Observe.List([{foo: 'bar'}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function(ev, attr, how, newVal, oldVal){
		count++;
		if(count == 1){
			// the prop change
			equals(attr, '0.foo', "count is set");
		} else if(count === 2 ){
			equals(how, "remove");
			equals(attr, "0")
		} else {
			ok(false, "called too many times")
		}
		
	})
	
	equals( o.attr('foo') , 'bar');
	
	o.attr('foo','car')
	l.pop();
	o.attr('foo','bad')
})

test("splice unbinds", function(){
	var l = new can.Observe.List([{foo: 'bar'}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function(ev, attr, how, newVal, oldVal){
		count++;
		if(count == 1){
			// the prop change
			equals(attr, '0.foo', "count is set");
		} else if(count === 2 ){
			equals(how, "remove");
			equals(attr, "0")
		} else {
			ok(false, "called too many times")
		}
		
	})
	
	equals( o.attr('foo') , 'bar');
	
	o.attr('foo','car')
	l.splice(0,1);
	o.attr('foo','bad')
});


test("always gets right attr even after moving array items", function(){
	var l = new can.Observe.List([{foo: 'bar'}]);
	var o = l.attr(0);
	l.unshift("A new Value")
	
	
	l.bind('change', function(ev, attr, how){
		equals(attr, "1.foo")
	})
	
	
	o.attr('foo','led you')
})
 
test("recursive observers do not cause stack overflow", function() {
	var a = new can.Observe();
	var b = new can.Observe({a: a});
	a.attr("b", b);

});

test("bind to specific attribute changes when an existing attribute's value is changed", function() {
	var paginate = new can.Observe( { offset: 100, limit: 100, count: 2000 } );
	paginate.bind( 'offset', function( ev, newVal, oldVal ) {
		equals(newVal, 200);
		equals(oldVal, 100);
	});
	paginate.attr( 'offset', 200 );
});
test("bind to specific attribute changes when an attribute is removed", function() {
	var paginate = new can.Observe( { offset: 100, limit: 100, count: 2000 } );
	paginate.bind( 'offset', function( ev, newVal, oldVal ) {
		equals(newVal, undefined);
		equals(oldVal, 100);
	});
	paginate.removeAttr( 'offset' );
});

