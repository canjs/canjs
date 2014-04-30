(function () {

	test("list.isResolved", function () {

		var def = new can.Deferred();

		var l = new can.List(def);

		ok(!l.isResolved(), "deferred-list is not resolved");

		stop();

		l.done(function () {

			ok(l.isResolved(), "it's resolved!");
			deepEqual(l.attr(), ["one", 2], "has data");

			start();
		});

		def.resolve(["one", 2]);

	});

	test("list.isResolved in a compute", function () {

		var def = new can.Deferred();

		var l = new can.List(def);

		var c = can.compute(function () {
			return l.isResolved();
		});

		ok(!c(), "not resolved");

		var callbackCount = 0;

		c.bind("change", function (ev, newVal, oldVal) {
			callbackCount++;

			if (callbackCount === 1) {
				ok(newVal, "resolved");
				deepEqual(l.attr(), [1, 2]);
			} else if (callbackCount === 2) {
				ok(!newVal, "not resolved");
			} else if (callbackCount === 3) {
				ok(newVal, "resolved");
				deepEqual(l.attr(), ["a", "b"]);
				start();
			}
		});

		stop();

		def.resolve([1, 2]);

		setTimeout(function () {

			var def2 = new can.Deferred();
			l.replace(def2);

			setTimeout(function () {
				def2.resolve(["a", "b"]);
			}, 60);

		}, 60);

	});

})();
