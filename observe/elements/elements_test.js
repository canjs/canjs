steal('funcunit/qunit', 'can/observe/elements',function(){

module("can/obvserve/elements");

test("hookup and obvserve", function(){
	can.Observe('Person')
	var div = can.$(document.createElement('div'))
	var p = new Person({foo: "bar2", id: 5});
	p.hookup( div );
	ok(div.hasClass("person"), "has person");
	ok(div.hasClass("person_5"), "has person_5");
	equals(div.model(), p,"gets model" )
})

// test that models returns an array of unique instances
test("unique obvserves", function(){
	var div1 = can.$("<div/>")
	var div2 = can.$("<div/>")
	var div3 = can.$("<div/>")
	var p = new Person({foo: "bar2", id: 5});
	var p2 = new Person({foo: "bar3", id: 4});
	p.hookup( div1 );
	p.hookup( div2 );
	p2.hookup( div3 );
	var models = div1.add(div2).add(div3).models();
	equals(p, models[0], "gets models" )
	equals(p2, models[1], "gets models" )
	equals(2, models.length, "gets models" )
})

test("identity should replace spaces with underscores", function(){
	can.Observe("Task",{},{});
	t = new Task({
		id: "id with spaces"
	});
	equals(t.identity(), "task_id_with_spaces")
});


test("hookup and elements", function(){
	can.Observe('Escaper',{
		escapeIdentity : true
	},{});
	
	var ul = can.$('<ul><li></li></ul>'),
		li = ul.find('li');
	
	var esc = new Escaper({id: " some crazy #/ %ing stuff"});
	
	li.model(esc);
	
	var res  = esc.elements(ul);
	
	equals(res.length,1)
	equals(res[0], li[0])
})

});