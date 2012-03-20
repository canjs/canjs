steal('funcunit/qunit','./string').then(function(){
	
module("can/util/string")

test("can.String.sub", function(){
	equals(can.String.sub("a{b}",{b: "c"}),"ac")
	
	var foo = {b: "c"};
	
	equals(can.String.sub("a{b}",foo,true),"ac");
	
	ok(!foo.b, "removed this b");
	
	
});

test("can.String.sub double", function(){
	equals(can.String.sub("{b} {d}",[{b: "c", d: "e"}]),"c e");
})

test("String.underscore", function(){
	equals(can.String.underscore("Foo.Bar.ZarDar"),"foo.bar.zar_dar")
})


test("can.String.getObject", function(){
	var obj = can.String.getObject("foo", [{a: 1}, {foo: 'bar'}]);
	
	equals(obj,'bar', 'got bar')
	
	
	// test null data
	
	var obj = can.String.getObject("foo", [{a: 1}, {foo: 0}]);
	
	equals(obj,0, 'got 0 (falsey stuff)')
});
/*
test("$.String.niceName", function(){
	var str = "some_underscored_string";
	var niceStr = $.String.niceName(str);
	equals(niceStr, 'Some Underscored String', 'got correct niceName');
})*/

	
}).then('./deparam/deparam_test');
