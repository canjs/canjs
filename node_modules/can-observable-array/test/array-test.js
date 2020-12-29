const canReflect = require("can-reflect");
const Observation = require("can-observation");
const ObservableArray = require("../src/can-observable-array");
const ObservableObject = require("can-observable-object");
const QUnit = require("steal-qunit");
const type = require("can-type");

module.exports = function() {
	QUnit.test("Adds proxyability to arrays", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos();
		let calls = 0;
		let expected = 2;

		canReflect.onKeyValue(todos, 0, newValue => {
			calls++;
			assert.equal(newValue, "get this working", "able to listen to push");
		});

		canReflect.onKeyValue(todos, 14, newValue => {
			calls++;
			assert.equal(newValue, "some value", "able to listen to property setter");
		});

		todos.push("get this working");
		todos[14] = "some value";

		assert.equal(calls, expected, "Got all of the values I expected");
	});

	QUnit.test(".filter can be provided an object", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos([
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		let completed = todos.filter({ completed: true });
		assert.equal(completed.length, 1, "only one");
		assert.equal(completed[0].name, "cook dinner");
		assert.ok(completed instanceof Todos, "Filtered item is of right type");
	});

	QUnit.test("canReflect.new creates a new array with items", function(assert) {
		class Todos extends ObservableArray {}

		let todos = canReflect.new(Todos, [
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		assert.equal(todos.length, 2, "There are 2 items");
		assert.equal(todos[0].name, "walk the dog");
	});

	QUnit.test("forEach works", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos([
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		let expected = 2;
		let actual = 0;

		todos.forEach(() => {
			actual++;
		});

		assert.equal(actual, expected, "Looped over each item");
	});

	QUnit.test("for...in works", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos([
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		let props = [];
		for (let prop in todos) {
			props.push(prop);
		}

		assert.ok(props, "for...in should not throw");
	});

	QUnit.test("splice dispatches patches and length events", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos([
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		let expected = 2, actual = 0;

		canReflect.onPatches(todos, patches => {
			if(patches[0].type === "splice") {
				assert.ok(true, "splice patch called");
				actual++;
			}
		});

		canReflect.onKeyValue(todos, "length", () => {
			actual++;
		});

		todos.splice(0, 1);

		assert.equal(actual, expected, "Length and patches called");
	});

	QUnit.test("can.splice dispatches patches and length events", function(assert) {
		class Todos extends ObservableArray {}

		let todos = new Todos([
			{ name: "walk the dog" },
			{ name: "cook dinner", completed: true }
		]);

		let expected = 2, actual = 0;

		canReflect.onPatches(todos, patches => {
			if(patches[0].type === "splice") {
				assert.ok(true, "set patch called");
				actual++;
			}
		});

		canReflect.onKeyValue(todos, "length", () => {
			actual++;
		});

		canReflect.splice(todos, 0, 1);

		assert.equal(actual, expected, "Length and patches called");
	});

	QUnit.test("isListLike", function(assert) {
		let array = new ObservableArray(["one", "two"]);
		assert.equal(canReflect.isListLike(array), true, "it is list like");

		class Extended extends ObservableArray {
		}

		let extended = new Extended(["one", "two"]);
		assert.equal(canReflect.isListLike(extended), true, "It is list like");
	});

	QUnit.test("getOwnKeys", function(assert) {
		let empty = new ObservableArray();
		assert.deepEqual(canReflect.getOwnKeys(empty), []);

		let array = new ObservableArray([1, 2, 3]);
		assert.deepEqual(canReflect.getOwnKeys(array), ["0", "1", "2"]);

		class EnumerableComputed extends ObservableArray {
			static get props() {
				return {
					computed: {
						enumerable: true,
						default: "a computed property"
					}
				};
			}
		}
		let enumerable = new EnumerableComputed([1, 2, 3]);
		assert.deepEqual(
			canReflect.getOwnKeys(enumerable),
			["0", "1", "2", "computed"],
			"should include enumerables"
		);

		class Extended extends ObservableArray {
			static get props() {
				return {
					get computed() {
						return "a computed property";
					}
				};
			}
		}
		let extended = new Extended([1, 2, 3]);
		assert.deepEqual(
			canReflect.getOwnKeys(extended),
			["0", "1", "2", "computed"],
			"should include non-enumerables"
		);
	});

	QUnit.test("getOwnEnumerableKeys", function(assert) {
		let empty = new ObservableArray();
		assert.deepEqual(canReflect.getOwnEnumerableKeys(empty), []);

		let array = new ObservableArray([1, 2, 3]);
		assert.deepEqual(canReflect.getOwnEnumerableKeys(array), ["0", "1", "2"]);

		class Extended extends ObservableArray {
			static get props() {
				return {
					get computed() {
						return "a computed property";
					}
				};
			}
		}

		let extended = new Extended([1, 2, 3]);
		assert.deepEqual(
			canReflect.getOwnEnumerableKeys(extended),
			["0", "1", "2"],
			"should NOT include non-enumerables"
		);

		class EnumerableComputed extends ObservableArray {
			static get props() {
				return {
					computed: {
						enumerable: true,
						default: "a computed property"
					}
				};
			}
		}
		let enumerable = new EnumerableComputed([1, 2, 3]);
		assert.deepEqual(
			canReflect.getOwnEnumerableKeys(enumerable),
			["0", "1", "2", "computed"],
			"should NOT include non-enumerables"
		);
	});
	
	QUnit.test("push dispatches patches and length events", function(assert) {
		class Hobbies extends ObservableArray {}
		const hobbies = new Hobbies();

		let expected = 2, actual = 0;

		canReflect.onPatches(hobbies, patches => {
			if(patches[0].type === "splice") {
				assert.ok(true, "splice patches called");
				actual++;
			}
		});

		canReflect.onKeyValue(hobbies, "length", () => {
			actual++;
		});

		hobbies.push("cooking");

		assert.equal(actual, expected, "Length and patches called");
	});

	QUnit.test("can take undefined as a value with can.new", function(assert) {
		let array = canReflect.new(ObservableArray, undefined);
		assert.deepEqual(array, [], "no values, just like with DefineList");
	});

	QUnit.test("setting values dispatch the correct events", function(assert) {
		var testSteps = [
			{
				prop: 0,
				value: "hi",
				events: [
					{ type: 0, newVal: "hi", oldVal: undefined },
					{ type: "length", newVal: 1, oldVal: 0 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["hi"] }]
				]
			},
			{
				prop: 0,
				value: "hello",
				events: [
					{ type: 0, newVal: "hello", oldVal: "hi" },
					{ type: "length", newVal: 1, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 1, insert: ["hello"] }]
				]

			},
			{
				prop: 1,
				value: "there",
				events: [
					{ type: 1, newVal: "there", oldVal: undefined },
					{ type: "length", newVal: 2, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 1, deleteCount: 0, insert: ["there"] }]
				]

			},
		];

		const arr = new ObservableArray();

		let actualEvents, actualPatches;
		canReflect.onKeyValue(arr, 0, (newVal, oldVal) => {
			actualEvents.push({ type: 0, newVal, oldVal });
		});

		canReflect.onKeyValue(arr, 1, (newVal, oldVal) => {
			actualEvents.push({ type: 1, newVal, oldVal });
		});

		canReflect.onKeyValue(arr, "length", (newVal, oldVal) => {
			actualEvents.push({ type: "length", newVal, oldVal });
		});

		canReflect.onPatches(arr, (patches) => {
			actualPatches.push(patches);
		});

		testSteps.forEach((step) => {
			// reset everything
			actualEvents = [];
			actualPatches = [];

			// get the data for the step
			const { prop, value, events, patches } = step;

			// set the value from the step
			arr[prop] = value;

			// check that the correct events and patches were dispatched
			assert.deepEqual(actualEvents, events, `arr[${prop}] = "${value}" dispatched correct events`);
			assert.deepEqual(actualPatches, patches, `arr[${prop}] = "${value}" dispatched correct patches`);
		});
	});

	QUnit.test("array methods dispatch the correct events", function(assert) {
		var testSteps = [
			{
				method: "push",
				args: [ "hi" ],
				events: [
					{ type: 0, newVal: "hi", oldVal: undefined },
					{ type: "length", newVal: 1, oldVal: 0 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["hi"] }]
				]
			},
			{
				method: "push",
				args: [ "hi", "there" ],
				events: [
					{ type: 0, newVal: "hi", oldVal: undefined },
					{ type: 1, newVal: "there", oldVal: undefined },
					{ type: "length", newVal: 2, oldVal: 0 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["hi", "there"] }]
				]
			},
			{
				initialData: [ "there" ],
				method: "unshift",
				args: [ "hello" ],
				events: [
					{ type: 1, newVal: "there", oldVal: undefined },
					{ type: 0, newVal: "hello", oldVal: "there" },
					{ type: "length", newVal: 2, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["hello"] }],
				]
			},
			{
				initialData: [ "you" ],
				method: "unshift",
				args: [ "how", "are" ],
				events: [
					{ type: 2, newVal: "you", oldVal: undefined },
					{ type: 0, newVal: "how", oldVal: "you" },
					{ type: 1, newVal: "are", oldVal: undefined },
					{ type: "length", newVal: 3, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["how", "are"] }],
				]
			},
			{
				initialData: [ "hi", "there" ],
				method: "pop",
				args: [],
				events: [
					{ type: "length", newVal: 1, oldVal: 2 }
				],
				patches: [
					[{ type: "splice", index: 1, deleteCount: 1 }]
				]
			},
			{
				initialData: [ "hi", "there" ],
				method: "shift",
				args: [],
				events: [
					{ type: 0, newVal: "there", oldVal: "hi" },
					{ type: "length", newVal: 1, oldVal: 2 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 1 }]
				]
			},
			{
				initialData: [ "hi" ],
				method: "splice",
				args: [ 0, 1 ],
				events: [
					{ type: "length", newVal: 0, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 1, insert: [] }]
				]
			},
			{
				initialData: [ "there" ],
				method: "splice",
				args: [ 0, 0, "hi" ],
				events: [
					{ type: 1, newVal: "there", oldVal: undefined },
					{ type: 0, newVal: "hi", oldVal: "there" },
					{ type: "length", newVal: 2, oldVal: 1 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 0, insert: ["hi"] }],
				]
			},
			{
				initialData: [ "hi" ],
				method: "splice",
				args: [ 0, 1, "hello", "there" ],
				events: [
					{ type: 0, newVal: "hello", oldVal: "hi" },
					{ type: 1, newVal: "there", oldVal: undefined },
					{ type: "length", newVal: 2, oldVal: 1 },
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 1, insert: ["hello", "there"] }],
				]
			},
			{
				initialData: [ "fff", "xxx", "aaa" ],
				method: "sort",
				args: [],
				events: [
					{ type: 0, newVal: "aaa", oldVal: "fff" },
					{ type: 1, newVal: "fff", oldVal: "xxx" },
					{ type: 2, newVal: "xxx", oldVal: "aaa" },
					{ type: "length", newVal: 3, oldVal: 3 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 3, insert: ["aaa", "fff", "xxx"] }],
				]
			},
			{
				initialData: [ "fff", "xxx", "aaa" ],
				method: "reverse",
				args: [],
				events: [
					{ type: 0, newVal: "aaa", oldVal: "fff" },
					{ type: 2, newVal: "fff", oldVal: "aaa" },
					{ type: "length", newVal: 3, oldVal: 3 }
				],
				patches: [
					[{ type: "splice", index: 0, deleteCount: 3, insert: ["aaa", "xxx", "fff"] }],
				]
			}
		];

		class Arr extends ObservableArray {
			static get items() {
				return String;
			}
		}
		testSteps.forEach((step) => {
			// get the data for the step
			const { method, args, events, patches, initialData = [] } = step;

			const arr = new Arr(initialData);
			const actualEvents = [], actualPatches = [];

			[0, 1, 2, 3, 5, 6].forEach((index) => {
				canReflect.onKeyValue(arr, index, (newVal, oldVal) => {
					actualEvents.push({ type: index, newVal, oldVal });
				});
			});

			canReflect.onKeyValue(arr, "length", (newVal, oldVal) => {
				actualEvents.push({ type: "length", newVal, oldVal });
			});

			canReflect.onPatches(arr, (patches) => {
				actualPatches.push(patches);
			});

			// call the method from the step
			arr[method].apply(arr, args);

			// check that the correct events and patches were dispatched
			assert.deepEqual(actualEvents, events, `arr[${method}](${args.join(",")}) dispatched correct events`);
			assert.deepEqual(actualPatches, patches, `arr[${method}](${args.join(",")}) dispatched correct patches`);
		});
	});

	QUnit.test("new ObservableArray([items])", function(assert) {
		let array = new ObservableArray([1, 2]);
		assert.deepEqual(array, [1, 2], "Takes an array");
		array = new ObservableArray([1]);
		assert.deepEqual(array, [1], "Takes an array of 1 item");
	});

	QUnit.test("new ExtendedObservableArray(items)", function(assert) {
		let ExtendedArray = class extends ObservableArray {};
		let array = new ExtendedArray([1, 2]);
		assert.deepEqual(array, [1, 2], "Takes an array");
		array = new ExtendedArray([1]);
		assert.deepEqual(array, [1], "Takes an array of 1 item");
	});

	QUnit.test("new ObservableArray(num)", function(assert) {
		let array = new ObservableArray(10);
		assert.equal(array.length, 10, "10 items");
		assert.deepEqual(array, Array.from({ length: 10 }), "Is an item with 10 undefined slots");
	});

	QUnit.test("new ObservableArray(items, {props})", function(assert) {
		let array = new ObservableArray([], { foo: "bar" });
		assert.equal(array.foo, "bar", "Properties are set");
	});

	QUnit.test("new ExtendedObservableArray(items, {props})", function(assert) {
		class ExtendedObservableArray extends ObservableArray {
			static get props() {
				return {
					age: type.convert(Number)
				};
			}
		}
		let array = new ExtendedObservableArray([], { age: "13" });
		assert.equal(array.age, 13, "Converted works too");
	});

	QUnit.test("new ObservableArray(num, props)", function(assert) {
		let array = new ObservableArray(0, { foo: "bar" });
		assert.deepEqual(array, [], "Array of no items");
		assert.equal(array.foo, "bar", "props works");
	});

	QUnit.test("new ObservableArray(arg) throws if not an array or number", function(assert) {
		["string", /regexp/, {}, false].forEach(function(arg) {
			try {
				let arr = new ObservableArray(arg);
				assert.notOk(arr, "Unexpected argument" + arg);
			} catch(e) {
				assert.ok(true, "Threw, and it was supposed to");
			}

		});
	});

	QUnit.test("ObservableArray.convertsTo(Type) creates a converter type", function(assert) {
		let Type = class extends ObservableObject {};
		let type = ObservableArray.convertsTo(Type);

		let array = canReflect.convert([{ one: "one" }, { two: "two" }], type);

		assert.equal(array.length, 2);
		assert.ok(array[0] instanceof Type, "Each item is of the type");
	});

	QUnit.test("value, oldValue, action, key on event object", function(assert) {
		assert.expect(26);

		let Type = class extends ObservableArray {};
		let array1 = new Type();
		let array2 = new ObservableArray();

		for(let array of [array1, array2]) {
			array.listenTo("prop", (ev) => {
				assert.equal(ev.action, "add");
				assert.equal(ev.key, "prop");
				assert.equal(ev.value, "value");
			});

			array.prop = "value";

			let first = true;
			array.listenTo("0", (ev) => {
				if(first) {
					first = false;
					assert.equal(ev.key, "0");
					assert.equal(ev.value, "value1");
					assert.equal(ev.oldValue, undefined);
				} else {
					assert.equal(ev.key, "0");
					assert.equal(ev.value, "value2");
					assert.equal(ev.oldValue, "value1");
				}
			});

			array.listenTo("length", (ev) => {
				assert.ok("value" in ev);
				assert.ok("oldValue" in ev);
			});

			array.push("value1");
			array[0] = "value2";
		}
	});

	QUnit.test("Works with list likes", function(assert) {
		let list = { 0: "one", 1: "two", length: 2 };
		let array = new ObservableArray(list);
		assert.equal(array.length, 2, "two items");
		assert.equal(array[0], "one", "first item");
		assert.equal(array[1], "two", "second item");
	});

	QUnit.test("index events should be fired", function(assert) {
		const fallback = { name: "fallback" };

		const list = new ObservableArray([
			{ name: "first" },
			{ name: "second" }
		]);

		const first = new Observation(function() {
			return list[0] || fallback;
		});

		const second = new Observation(function() {
			return list[1] || fallback;
		});

		// bind the observations
		const noop = () => {};
		canReflect.onValue(first, noop);
		canReflect.onValue(second, noop);

		// check initial values
		assert.equal(canReflect.getValue(first).name, "first");
		assert.equal(canReflect.getValue(second).name, "second");

		// mutate the list
		list.shift();
		assert.equal(canReflect.getValue(first).name, "second");
		assert.equal(canReflect.getValue(second).name, "fallback");

		// mutate the list again
		list.shift();
		assert.equal(canReflect.getValue(first).name, "fallback");
		assert.equal(canReflect.getValue(second).name, "fallback");
	});

	QUnit.test("mutateMethods should return the base method value", function(assert) {
		const mutateMethods = {
			"push": {
				array: [1, 2, 3],
				args: [4],
				expected: 4 // the new length
			},
			"pop": {
				array: [1, 2, 3],
				args: [],
				expected: 3 // the removed element
			},
			"shift": {
				array: [1, 2, 3],
				args: [],
				expected: 1 // the removed element
			},
			"unshift": {
				array: [3, 2, 1],
				args: [4],
				expected: 4 // the new length
			},
			"splice": {
				array: [1, 3, 4],
				args: [1, 0, 2],
				expected: [], // the removed elements
			},
			"sort": {
				array: [4, 3, 2, 1],
				args: [],
				expected: [1, 2, 3, 4], // the sorted array
			},
			"reverse": {
				array: [4, 3, 2, 1],
				args: [],
				expected: [1, 2, 3, 4], // the reversed array
			}
		};

		Object.keys(mutateMethods).forEach(method => {
			const { array, args, expected } = mutateMethods[method];
			const observable = new ObservableArray(array);

			assert.deepEqual(
				observable[method](...args),
				expected,
				`${method} should return expected value`
			);
		});
	});

	QUnit.test("mutateMethods should dispatch patches with correct index/deleteCount when array is too short", function(assert) {
		const testSteps = [
			{ method: "splice", args: [ 0, 1 ] },
			{ method: "pop", args: [] },
			{ method: "shift", args: [] },
			{ method: "splice", args: [ 1, 4 ], initialData: [ 1, 2, 3, 4 ], deleteCount: 3 },
			{ method: "splice", args: [ 3, 4 ], initialData: [ 1, 2 ], index: 2 },
			{ method: "splice", args: [ -1, 4 ], initialData: [ 1, 2 ], index: 1, deleteCount: 1 },
			{ method: "splice", args: [ 1, -4 ], initialData: [ 1, 2 ], index: 1, deleteCount: 0 },
		];

		testSteps.forEach((step) => {
			const { method, args, initialData = [], deleteCount = 0 } = step;
			const index = step.index != null ? step.index : args[0] || 0;

			const arr = new ObservableArray(initialData);

			canReflect.onPatches(arr, (patches) => {
				patches.forEach((patch) => {
					assert.equal(
						patch.deleteCount,
						deleteCount,
						`calling ${method} returned correct deleteCount`
					);
					assert.equal(
						patch.index,
						index,
						`calling ${method} returned correct index`
					);
				});
			});

			arr[method].apply(arr, args);
		});
	});

	QUnit.test('Dispatch events for mutation with 0 integer value', function (assert) {
		assert.expect(2);
		const order = new ObservableArray([0, 1]);

		canReflect.onPatches(order, (patches) => {
			assert.equal(patches[0].index, 1);
			assert.equal(order[1], 0);
		});
		order[1] = 0;
	});

	QUnit.test('Dispatch events after swapping items that have 0 value', function (assert) {
		assert.expect(2);
		const order = new ObservableArray([0, 1]);

		const first = new Observation(function() {
			return order[0];
		});

		const second = new Observation(function() {
			return order[1];
		});

		canReflect.onValue(first, function () {
			assert.equal(1, order[0]);
		});

		canReflect.onValue(second, function () {
			assert.equal(0, order[1]);
		});

		const tmp = order[0];
		order[0] = order[1];
		order[1] = tmp;
	});

	QUnit.test('metaSymbol preventSideEffects should allow array mutation functions', function(assert) {
		assert.expect(2);
		const myList = new ObservableArray([0,1]);
		myList.push("I am going to hide some changes.");
		
		canReflect.onPatches(myList, function (patches) {
			assert.equal(patches[0].index, 1);
			assert.equal(patches[0].insert[0], 'Patched after push');
		});
		
		myList[1] = "Patched after push";
	});
};
