
QUnit.module("meta configuration", {
	teardown: function(){
		delete System.meta.foo;
	}
});

QUnit.test("is set deep", function(){
	System.config({
		meta: {
			foo: {
				format: "global",
				deps: ["bar"]
			}
		}
	});

	System.config({
		meta: {
			foo: {
				format: "global"
			}
		}
	});

	var cfg = System.meta.foo;
	QUnit.equal(cfg.deps.length, 1, "still have the one dep");
});

QUnit.test("added deps get added", function(){
	System.config({
		meta: {
			foo: {
				format: "global",
				deps: []
			}
		}
	});

	System.config({
		meta: {
			foo: {
				format: "global",
				deps: ["bar"]
			}
		}
	});

	var cfg = System.meta.foo;
	QUnit.equal(cfg.deps.length, 1, "still have the one dep");
});

QUnit.test("setting deps to empty removes them", function(){
	System.config({
		meta: {
			foo: {
				format: "global",
				deps: ["bar"]
			}
		}
	});

	System.config({
		meta: {
			foo: {
				format: "global",
				deps: []
			}
		}
	});

	var cfg = System.meta.foo;
	QUnit.equal(cfg.deps.length, 0, "deps were removed");
});

QUnit.test("Can provide a string as the meta value", function(){
	System.config({
		meta: {
			foo: "bar"
		}
	});

	System.config({
		meta: {
			foo: "qux"
		}
	});

	var cfg = System.meta.foo;
	QUnit.equal(cfg, "qux", "meta was set");
});

