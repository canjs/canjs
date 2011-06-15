steal.plugins('funcunit/qunit','jquery/lang/observe').then(function(){
	
module('jquery/lang/observe')

test("Basic Observe",9,function(){
	
	var state = new $.Observe({
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
		equals(attr, "properties.brand", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		
		added = val[0];
	});
	
	
	
	state.attr("properties.brand").push({foo: "bar"});
	state.unbind("change");
	
	added.bind("change", function(ev, attr, how, val, old){
		equals(attr, "foo")
		equals(how, "set")
		equals(val, "zoo")
	})
	state.bind("change", function(ev, attr, how, val, old){
		equals(attr, "properties.brand.0.foo")
		equals(how, "set")
		equals(val,"zoo")
	});
	added.attr("foo", "zoo");
	
});

test("changing an object unbinds", function(){
	var state = new $.Observe({
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
	console.log("before")
	state.attr("properties.brand",["hi"]);
	console.log("after")
	
	brand.push(1,2,3);
	
});

test("replacing with an object that object becomes observable",function(){
	var state = new $.Observe({
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
	var state = new $.Observe({
		properties : {
		  brand: [],
		  model : [],
		  price : []
		}
	});
	
	state.bind("change", function(ev, attr, how, old){
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

test("merge", function(){
	var state = new $.Observe({
		properties : {
		  foo: "bar",
		  brand: []
		}
	});
	
	state.bind("change", function(ev, attr, how, newVal){
		equals(attr, "properties.foo")
		equals(newVal, "bad")
	})
	
	state.merge({
		properties : {
		  foo: "bar",
		  brand: []
		}
	})
	
	state.merge({
		properties : {
		  foo: "bad",
		  brand: []
		}
	});
	
	state.unbind("change");
	
	state.bind("change", function(ev, attr, how, newVal){
		equals(attr, "properties.brand")
		equals(how,"add")
		same(newVal, ["bad"])
	});
	
	state.merge({
		properties : {
		  foo: "bad",
		  brand: ["bad"]
		}
	});
	
});

test("empty get", function(){
	var state = new $.Observe({});
	
	equals(state.attr('foo.bar'), undefined)
});

test("merge deep array ", function(){
	var state = new $.Observe({});
	var arr = [{
			foo: "bar"
		}],
		thing = {
			arr: arr
		};
	
	state.merge({
		thing: thing
	}, true);
	
	ok(thing.arr === arr, "thing unmolested");
})
	
});
