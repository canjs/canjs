if (typeof window !== "undefined" && window.QUnit) {
	var cfg = System.meta.foo;
	QUnit.equal(cfg.format, "global");
	QUnit.ok(cfg.deps, "has deps");
	QUnit.equal(cfg.deps.length, 1, "has 1 dep");
	QUnit.equal(cfg.deps[0], "bar", "has correct dep");

	QUnit.start();
	removeMyself();
} else {
	console.log(System.meta);
}
