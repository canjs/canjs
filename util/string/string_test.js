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
	ok(subbed === null, 'Rendering with undefined values should return undefined');
});

test("can.sub double", function(){
	equals(can.sub("{b} {d}",[{b: "c", d: "e"}]),"c e");
});

test("String.underscore", function(){
	equals(can.underscore("Foo.Bar.ZarDar"),"foo.bar.zar_dar")
});


test("can.getObject", function(){

	// ## Single root
	var root, result;

	// # Only get
	root = {foo: 'bar'}

	// exists
	result = can.getObject('foo', root)
	equals(result, 'bar', "got 'bar'")

	// not exists
	result = can.getObject('baz', root)
	equals(result, undefined, "got 'undefined'")

	// # With remove

	// exists
	root = {foo: 'bar'}
	result = can.getObject('foo', root, false)
	equals(result, 'bar', "got 'bar'")
	deepEqual(root, {}, "root is empty")

	// not exists
	root = {foo: 'bar'}
	result = can.getObject('baz', root, false)
	equals(result, undefined, "got 'undefined'")
	deepEqual(root, {foo: 'bar'}, "root is same")

	// # With add

	// exists
	root = {foo: 'bar'}
	result = can.getObject('foo', root, true)
	equals(result, 'bar', "got 'bar'")
	deepEqual(root, {foo: 'bar'}, "root is same")

	// not exists
	root = {foo: 'bar'}
	result = can.getObject('baz', root, true)
	deepEqual(result, {}, "got '{}'")
	deepEqual(root, {foo: 'bar', baz: {}}, "added 'baz: {}' into root")


	// ## Multiple roots
	var root1, root2, roots, result;

	// # Only get
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]

	// exists in first root
	result = can.getObject('a', roots)
	equals(result, 1, "got '1'")

	// exists in second root
	result = can.getObject('b', roots)
	equals(result, 2, "got '2'")

	// not exists anywhere
	result = can.getObject('c', roots)
	equals(result, undefined, "got 'undefined'")

	// # With remove

	// exists in first root
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('a', roots, false)
	equals(result, 1, "got '1'")
	deepEqual(root1, {}, "root is empty")
	deepEqual(root2, {b:2}, "root is same")

	// exists in second root
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('b', roots, false)
	equals(result, 2, "got '2'")
	deepEqual(root1, {a:1}, "root is same")
	deepEqual(root2, {}, "root is empty")

	// not exists anywhere
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('c', roots, false)
	equals(result, undefined, "got 'undefined'")
	deepEqual(root1, {a:1}, "root is same")
	deepEqual(root2, {b:2}, "root is same")


	// # With add
	// exists in first root
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('a', roots, true)
	equals(result, 1, "got '1'")
	deepEqual(root1, {a:1}, "root is same")
	deepEqual(root2, {b:2}, "root is same")


	// exists in second root
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('b', roots, true)
	equals(result, 2, "got '2'")
	deepEqual(root1, {a:1}, "root is same")
	deepEqual(root2, {b:2}, "root is same")

	// not exists anywhere
	root1 = {a: 1}
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('c', roots, true)
	deepEqual(result, {}, "got '{}'")
	deepEqual(root1, {a:1, c:{}}, "added 'c: {}' into first root")
	deepEqual(root2, {b:2}, "root is same")

	// # One of roots is not an object

	// exists in second root
	root1 = undefined
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('b', roots)
	equals(result, 2, "got '2'")

	// exists in second root and remove
	root1 = undefined
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('b', roots, false)
	equals(result, 2, "got '2'")
	equals(root1, undefined, "got 'undefined'")
	deepEqual(root2, {}, "deleted 'b' from root")

	// not exists in any root and add
	root1 = undefined
	root2 = {b: 2}
	roots = [root1, root2]
	result = can.getObject('a', roots, true)
	equals(result, undefined, "got 'undefined'")
	equals(root1, undefined, "root is same")
	deepEqual(root2, {b:2}, "root is same")

	// ## Deep objects
	var root, result;

	// # Only get
	root = {foo : {bar: 'baz'}}

	// exists
	result = can.getObject('foo.bar', root)
	equals(result, 'baz', "got 'baz'")

	// not exists
	result = can.getObject('foo.world', root)
	equals(result, undefined, "got 'undefined'")

	// # With remove

	// exists
	root = {foo : {bar: 'baz'}}
	result = can.getObject('foo.bar', root, false)
	equals(result, 'baz', "got 'baz'")
	deepEqual(root, {foo: {}}, "deep object is empty")

	// not exists
	root = {foo : {bar: 'baz'}}
	result = can.getObject('foo.world', root, false)
	equals(result, undefined, "got 'undefined'")
	deepEqual(root, {foo: {bar:'baz'}}, "root is same")

	// # With add

	// exists
	root = {foo : {bar: 'baz'}}
	result = can.getObject('foo.bar', root, true)
	equals(result, 'baz', "got 'baz'")
	deepEqual(root, {foo: {bar: 'baz'}}, "root is same")

	// not exists
	root = {foo : {bar: 'baz'}}
	result = can.getObject('foo.world', root, true)
	deepEqual(result, {}, "got '{}'")
	deepEqual(root, {foo: {bar: 'baz', world: {}}}, "added 'world: {}' into deep object")

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
