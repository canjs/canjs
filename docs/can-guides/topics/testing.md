@page guides/testing Testing
@parent guides/essentials 8
@outline 2

@description Learn how to test CanJS applications.

@body

> NOTE: This guide is a work in progress. New sections will be added as they are completed. Find an issue or have a topic you want covered? Add it to [the issue](https://github.com/canjs/canjs/issues/3862).

This guide will show how to set up and write tests for different pieces of CanJS applications. It will also show techniques that can be used to test things that would otherwise be difficult to test. Not all of these techniques will be needed for every application.

This guide does not focus on how to write applications in a maintainable, testable way. That is covered in the [guides/logic Logic Guide].

> NOTE: All of the examples in this guide use the [Mocha](https://mochajs.org/) test framework and [Chai](http://www.chaijs.com/) assertion library, but none of the examples are specific to Mocha/Chai and should work with any setup.

## ViewModels

ViewModels contain a majority of the logic in CanJS applications so it is very important that they are well-tested. Since CanJS ViewModels act mostly like normal JavaScript objects, testing them usually works just like working with normal objects &mdash; set a property (or call a function) then check the value of other properties. This setup is shown below, followed by a few techniques for making it easier to test more complex ViewModels.

### Basic setup

The basic setup for testing a ViewModel is:

1. Create an instance of the ViewModel
2. Test values of the ViewModel’s default values
3. Set ViewModel properties (or call ViewModel functions)
4. Test values of the ViewModel’s properties
5. Repeat 3 & 4

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	first: "string",
	last: "string",
	get name() {
		return `${this.first || ""} ${this.last || ""}`.trim();
	},
	setName(val) {
		const parts = val.split(" ");
		this.first = parts[0];
		this.last = parts[1];
	}
});

describe("ViewModel", () => {
	it("name", () => {
		// #1
		let vm = new ViewModel({ });

		// #2
		assert.equal(vm.name, "", "default `name` is correct");

		// #3
		vm.first = "Kevin"
		// #4
		assert.equal(vm.name, "Kevin", "setting `first` updates `name` correctly");

		// #3
		vm.last = "McCallister";
		// #4
		assert.equal(vm.name, "Kevin McCallister", "setting `first` updates `name` correctly");

		// #3
		vm.setName("Marv Merchants");
		// #4
		assert.equal(vm.first, "Marv", "`setName` updates `first` correctly");
		assert.equal(vm.last, "Merchants", "`setName` updates `last` correctly");
	});
});

// start Mocha
mocha.run();
</script>
```
@highlight 27-47,only
@codepen

### Asynchronous behavior

Asynchronous behavior is one of the toughest things to test in JavaScript. There are a few techniques that can be used to make it a little easier in CanJS applications.

The following example uses `listenTo` to capture the value whenever you type into the `<input>` element, but it only updates the value of the `text` property when nothing has been typed for 500ms:

@demo demos/testing/throttled-input.html
@codepen

The difficulty in testing this ViewModel is knowing when to run assertions. One approach to testing this code is:

* Set the `text` property
* Wait 500ms
* Test that the value of the `text` property is correct

This might work initially, but different browsers will not handle this 500ms delay in exactly the same way. Tests using `setTimeout` like this become very brittle and prone to break as browsers and test environments change. It is very frustrating to write a test and have it start failing six months down the road even though nothing in the code has changed.

This brittleness can be avoided by using an [https://canjs.com/doc/can-event-queue/map/map.addEventListener.html event listener] instead of `setTimeout`. Using this technique, the test approach is:

* Set the `text` property
* Wait for the `text` property to change
* Test that the value of the `text` property is correct

Since the event listener needs to be set up before the the property is changed, in practice this approach becomes:

* Create an event listener for when the `text` property changes
* Set the `text` property
* When the event listener is triggered, test that the value of the `text` property is correct

Here is how this is done for this example:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	text: {
		value({ listenTo, lastSet, resolve }) {
			let latest = "",
				timeoutId = null;

			listenTo(lastSet, (val) => {
				latest = val;
				timeoutId = clearTimeout(timeoutId);

				timeoutId = setTimeout(() => {
					resolve(latest);
				}, 500);
			});
		}
	}
});

describe("ViewModel", () => {
	it("text", (done) => {
		let vm = new ViewModel({ });

		vm.addEventListener("text", () => {
			assert.equal(vm.text, "Hi there!", "text updated correctly")
			done();
		});

		vm.text = "Hi there!";
	});
});

// start Mocha
mocha.run();
</script>
```
@highlight 32-39,only
@codepen

> NOTE: When using Mocha, [testing asynchronous code](https://mochajs.org/#asynchronous-code) is accomplished by calling the `done` callback to indicate the test is complete. Different testing frameworks might have slightly different solutions.

### Properties derived from asynchronous behavior

It is often useful to use an [can-define.types.get#Asynchronousvirtualproperties asynchronous getter] to load data from a model or serivce layer. It can be difficult to test this without also testing the model. The getter code might look something like this:

```js
ViewModel: {
	todoCount: {
		get(lastSet, resolve) {
			todoConnection
				.getList({ })
				.then((response) => {
					resolve(response.metadata.count);
				});
		}
	}
}
```

The primary logic in this code is responsible for reading the `metadata.count` property from the service layer response and setting it as the `todoCount` property on the ViewModel. The way this code is written makes it very difficult to test this logic.

In order to make it easier, first __split__ this getter into two properties:

* the promise returned by the Model
* the count property itself

```js
ViewModel: {
	todoCountPromise: {
		get() {
			return todoConnection.getList({ });
		}
	},

	todoCount: {
		get(lastSet, resolve) {
			this.todoCountPromise.then((response) => {
				resolve(response.metadata.count);
			});
		}
	}
}
```

Next, make it possible to override the `todoCountPromise` property by utilizing [can-define.types.get#Propertiesvaluesthatchangewiththeirinternalsetvalue lastSet]:

```js
ViewModel: {
	todoCountPromise: {
		get(lastSet) {
			if (lastSet) {
				return lastSet;
			}

			return todoConnection.getList({ });
		}
	},

	todoCount: {
		get(lastSet, resolve) {
			this.todoCountPromise.then((response) => {
				resolve(response.metadata.count);
			});
		}
	}
}
```
@highlight 4-6

Now this can be tested by setting the default value of `todoCountPromise` to a promise that [resolves](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) with test data:

```js
let vm = new ViewModel({
	todoCountPromise: Promise.resolve(todoResponse)
});
```

Since this is a default value, the actual model’s `getList` method will never be called. The `todoCount` property can then be tested like any other [guides/testing#Testingasynchronousbehavior asynchronous behavior].

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	todoCountPromise: {
		get(lastSet) {
			if (lastSet) {
				return lastSet;
			}

			return todoConnection.getList({ });
		}
	},

	todoCount: {
		get(lastSet, resolve) {
			this.todoCountPromise.then((response) => {
				resolve(response.metadata.count);
			});
		}
	}
});

describe("ViewModel", () => {
	it("todoCount", (done) => {
		let todoResponse = {
			metadata: {	count: 150 },
			data: []
		};

		let vm = new ViewModel({
			todoCountPromise: Promise.resolve(todoResponse)
		});

		vm.addEventListener("todoCount", () => {
			assert.equal(vm.todoCount, 150, "`todoCount` === 150");
			done();
		});
	});
});

// start Mocha
mocha.run();
</script>
```
@codepen
@highlight 34-46,only

It is also possible to test this synchronously by setting `todoCountPromise` to a normal object that [has the same methods](https://en.wikipedia.org/wiki/Duck_typing) as a promise, but "resolves" synchronously. This might look like:


```js
let testTodoCountPromise = {
	then(resolve) {
		resolve(todoResponse);
	}
};

let vm = new ViewModel({
	todoCountPromise: testTodoCountPromise
});
```

With this approach, the assertions can be made outside of the `addEventListener` callback and there is no need to call `done()` since this test is now synchronous.

> NOTE: Even with this approach, `addEventListener` still needs to be called; without this, CanJS will not provide the `resolve` function to the asynchronous getter. This is done to prevent memory leaks.

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	todoCountPromise: {
		get(lastSet) {
			if (lastSet) {
				return lastSet;
			}

			return todoConnection.getList({ });
		}
	},

	todoCount: {
		get(lastSet, resolve) {
			this.todoCountPromise.then((response) => {
				resolve(response.metadata.count);
			});
		}
	}
});

describe("ViewModel", () => {
	it("todoCount", () => {
		let todoResponse = {
			metadata: {	count: 150 },
			data: []
		};

		let testTodoCountPromise = {
			then(resolve) {
				resolve(todoResponse);
			}
		};

		let vm = new ViewModel({
			todoCountPromise: testTodoCountPromise
		});

		vm.addEventListener("todoCount", () => {});

		assert.equal(vm.todoCount, 150, "`todoCount` === 150");
	});
});

// start Mocha
mocha.run();
</script>
```
@codepen
@highlight 39-51,only

### Properties derived from models (or any imported module)

The [guides/testing#Propertiesderivedfromasynchronousbehavior previous example] shows how to test logic that is dependent on a promise returned by a [guides/data#Retrievingalistofrecords getList] call. That example did not show how to test that the Model is used correctly.

Specifically, we did not test:

* `todoCountPromise` calls `todoConnection.getList`
* `todoCountPromise` is the return value of `todoConnection.getList`

```js
import todoConnection from "models/todo";

let ViewModel = DefineMap.extend({
	todoCountPromise: {
		get(lastSet) {
			return todoConnection.getList({ });
		}
	}
});
```
@highlight 5-7

This could be tested using [can-fixture], but doing this would also test any logic in the `todoConnection` itself. A unit test of the ViewModel should just test the code in the ViewModel; testing the model should be handled by tests specifically created to test the model and/or in integration tests. Both of these will be discussed later in the guide.

To test the `todoCountPromise`, you can store the `todoConnection` as a property on the ViewModel and then use `this.todoConnection` instead of the `todoConnection` that was imported:

```js
import todoConnection from "models/todo";

let ViewModel = DefineMap.extend({
	todoConnection: {
		default() {
			return todoConnection;
		}
	},
	todoCountPromise: {
		get(lastSet) {
			return this.todoConnection.getList({ });
		}
	}
});
```
@highlight 4-8,11

Using this technique allows you to set a new value of `todoConnection` by passing it as a default value to the ViewModel constructor. You can then test that the `getList` function was called (as well as test the arguments passed to it) and also test that the getter returned the correct value.

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	todoConnection: {
		default() {
			return todoConnection;
		}
	},
	completeFilter: { type: "boolean" },
	todoCountPromise: {
		get() {
			let req = {};
			let complete = this.completeFilter;

			if (complete != null) {
				req.complete = complete;
			}

			return this.todoConnection.getList(req);
		}
	}
});

describe("ViewModel", () => {
	it("todoCountPromise", () => {
		let testPromise = new Promise((res, rej) => {});
		let getListOptions = null;

		let testTodoConnection = {
			getList(options) {
				getListOptions = options;
				return testPromise;
			}
		};

		let vm = new ViewModel({
			todoConnection: testTodoConnection
		});

		vm.addEventListener("todoCountPromise", () => {});

		assert.equal(vm.todoCountPromise, testPromise, "todoCountPromise is the promise returned by getList");

		vm.completeFilter = true;
		assert.equal(getListOptions.complete, true, "completeFilter: true is passed to getList")

		vm.completeFilter = false;
		assert.equal(getListOptions.complete, false, "completeFilter: false is passed to getList")
	});
});

// start Mocha
mocha.run();
</script>
```
@codepen
@highlight 13-17,28,38-43,46,51-57,only

This technique is useful for testing code using models, but it can be used to test any code that uses a function or property _exported directly_ from another module.
