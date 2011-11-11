steal('funcunit/qunit','jquery/lang/observe',function(){


module('jquery/lang/observe/delegate')

var matches = $.Observe.prototype.delegate.matches;

test("matches", function(){
	
	equals( matches({parts: ['**']}, ['foo','bar','0']) ,
		'foo.bar.0' , "everything" );
		
	equals( matches({parts: ['*.**']}, ['foo']) ,
		null , "everything at least one level deep" )
	
	equals( matches({parts: ['foo','*']}, ['foo','bar','0']) ,
		'foo.bar' )
	
	equals(matches({parts: ['*']}, 
					['foo','bar','0']) ,
					'foo' );
					
	equals( matches({parts: [ '*', 'bar' ]}, 
					['foo','bar','0']) ,
					'foo.bar' )
	// - props - 
	// - returns - 'foo.bar'
})

test("list events", function(){
	
	var list = new $.Observe.List([
		{name: 'Justin'},
		{name: 'Brian'},
		{name: 'Austin'},
		{name: 'Mihael'}])
	list.comparator = 'name';
	list.sort();
	// events on a list
	// - move - item from one position to another
	//          due to changes in elements that change the sort order
	// - add (items added to a list)
	// - remove (items removed from a list)
	// - reset (all items removed from the list)
	// - change something happened
	
	// a move directly on this list
	list.bind('move', function(ev, item, newPos, oldPos){
		ok(true,"move called");
		equals(item.name, "Zed");
		equals(newPos, 3);
		equals(oldPos, 0);
	});
	
	// a remove directly on this list
	list.bind('remove', function(ev, items, oldPos){
		ok(true,"remove called");
		equals(items.length,1);
		equals(items[0].name, 'Alexis');
		equals(oldPos, 0, "put in right spot")
	})
	list.bind('add', function(ev, items, newPos){
		ok(true,"add called");
		equals(items.length,1);
		equals(items[0].name, 'Alexis');
		equals(newPos, 0, "put in right spot")
	});
	
	list.push({name: 'Alexis'});
	
	// now lets remove alexis ...
	list.splice(0,1);
	list[0].attr('name',"Zed")
})


test("delegate", function(){
	
	var state = new $.Observe({
		properties : {
		  prices : []
		}
	});
	var prices = state.attr('properties.prices');
	
	state.delegate("properties.price","change", function(ev, attr, how, val, old){
		equals(attr, "0", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		ok(this === price, "rooted element")
	});
	
	prices.push({foo: "bar"});
	
	state.undelegate();
	
})
test("delegate on add", function(){
	
	var state = new $.Observe({});
	
	state.delegate("foo","add", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	}).delegate("foo","remove", function(){
		ok(false,"remove should not be called")
	});
	
	state.attr("foo","bar")
	
})

test("delegate set is called on add", function(){
	var state = new $.Observe({});
	
	state.delegate("foo","set", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	});
	state.attr("foo","bar")
});


test("delegate on deep properties with *", function(){
	var state = new $.Observe({
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
})

});