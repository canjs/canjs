(function() {
	
module("can/observe/clone",{
	setup : function(){
	}
});

test("Clone creates instance of observe subclass", function() {

	var foo = can.Observe({})
	, f = new foo()
	, c = f.clone();

	ok(c instanceof foo);
	ok(c instanceof foo.Clone);
	ok(c.isClone);
});

test("Clone attribute changes do not (initially) affect original", function() {
	var foo = can.Observe({})
	, f = new foo({bar : "baz"})
	, c = f.clone();

	c.attr("bar", "quux");
	equal(c.bar, "quux");
	equal(f.bar, "baz");
});

test("Clone attribute changes merge back to original; unchanged ones left alone", function() {
	var foo = can.Observe({})
	, f = new foo({bar : "baz", quux : "thud"})
	, c = f.clone();

	c.attr("bar", "jeek");
	f.attr("quux", "plonk");
	c.merge();
	equal(f.bar, "jeek");
	equal(f.quux, "plonk");
});

test("Deep cloning", function() {
	var foo = can.Observe({})
	, bar = can.Observe({})
	, f = new foo({ baz : new bar({ quux : "thud"}) })
	, c = f.clone(true);

	ok(c._deep);
	ok(c.baz instanceof bar.Clone);
	c.baz.attr("quux", "jeek");
	c.merge();
	ok(f.baz instanceof bar);
	equal(f.baz.quux, "jeek");
});

test("can.Model.Clone saving", function() {

	var foo = can.Model({
		makeCreate : function() {
			return function(attrs) {
				return can.when({id : 2, bar : "quux"});
			}
		}
		, makeUpdate : function() {
			return function(id, attrs) {
				equal(id, 1);
				return can.when({id : 1, bar : "thud"});
			}
		}
	}, {})
	, f = new foo({ bar : "baz"})
	, g = new foo({ id : 1, bar : "baz"})
	, c = f.clone()
	, d = g.clone();

	equal(d.original_id, 1);
	ok(!d.id);

	c.save().done(function() {
		equal(f.id, 2);
		equal(f.bar, "quux");
	});

	d.save().done(function() {
		equal(g.id, 1);
		equal(g.bar, "thud");
	});

});

})();