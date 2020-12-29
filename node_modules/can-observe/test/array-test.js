var QUnit = require("steal-qunit");
var observe = require("can-observe");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var Observation = require("can-observation");

var metaSymbol = canSymbol.for("can.meta");
var computedPropertyDefinitionSymbol = canSymbol.for("can.computedPropertyDefinitions");

QUnit.module("can-observe with Array");

var makeArray = require("../src/-make-array");
var makeObserve = require("../src/-make-observe");

QUnit.test("makeArray basics", function(assert) {
	var hobbies = makeArray.observable(["basketball", "programming"], makeObserve);

	var hobbiesList = new Observation(function hobbiesList() {
		return hobbies.join(",");
	});

	canReflect.onValue(hobbiesList, function hobbiesChanged(newVal) {
		assert.equal(newVal, "basketball");
	});

	// causes change event above
	hobbies.pop();
});

QUnit.test("makeArray basics, with property definitions", function(assert) {
	var hobbies = makeArray.observable(["d&d", "programming"], makeObserve);

	hobbies[computedPropertyDefinitionSymbol] = Object.create(null);
	hobbies[computedPropertyDefinitionSymbol].list = function(instance) {
		return new Observation(function() {
			return this.join(", ");
		}, instance);
	};

	var handler = function(newVal) {
		assert.equal(newVal, "d&d, arduino");
	};

	assert.equal(hobbies.list, "d&d, programming");

	canReflect.onKeyValue(hobbies, "list", handler);
	hobbies[1] = "arduino";
	assert.equal(hobbies.list, "d&d, arduino");

	canReflect.offKeyValue(hobbies, "list", handler);
	hobbies[0] = "cooking";
	assert.equal(hobbies.list, "cooking, arduino");
});

QUnit.test("basics with array", function(assert) {
	var hobbies = observe(["basketball", "programming"]);

	var hobbiesList = new Observation(function() {
		return hobbies.join(",");
	});

	canReflect.onValue(hobbiesList, function(newVal) {
		assert.equal(newVal, "basketball");
	});

	// causes change event above
	hobbies.pop();
});

QUnit.test("filter with an expando property", function(assert) {
	var arr = observe([{
		id: 1,
		complete: true
	}, {
		id: 2,
		complete: false
	}, {
		id: 3,
		complete: true
	}]);
	arr.filterComplete = true;

	var filtered = new Observation(function() {
		return arr.filter(function(item, index, array) {
			return array.filterComplete === item.complete;
		});
	});
	var lengths = [];
	canReflect.onValue(filtered, function(newFiltered) {
		lengths.push(newFiltered.length);
	});

	arr[1].complete = true; //-> 3

	arr.filterComplete = false; //-> 0

	assert.deepEqual(lengths, [3, 0], "got the right updates");
});


QUnit.test("Should convert nested arrays to observables in a lazy way (get case) #21", function(assert) {
	var nested = [];
	var obj = {
		nested: nested
	};
	var obs = observe(obj);

	assert.ok(!canReflect.isObservableLike(nested), "nested is not converted before read");
	assert.equal(Object.getOwnPropertySymbols(nested).indexOf(metaSymbol), -1, "nested is not observed");
	assert.equal(canReflect.isObservableLike(obs.nested), true, "nested is converted to a proxy and the proxy returned");
	assert.ok(!canReflect.isObservableLike(nested), "nested is not converted after read");
	assert.equal(obs.nested, observe(nested), "converted to same observable");
});


QUnit.test("Should convert nested arrays to observables (set case) #21", function(assert) {
	var nested = [];
	var obj = {};
	var obs = observe(obj);

	assert.ok(!canReflect.isObservableLike(nested), "nested is not converted before set");
	assert.equal(Object.getOwnPropertySymbols(nested).indexOf(metaSymbol), -1, "nested is not observed");
	obs.nested = nested;
	assert.equal(canReflect.isObservableLike(obs.nested), true, "nested is converted to a proxy and the proxy returned");
	assert.ok(!canReflect.isObservableLike(nested), "nested is not converted after set");
	assert.equal(obs.nested, observe(nested), "converted to same observable");
});




QUnit.test("array events are automatically triggered (push)", function(assert) {
	assert.expect(4);
	var list = observe([1, 2]);
	var newThing = 3;

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.ok(patches.length > 0, "Patches generated");
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			} // ignore length property patches
			assert.equal(patch.deleteCount, 0, "nothing removed");
			assert.equal(patch.index, list.length - 1, "new thing added to end");
			assert.deepEqual(patch.insert, [newThing], "new thing added to end");
		});
	});

	list.push(newThing);
});

QUnit.test("array events are automatically triggered (pop)", function(assert) {
	assert.expect(3);
	var list = observe([1, 2, 3]);

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.ok(patches.length > 0, "Patches generated");
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			} // ignore length property patches
			assert.equal(patch.deleteCount, 1, "old thing removed");
			assert.equal(patch.index, list.length, "old thing removed from end");
		});
	});

	list.pop();
});

QUnit.test("array events are automatically triggered (unshift)", function(assert) {
	assert.expect(4);
	var list = observe([1, 2]);
	var newThing = 3;

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.ok(patches.length > 0, "Patches generated");
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			} // ignore length property patches
			assert.equal(patch.deleteCount, 0, "nothing removed");
			assert.equal(patch.index, 0, "new thing added to beginning");
			assert.deepEqual(patch.insert, [newThing], "new thing added to beginning");
		});
	});

	list.unshift(newThing);
});

QUnit.test("array events are automatically triggered (shift)", function(assert) {
	assert.expect(3);
	var list = observe([1, 2, 3]);

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.ok(patches.length > 0, "Patches generated");
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			} // ignore length property patches
			assert.equal(patch.deleteCount, 1, "old thing removed");
			assert.equal(patch.index, 0, "old thing removed from beginning");
		});
	});

	list.shift();
});

QUnit.test("array events are automatically triggered (splice)", function(assert) {
	assert.expect(4);
	var list = observe([1, 2, 3]);
	var newThing = 4;

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.ok(patches.length > 0, "Patches generated");
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			} // ignore length property patches
			assert.equal(patch.deleteCount, 1, "nothing removed");
			assert.equal(patch.index, 1, "new thing added to beginning");
			assert.deepEqual(patch.insert, [newThing], "new thing added to beginning");
		});
	});

	list.splice(1, 1, newThing);
});

QUnit.test("array events are automatically triggered (sort)", function(assert) {
	assert.expect(1);
	var list = observe(["a", "c", "b"]);

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.deepEqual(patches.filter(function(p) {
			return !p.key;
		}), [
			{
				"index": 0,
				"deleteCount": 3,
				"insert": ["a", "b", "c"],
				type: "splice"
			}
		], "patches correct");
	});

	list.sort();
});

QUnit.test("array events are automatically triggered (reverse)", function(assert) {
	assert.expect(1);
	var list = observe(["a", "b", "c"]);

	var expectedList = list.slice(0).reverse();

	list[canSymbol.for("can.onPatches")](function(patches) {
		assert.deepEqual(patches.filter(function(p) {
			return !p.key;
		}), [{
			"index": 0,
			"deleteCount": 3,
			"insert": expectedList,
			"type": "splice"
		}], "patches replaces whole list");
	});

	list.reverse();
});

QUnit.test("non-mutating array -> array functions return proxied arrays", function(assert) {
	var list = observe([0, 2, 3]);
	assert.ok(list.map(function(x) {
		return x + 1;
	})[metaSymbol], "Map returns proxy");
	assert.ok(list.filter(function(x) {
		return x;
	})[metaSymbol], "Filter returns proxy");
	assert.ok(list.slice(0)[metaSymbol], "Slice returns proxy");
	assert.ok(list.concat([5, 6])[metaSymbol], "Concat returns proxy");
});

QUnit.test("non-mutating reduce functions return proxied objects", function(assert) {
	var list = observe([0, 2, 3]);
	assert.ok(list.reduce(function(a, b) {
		a[b] = true;
		return a;
	}, {})[metaSymbol], "Reduce returns proxy");
	assert.ok(list.reduceRight(function(a, b) {
		a[b] = true;
		return a;
	}, {})[metaSymbol], "ReduceRight returns proxy");
});



QUnit.test("custom, non-array functions can be redefined", function(assert) {
	assert.expect(1);
	var p = observe({
		foo: function() {
			assert.ok(true, "first function called");
		}
	});

	p.foo();
	p.foo = function() {};
	p.foo();
});



QUnit.test("patches events for keyed properties on arrays", function(assert) {
	assert.expect(9);
	var addObject = observe([]);
	var setObject = observe([]);
	setObject.a = 1;
	var removeObject = observe([]);
	removeObject.a = 1;

	addObject[canSymbol.for("can.onPatches")](function(patches) {
		assert.equal(patches[0].key, "a", "a=1");
		assert.equal(patches[0].type, "add");
		assert.equal(patches[0].value, 1);
	});
	addObject.a = 1;
	setObject[canSymbol.for("can.onPatches")](function(patches) {
		assert.equal(patches[0].key, "a", "a=2");
		assert.equal(patches[0].type, "set");
		assert.equal(patches[0].value, 2);
	});
	setObject.a = 2;
	removeObject[canSymbol.for("can.onPatches")](function(patches) {
		assert.equal(patches[0].key, "a", "delete a");
		assert.equal(patches[0].type, "delete");
		assert.ok(!patches[0].value);
	});
	delete removeObject.a;

});

QUnit.test("patches events for set/deleted indexed properties on arrays", function(assert) {
	assert.expect(2);
	//var setArrayObject = observe([]);
	var setArrayObject2 = observe([]);
	var deleteArrayObject = observe(["a", "b"]);

	setArrayObject2[canSymbol.for("can.onPatches")](function(patches) {
		assert.deepEqual(patches,[{
		    "key": "2",
		    "type": "add",
		    "value": "a"
		  },{
			type: "splice",
			index:0,
			deleteCount: 0,
			insert: [undefined, undefined,"a"]
		}]);

	});
	setArrayObject2[2] = "a";

	deleteArrayObject[canSymbol.for("can.onPatches")](function(patches) {
		assert.deepEqual(patches,[{
		    "key": "length",
		    "type": "set",
		    "value": 0
		  },{
			type: "splice",
			index:0,
			deleteCount: 2,
			insert: []
		}]);
	});
	deleteArrayObject.length = 0; // deleting object at index 1 is implicit in setting length

});

QUnit.test("arrays don't listen on individual keys in comprehensions", function(assert) {
	assert.expect(5);
	var a = [1, 2];
	var p = observe(a);
	var o = new Observation(function() {
		return p[0];
	});
	var o2 = new Observation(function() {
		return p.map(function(b) {
			return b + 1;
		});
	});

	canReflect.onValue(o, function(newVal) {
		assert.equal(newVal, a[0], "Sanity check: observation on index 0");
	});
	canReflect.onValue(o2, function(newVal) {
		assert.deepEqual(newVal, a.map(function(b) {
			return b + 1;
		}), "Sanity check: observation on map");
	});

	assert.ok(p[metaSymbol].handlers.getNode(["0"]), "Handlers for directly read index");
	assert.ok(!p[metaSymbol].handlers.getNode(["1"]), "no handlers for indirectly read index");

	p[0] = 2;
	p[1] = 3;
});

QUnit.test("changing an item at an array index dispatches a splice patch", function(assert) {
	assert.expect(3);
	var a = observe([1, 2]);

	a[canSymbol.for("can.onPatches")](function(patches) {
		patches.forEach(function(patch) {
			if (patch.key) {
				return;
			}
			assert.equal(patch.index, 0);
			assert.equal(patch.deleteCount, 1);
			assert.deepEqual(patch.insert, [2]);
		});
	});

	a[0] = 2;
});
