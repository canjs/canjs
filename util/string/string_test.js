steal('funcunit/qunit', './string', function(qunit, can){

module("can/util/string")

test("can.sub", function(){
	equals(can.sub("a{b}",{b: "c"}),"ac");

	var foo = {b: "c"};

	equals(can.sub("a{b}",foo,true),"ac");
	ok(!foo.b,"b's value was removed");
});

test("can.sub with undefined values", function() {
  var subbed = can.sub('test{exists} plus{noexists}', { exists : 'test' });
  same(subbed, null, 'Rendering with undefined values should return null');

  var subbed = can.sub('test{exists} plus{noexists}', { exists : 'test' }, true);
  same(subbed, null, 'Rendering with undefined values should return null even when remove param is true');
});

test("can.sub double", function(){
	equals(can.sub("{b} {d}",[{b: "c", d: "e"}]),"c e");
});

test("String.underscore", function(){
	equals(can.underscore("Foo.Bar.ZarDar"),"foo.bar.zar_dar")
});


test("can.getObject", function(){
	var obj = can.getObject("foo", [{a: 1}, {foo: 'bar'}]);

	equals(obj,'bar', 'got bar')


	// test null data

	var obj = can.getObject("foo", [{a: 1}, {foo: 0}]);

	equals(obj,0, 'got 0 (falsey stuff)')

	// Remove

	var obj = can.getObject("foo", {}, false)
	equals(obj, undefined, "got 'undefined'")
});

test("can.esc",function(){
	var text = can.esc(0);
	equal(text, "0", "0 value properly rendered");

	text = can.esc(null);
	deepEqual(text, "", "null value returns empty string");

	text = can.esc();
	deepEqual(text, "", "undefined returns empty string");

	text = can.esc(NaN);
	deepEqual(text, "", "NaN returns empty string");

	text = can.esc("<div>&nbsp;</div>");
	equal(text, "&lt;div&gt;&amp;nbsp;&lt;/div&gt;", "HTML escaped properly");
});

/*
test("$.String.niceName", function(){
	var str = "some_underscored_string";
	var niceStr = $.String.niceName(str);
	equals(niceStr, 'Some Underscored String', 'got correct niceName');
})*/


}).then('./deparam/deparam_test');
