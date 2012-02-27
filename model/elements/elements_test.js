steal('funcunit/qunit','./elements',function(){

module("elements");

test("elements testing works", function(){
	ok(true,"an assert is run");
});


test("hookup and model", function(){
	can.Model('Person')
	var div = $(document.createElement('div'))
	var p = new Person({foo: "bar2", id: 5});
	p.hookup( div[0] );
	ok(div.hasClass("person"), "has person");
	ok(div.hasClass("person_5"), "has person_5");
	equals(p, div.model(),"gets model" )
})

// test that models returns an array of unique instances
test("unique models", function(){
	var div1 = $("<div/>")
	var div2 = $("<div/>")
	var div3 = $("<div/>")
	var p = new Person({foo: "bar2", id: 5});
	var p2 = new Person({foo: "bar3", id: 4});
	p.hookup( div1[0] );
	p.hookup( div2[0] );
	p2.hookup( div3[0] );
	var models = div1.add(div2).add(div3).models();
	equals(p, models[0], "gets models" )
	equals(p2, models[1], "gets models" )
	equals(2, models.length, "gets models" )
})

test("identity should replace spaces with underscores", function(){
	can.Model("Task",{},{});
	t = new Task({
		id: "id with spaces"
	});
	equals(t.identity(), "task_id_with_spaces")
});


test("hookup and elements", function(){
	can.Model('Escaper',{
		escapeIdentity : true
	},{});
	
	var ul = $('<ul><li></li></ul>'),
		li = ul.find('li');
	
	var esc = new Escaper({id: " some crazy #/ %ing stuff"});
	
	li.model(esc);
	
	var res  = esc.elements(ul);
	
	equals(res.length,1)
	equals(res[0], li[0])
})

});