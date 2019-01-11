@page guides/testing Testing
@parent guides/essentials 8
@outline 2

@description Learn how to test CanJS applications.

@body

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

describe("NameForm ViewModel", () => {
	it("name", () => {
		// 1. Create an instance of the ViewModel
		let vm = new ViewModel({ });

		// 2. Test values of the ViewModel’s default values
		assert.equal(vm.name, "", "default `name` is correct");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.first = "Kevin"
		// 4. Test values of the ViewModel’s properties
		assert.equal(vm.name, "Kevin", "setting `first` updates `name` correctly");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.last = "McCallister";
		// 4. Test values of the ViewModel’s properties
		assert.equal(vm.name, "Kevin McCallister", "setting `first` updates `name` correctly");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.setName("Marv Merchants");
		// 4. Test values of the ViewModel’s properties
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

This brittleness can be avoided by using an [https://canjs.com/doc/can-event-queue/map/map.listenTo.html event listener] instead of `setTimeout`. Using this technique, the test approach is:

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

describe("ThrottledText ViewModel", () => {
	it("text", (done) => {
		let vm = new ViewModel({ });

		vm.listenTo("text", () => {
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

describe("Todos ViewModel", () => {
	it("todoCount", (done) => {
		let todoResponse = {
			metadata: {	count: 150 },
			data: []
		};

		let vm = new ViewModel({
			todoCountPromise: Promise.resolve(todoResponse)
		});

		vm.listenTo("todoCount", () => {
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

With this approach, the assertions can be made outside of the `listenTo` callback and there is no need to call `done()` since this test is now synchronous.

> NOTE: Even with this approach, `listenTo` still needs to be called; without this, CanJS will not provide the `resolve` function to the asynchronous getter. This is done to prevent memory leaks.

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

describe("Todos ViewModel", () => {
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

		vm.listenTo("todoCount", () => {});

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

describe("Todos ViewModel", () => {
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

		vm.listenTo("todoCountPromise", () => {});

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

## Components

Components are the glue that holds CanJS applications together &mdash; connecting observable ViewModels to the DOM, handling events triggered by user interaction, interfacing with third-party libraries, and many other things.

There are different challenges to testing each of these responsibilities. These are discussed in the sections below.

### ViewModel

All of the techniques described in [guides/testing#ViewModels Testing ViewModels] can be used for testing a Component’s ViewModel by creating an instance of the Component constructor’s `ViewModel` property:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const NameForm = Component.extend({
  tag: "name-form",

  ViewModel: {
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
  },

  view: `
    <div>
      <label>
        First: <input value:bind="first">
      </label>
      <label>
        Last: <input value:bind="last">
      </label>

      <p>
        <button on:click="setName('Kevin McCallister')">Pick Random Name</button>
      </p>

      <p>Name: {{ name }}</p>
    </div>
  `
});

describe("NameForm Component ViewModel", () => {
	it("name", () => {
		// 1. Create an instance of the ViewModel
		let vm = new NameForm.ViewModel({ });

		// 2. Test values of the ViewModel’s default values
		assert.equal(vm.name, "", "default `name` is correct");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.first = "Kevin"
		// 4. Test values of the ViewModel’s properties
		assert.equal(vm.name, "Kevin", "setting `first` updates `name` correctly");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.last = "McCallister";
		// 4. Test values of the ViewModel’s properties
		assert.equal(vm.name, "Kevin McCallister", "setting `first` updates `name` correctly");

		// 3. Set ViewModel properties (or call ViewModel functions)
		vm.setName("Marv Merchants");
		// 4. Test values of the ViewModel’s properties
		assert.equal(vm.first, "Marv", "`setName` updates `first` correctly");
		assert.equal(vm.last, "Merchants", "`setName` updates `last` correctly");
	});
});

// start Mocha
mocha.run();
</script>
```
@highlight 12,15-26,44,49,only
@codepen

### DOM Events

DOM events handled through [can-stache-bindings], like `value:bind="first"`, can be tested through the viewModel directly as shown in [guides/testing#Basicsetup Testing ViewModels]. However, they can also be tested by:

1. Creating an instance of the Component
2. Finding the event target through the Component’s `element` property
3. Using [can-dom-events.dispatch domEvents.dispatch] to dispatch the event

> NOTE: Tests like this will work even if the component is not in the document.

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, domEvents } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const NameForm = Component.extend({
  tag: "name-form",

  ViewModel: {
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
  },

  view: `
    <div>
      <label>
        First: <input class="first" value:bind="first">
      </label>
      <label>
        Last: <input class="last" value:bind="last">
      </label>

      <p>
        <button on:click="setName('Kevin McCallister')">Pick Random Name</button>
      </p>

      <p>Name: {{ name }}</p>
    </div>
  `
});

describe("NameForm Component Events", () => {
    it("first name updated when user types in <input>", () => {
      // 1. Creating an instance of the Component
      const nameForm = new NameForm();

      // 2. Finding the event target through the Component’s `element` property
      const input = nameForm.element.querySelector("input.first");

      // 3. Using domEvents.dispatch to dispatch the event
      input.value = "Marv";
      domEvents.dispatch(input, "change"); // bindings are updated on "change" by default

      assert.equal(nameForm.viewModel.first, "Marv", "first set correctly");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 47-59,only
@codepen

This strategy can also be used to test events using `listenTo` in a [can-define.types.value] behavior (or a Map’s [can-event-queue/map/map.listenTo] method):

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, domEvents } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const Modal = Component.extend({
  tag: "my-modal",

  ViewModel: {
    showing: {
      value({ listenTo, lastSet, resolve }) {
        listenTo(lastSet, resolve);

        listenTo(window, "click", () => {
          resolve(false);
        });
      }
    }
  },

  view: `
    {{# if(showing) }}
      <div class="modal">
        This is the modal
      </div>
    {{/ if }}
  `
});

describe("MyModal Component Events", () => {
    it("clicking on the window should close the modal", () => {
      const modal = new Modal();

      modal.viewModel.showing = true;

      domEvents.dispatch(window, "click");

      assert.equal(modal.viewModel.showing, false, "modal hidden when user clicks on the window");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 20-22,37-45,only
@codepen

Another place you might use `listenTo` is in the `connectedCallback`. The same testing procedure can be used in this scenario, but you need to make sure the `connectedCallback` is called, which is discussed in the next section.

### connectedCallback

The [can-component/connectedCallback] is a good place to put code that is expected to run once a component is in the document. To test this code, obviously the `connectedCallback` needs to be called. One way to do this is to call it manually, passing the component instance’s `element` property:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

function DatePicker(el) {
  this.el = el;
  el.classList.add("date-picker");
};

DatePicker.prototype.teardown = function() {
  this.el.classList.remove("date-picker");
};

const DateRange = Component.extend({
  tag: "date-range",

  ViewModel: {
    connectedCallback(el) {
      const startDate = new DatePicker( el.querySelector(".start-date") );

      return () => {
        startDate.teardown();
      };
    }
  },

  view: `
    <p class="start-date">This is the Date Picker</p>
  `
});

describe("DateRange Component connectedCallback", () => {
  it("should set up DatePicker", () => {
    const dateRange = new DateRange();

    dateRange.viewModel.connectedCallback(dateRange.element);

    const startDate = dateRange.element.querySelector(".start-date");

    assert.ok(
      startDate.classList.contains("date-picker"),
      "start date DatePicker set up"
    );
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 43,only
@codepen

If the code relies on the element actually being in the document, things get a little more complicated.

You can add the element to the page using [appendChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) like this:

```js
document.body.appendChild(dateRange.element);
```

> NOTE: Some test frameworks like [QUnit](https://qunitjs.com/cookbook/#keeping-tests-atomic) have special test areas that you insert elements into for your tests.
>These are automatically cleaned up after each test, so you do not have to worry about a test causing problems for other tests.
>If the framework you’re using doesn’t have this, make sure to clean up after the test yourself.

This code works, but if you run the assertion immediately after calling `appendChild`, the test will fail:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

function DatePicker(el) {
  this.el = el;
  el.classList.add("date-picker");
};

DatePicker.prototype.teardown = function() {
  this.el.classList.remove("date-picker");
};

const DateRange = Component.extend({
  tag: "date-range",

  ViewModel: {
    connectedCallback(el) {
      const startDate = new DatePicker( el.querySelector(".start-date") );

      return () => {
        startDate.teardown();
      };
    }
  },

  view: `
    <p class="start-date">This is the Date Picker</p>
  `
});

describe("DateRange Component connectedCallback", () => {
  it("should set up DatePicker", () => {
    const dateRange = new DateRange();

    document.body.appendChild(dateRange.element);

    const startDate = dateRange.element.querySelector(".start-date");

    assert.ok(
      startDate.classList.contains("date-picker"),
      "start date DatePicker set up"
    );

	// clean up element
	document.body.removeChild(
	  document.querySelector("date-range")
	);
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 43-50,only
@codepen

The problem here is that a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) is used to listen for elements being added to the document. `MutationObserver`s are asynchronous, so the `connectedCallback` is not called immediately when the element is inserted.

To get around this issue [can-dom-mutate.onNodeInsertion] can be used to know when the element has been inserted and the `connectedCallback` has been called. Using this technique, the process becomes:

1. Create an `onNodeInsertion` listener
2. Insert the element

Once the `onNodeInsertion` callback is called:

3. Run assertions
4. Clean up the element
5. Clean up the `onNodeInsertion` listener
6. Mark the asynchronous test as complete

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, domMutate } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

function DatePicker(el) {
  this.el = el;
  el.classList.add("date-picker");
};

DatePicker.prototype.teardown = function() {
  this.el.classList.remove("date-picker");
};

const DateRange = Component.extend({
  tag: "date-range",

  ViewModel: {
    connectedCallback(el) {
      const startDate = new DatePicker( el.querySelector(".start-date") );

      return () => {
        startDate.teardown();
      };
    }
  },

  view: `
    <p class="start-date">This is the Date Picker</p>
  `
});

describe("DateRange Component connectedCallback", () => {
  it("should set up DatePicker", (done) => {
    const dateRange = new DateRange();

	// 1. Create an `onNodeInsertion` listener
    const offNodeInsertion = domMutate.onNodeInsertion(dateRange.element, () => {
      const startDate = dateRange.element.querySelector(".start-date");

	  // 3. Run assertions
      assert.ok(
        startDate.classList.contains("date-picker"),
        "start date DatePicker set up"
      );

	  // 4. Clean up the element
      document.body.removeChild(dateRange.element);

	  // 5. Clean up the `onNodeInsertion` listener
      offNodeInsertion();

	  // 6. Mark the asynchronous test as complete
      done();
    });

	// 2. Insert the element
    document.body.appendChild(dateRange.element);
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 43-64,only
@codepen

Obviously this is much more complicated than just calling the `connectedCallback` manually, so only use this process if absolutely necessary.

## Routing

Routing in CanJS applications has three primary responsibilities:

1. Connecting a component’s view-model to can-route
2. Displaying the right component based on the route
3. Passing data to the displayed component’s view-model

Separating these into three separate properties on the ViewModel means that they can each be tested independently. This will be shown in the following sections.

### Route data

CanJS’s router uses the observable key-value object [can-route.data can-route.data] to bind the URL to a Component’s ViewModel. To make this observable available to the ViewModel, you can make a property on the ViewModel that returns `route.data` its [can-define.types.default default value]:

```js
ViewModel: {
	routeData: {
		default() {
			return route.data;
		}
	}
}
```

Most applications also set up [guides/routing#Registerroutes "pretty" routes] by calling [can-route.register route.register]. This can also be done in the default value definition before calling [can-route.start]:

```js
ViewModel: {
	routeData: {
		default() {
			route.register("{page}", { page: "home" });
			route.register("list/{id}", { page: "list" });
			route.start();
			return route.data;
		}
	}
}
```

Testing this can be difficult because changes to `routeData` will also cause changes to the URL. This can cause big problems; if the URL suddenly changes to `/list/5` in the middle of running tests, the test page is no longer going to be functional. To avoid this, CanJS provides [can-route-mock RouteMock] so that you can interact with `route.data` without actually changing the URL.

To use `RouteMock`, set [can-route.urlData] to an instance of `RouteMock`. Now you can make changes to the `value` of the `RouteMock` instance to simulate changes to the URL and then verify that the ViewModel’s `routeData` property updates correctly:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, route, RouteMock } from "can/everything";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;


const Application = Component.extend({
    tag: "app-component",

    ViewModel: {
		routeData: {
			default() {
				route.register("{page}", { page: "home" });
				route.register("list/{id}", { page: "list" });
				route.start();
				return route.data;
			}
        }
    },

    view: `
		{{ pageComponent }}
	`
});

describe("Application", () => {
    it("routeData updates when URL changes", () => {
        const routeMock = new RouteMock();
        route.urlData = routeMock;

        const vm = new Application.ViewModel();

        assert.equal(vm.routeData.page, "home", "`page` defaults to 'home'");

        routeMock.value = "#!list/5";

        assert.equal(vm.routeData.page, "list", "#!list/5 sets `page` to 'list'");
        assert.equal(vm.routeData.id, 5, "#!list/5 sets `id` to 5");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 17-24,33-45,only
@codepen

You can also make changes to the `routeData` and check that the URL is updated correctly by verifying the `value` of the `RouteMock` instance. In CanJS, the URL is changed asynchronously, so you will need to use an asynchronous test that uses `routeMock.on` to determine when to run assertions:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, route, RouteMock } from "can/everything";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;


const Application = Component.extend({
    tag: "app-component",

    ViewModel: {
		routeData: {
			default() {
				route.register("{page}", { page: "home" });
				route.register("list/{id}", { page: "list" });
				route.start();
				return route.data;
			}
        }
    },

    view: `
		{{ pageComponent }}
	`
});

describe("Application", () => {
    it("routeData updates when URL changes", () => {
        const routeMock = new RouteMock();
        route.urlData = routeMock;

        const vm = new Application.ViewModel();

        assert.equal(vm.routeData.page, "home", "`page` defaults to 'home'");

        routeMock.value = "#!list/5";

        assert.equal(vm.routeData.page, "list", "#!list/5 sets `page` to 'list'");
        assert.equal(vm.routeData.id, 5, "#!list/5 sets `id` to 5");
    });

    it("URL updates when routeData changes", (done) => {
        const routeMock = new RouteMock();
        route.urlData = routeMock;
        const vm = new Application.ViewModel();

		assert.equal(routeMock.value, "");

		routeMock.on(() => {
			assert.equal(routeMock.value, "list/10");
			done();
		});

        vm.routeData.update({
			page: "list",
			id: 10
		});
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 47-64,only
@codepen

### Route component

Testing that the correct component is displayed based on the `routeData` can be done completely independently from `can-route` when `routeData` is defined as a [can-define.types.default default value] as shown above.

The component can be defined using a [can-define.types.get getter] that reads `routeData` and creates an instance of the correct type of component:

```js
get pageComponent() {
	if (this.routeData.page === "home") {
		return new HomePage();
	} else if (this.routeData.page === "list") {
		return new ListPage();
	}
}
```

In order to test this, create an observable and pass it to the ViewModel constructor as the `routeData` property:

```js
const routeData = new DefineMap({
	page: "home",
	id: null
});

const vm = new Application.ViewModel({
	routeData: routeData
});
```

This will override what is set up in the `default() {}` and allow you to make changes to the `routeData` object and verify that the correct type of component is created:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, route, DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const HomePage = Component.extend({
	tag: "home-page",

	view: `
		<h2>Home Page</h2>
	`,

	ViewModel: {}
});

const ListPage = Component.extend({
	tag: "list-page",

	view: `
		<h2>List Page</h2>
	`,

	ViewModel: {}
});

const Application = Component.extend({
    tag: "app-component",

    ViewModel: {
		routeData: {
			default() {
				route.register("{page}", { page: "home" });
				route.register("list/{id}", { page: "list" });
				route.start();
				return route.data;
			}
        },

        get pageComponent() {
			if (this.routeData.page === "home") {
				return new HomePage();
			} else if (this.routeData.page === "list") {
				return new ListPage();
			}
		}
    },

    view: `
		{{ pageComponent }}
	`
});

describe("Application", () => {
    it("pageComponent", () => {
        const routeData = new DefineMap({
            page: "home",
            id: null
        });

        const vm = new Application.ViewModel({
            routeData: routeData
		});

        assert.ok(vm.pageComponent instanceof HomePage, "ListPage shown when routeData.page === 'home'");

		routeData.page = "list";

		assert.ok(vm.pageComponent instanceof ListPage, "ListPage shown when routeData.page === 'list'");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 60-75,only
@codepen

### Route component viewModel

Data that needs to be passed to the component being displayed can also be tested independently if it is created as a separate property on the ViewModel that is derived from the `routeData` property:

```js
get pageComponentViewModel() {
	const vmData = {};

	if (this.routeData.page === "list") {
		vmData.id = value.bind(this.routeData, "id");
	}

	return vmData;
}
```

With the viewModel data set up like this, you can make changes to `routeData` and confirm that the child component will get the correct values by verifying the `value` of the observable passed through the `pageComponentViewModel`:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, route, value, DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const HomePage = Component.extend({
	tag: "home-page",

	view: `
		<h2>Home Page</h2>
	`,

	ViewModel: {}
});

const ListPage = Component.extend({
	tag: "list-page",

	view: `
		<h2>List Page</h2>
		<p>{{ id }}</p>
	`,

	ViewModel: {
		id: "number"
	}
});

const Application = Component.extend({
    tag: "app-component",

    ViewModel: {
		routeData: {
			default() {
				route.register("{page}", { page: "home" });
				route.register("list/{id}", { page: "list" });
				route.start();
				return route.data;
			}
        },

        get pageComponentViewModel() {
			const vmData = {};

			if (this.routeData.page === "list") {
				vmData.id = value.bind(this.routeData, "id");
			}

			return vmData;
		},

        get pageComponent() {
			if (this.routeData.page === "home") {
				return new HomePage();
			} else if (this.routeData.page === "list") {
				return new ListPage({
					viewModel: this.pageComponentViewModel
				});
			}
		}
    },

    view: `
		{{ pageComponent }}
	`
});

describe("Application", () => {
    it("pageComponent viewModel", () => {
        const routeData = new DefineMap({
            page: "home",
            id: null
        });

        const vm = new Application.ViewModel({
            routeData: routeData
		});

		assert.deepEqual(vm.pageComponentViewModel, {}, "viewModelData defaults to empty object");

		routeData.update({
			page: "list",
			id: 10
		});

		const viewModelId = vm.pageComponentViewModel.id;
		assert.equal(viewModelId.value, 10, "routeData.id is passed to pageComponent viewModel");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 87-93,only
@codepen

You can also set the `value` of the properties of `pageComponentViewModel` and verify that the `routeData` is updated correctly:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { Component, route, value, DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const HomePage = Component.extend({
	tag: "home-page",

	view: `
		<h2>Home Page</h2>
	`,

	ViewModel: {}
});

const ListPage = Component.extend({
	tag: "list-page",

	view: `
		<h2>List Page</h2>
		<p>{{ id }}</p>
	`,

	ViewModel: {
		id: "number"
	}
});

const Application = Component.extend({
    tag: "app-component",

    ViewModel: {
		routeData: {
			default() {
				route.register("{page}", { page: "home" });
				route.register("list/{id}", { page: "list" });
				route.start();
				return route.data;
			}
        },

        get pageComponentViewModel() {
			const vmData = {};

			if (this.routeData.page === "list") {
				vmData.id = value.bind(this.routeData, "id");
			}

			return vmData;
		},

        get pageComponent() {
			if (this.routeData.page === "home") {
				return new HomePage();
			} else if (this.routeData.page === "list") {
				return new ListPage({
					viewModel: this.pageComponentViewModel
				});
			}
		}
    },

    view: `
		{{ pageComponent }}
	`
});

describe("Application", () => {
    it("pageComponent viewModel", () => {
        const routeData = new DefineMap({
            page: "home",
            id: null
        });

        const vm = new Application.ViewModel({
            routeData: routeData
		});

		assert.deepEqual(vm.pageComponentViewModel, {}, "viewModelData defaults to empty object");

		routeData.update({
			page: "list",
			id: 10
		});

		const viewModelId = vm.pageComponentViewModel.id;
		assert.equal(viewModelId.value, 10, "routeData.id is passed to pageComponent viewModel");

		routeData.id = 20;

		assert.equal(viewModelId.value, 20, "setting routeData.id updates the pageComponentViewModel.id");

		viewModelId.value = 30;
		assert.equal(routeData.id, 30, "setting pageComponentViewModel.id updates routeData.id");
    });
});

// start Mocha
mocha.run();
</script>
```
@highlight 97-100,only
@codepen

## Models

CanJS models like [can-rest-model] and [can-realtime-rest-model] allow you to connect an observable to a service layer. They also provide caching and real-time behavior using [can-query-logic]. The following sections will show how to test that these models are set up correctly to work with the application’s service layer.

### Connections

CanJS models work as mixins to add methods like [can-connect/can/map/map.get] and [can-connect/can/map/map.getList] to CanJS observables. You can use [can-fixture] to test these methods without making real requests to your service layer; `can-fixture` will intercept the [request](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) made by the connection and simulate a response using the data given by the fixture.

A basic test setup using this approach looks like:

1. Create sample data
2. Create a fixture to return sample data for a specific URL
3. Call model function to request data from that URL
4. Verify the model returned the sample data

Here is an example:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { restModel, DefineMap, DefineList, fixture } from "//unpkg.com/can@5/core.mjs";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const Todo = DefineMap.extend({
  id: "number",
  complete: "boolean",
  name: "string"
});

Todo.List = DefineList.extend({
  "#": Todo
});

Todo.connection = restModel({
  Map: Todo,
  List: Todo.List,
  url: "/api/todos/{id}"
});

describe("TodoModel", () => {
  it("getList", (done) => {
    // 1. Create sample data
    const todos = [
      { id: 1, complete: false, name: "do dishes" }
    ];

    // 2. Create a fixture to return sample data for a specific URL
    fixture( { url: "/api/todos" }, todos);

    // 3. Call model function to request data from that URL
    Todo.getList().then(todosList => {
      // 4. Verify the model returned the sample data
      assert.deepEqual(todosList.serialize(), todos);
      done();
    });
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 30-43,only
@codepen

### QueryLogic

CanJS model mixins internally use [can-query-logic] to perform queries of your service layer data and compare different queries against each other. It uses the logic of these queries to understand how to cache data and provide real-time behavior.

It can be useful to test this logic to ensure that it will work correctly when used for these other behaviors. It is also very useful to add tests like this when you run into an issue with your model not working as expected.

One useful way to do this is to use [can-query-logic.prototype.filterMembers] to verify that a specific query will correctly filter an array of data:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { restModel, DefineMap, DefineList, QueryLogic } from "//unpkg.com/can@5/core.mjs";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const Todo = DefineMap.extend({
  id: "number",
  complete: "boolean",
  name: "string"
});

Todo.List = DefineList.extend({
  "#": Todo
});

Todo.connection = restModel({
  Map: Todo,
  List: Todo.List,
  url: "/api/todos/{id}"
});

describe("TodoModel query logic", () => {
  it("filterMembers", () => {
     var todoQueryLogic = new QueryLogic(Todo);

    const completeTodos = [
      { id: 2, name: "mow lawn", complete: true }
    ];

    const incompleteTodos = [
      { id: 1, name: "do dishes", complete: false }
    ];

	const allTodos = [ ...completeTodos, ...incompleteTodos ];

	const completeTodosFilter = { filter: { complete: false } };

    const queryLogicIncompleteTodos = todoQueryLogic.filterMembers(
      completeTodosFilter,
      allTodos
    );

    assert.deepEqual(queryLogicIncompleteTodos, incompleteTodos);
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 30-49,only
@codepen

It can also be useful to use [can-query-logic.prototype.isMember] to verify that a specific record is contained within the results of a query:

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { restModel, DefineMap, DefineList, QueryLogic } from "//unpkg.com/can@5/core.mjs";

// Mocha / Chai Setup
mocha.setup("bdd")
var assert = chai.assert;

const Todo = DefineMap.extend({
  id: "number",
  complete: "boolean",
  name: "string"
});

Todo.List = DefineList.extend({
  "#": Todo
});

Todo.connection = restModel({
  Map: Todo,
  List: Todo.List,
  url: "/api/todos/{id}"
});

describe("TodoModel query logic", () => {
  it("isMember", () => {
     var todoQueryLogic = new QueryLogic(Todo);

	const completeTodosFilter = { filter: { complete: false } };

    const becomingAnAstronautIsIncomplete = todoQueryLogic.isMember(
      completeTodosFilter,
      { id: 5, name: "become an astronaut", complete: false }
    );

    assert.ok(becomingAnAstronautIsIncomplete);
  });
});

// start Mocha
mocha.run();
</script>
```
@highlight 30-39,only
@codepen

## Integration Testing

Integration testing is designed to test multiple units of an application to make sure they work together.

There are a few things that make writing and maintaining integration tests more costly than unit tests:

* Functional tests usually take longer to write because they require an understanding of a larger portion of the application
* Functional tests take longer to _run_ because of the time it takes to render and interact with the DOM
* Functional tests often need to be updated when the structure of an application’s HTML and CSS changes

For these reasons, you may not want to write integration tests for every feature of an application. That being said, integration tests of an application’s **most important functionality** are very valuable. Also, for applications with no tests at all, adding integration tests **before making big changes** (like large upgrades, etc) can make it much easier to verify that the app is still functioning after the changes are in place.

No matter the purpose of the integration test, they generally follow the same pattern:

1. Render an application
2. Verify that the application rendered correctly
3. Simulate user interaction
4. Verify that the application responds correctly
5. Clean up

> NOTE: The test below is written using [funcunit](https://funcunit.com/) but it would also work with [cypress.io](https://www.cypress.io/), [dom-testing-library](https://www.npmjs.com/package/dom-testing-library), or whatever integration testing setup you prefer.

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script src="//unpkg.com/jquery@3/dist/jquery.js"></script>
<script src="//unpkg.com/funcunit@3/dist/funcunit.js"></script>
<script type="module">
import { DefineMap, DefineList, Component, route, fixture, realtimeRestModel, domEvents, enterEvent } from "//unpkg.com/can@5/ecosystem.mjs";

// Mocha / Chai / Funcunit Setup
mocha.setup("bdd")
var assert = chai.assert;

domEvents.addEvent(enterEvent);

const Todo = DefineMap.extend("Todo", {
  id: { type: "number", identity: true },
  name: "string",
  complete: { type: "boolean", default: false }
});

const todoStore = fixture.store([
  { name: "Learn CanJS", complete: true, id: 7 },
  { name: "Write tests", complete: false, id: 8 }
], Todo);

fixture("/api/todos", todoStore);
fixture.delay = 500;

Todo.List = DefineList.extend({
  "#": Todo,
  get active() {
    return this.filter({complete: false});
  },
  get complete() {
    return this.filter({complete: true});
  },
  get allComplete() {
    return this.length === this.complete.length;
  },
  get saving() {
    return this.filter((todo) => {
      return todo.isSaving();
    });
  },
  updateCompleteTo(value) {
    this.forEach((todo) => {
      todo.complete = value;
      todo.save();
    });
  },
  destroyComplete() {
    this.complete.forEach((todo) => {
      todo.destroy();
    });
  }
});

Todo.connection = realtimeRestModel({
  Map: Todo,
  List: Todo.List,
  url: "/api/todos"
});

Component.extend({
  tag: "todo-create",
  view: `
    <input id="new-todo"
        placeholder="What needs to be done?"
        value:bind="todo.name"
        on:enter="createTodo()"/>
  `,
  ViewModel: {
    todo: { Default: Todo },

    createTodo() {
      this.todo.save().then(() => {
        this.todo = new Todo();
      });
    }
  }
});

Component.extend({
  tag: "todo-list",
  view: `
    <ul id="todo-list">
      {{# for(todo of todos) }}
        <li class="todo {{# if(todo.complete) }}completed{{/ if }}
          {{# if( todo.isDestroying() )}}destroying{{/ if }}
          {{# if( this.isEditing(todo) ) }}editing{{/ if }}">
          <div class="view">
            <input class="toggle" type="checkbox" checked:bind="todo.complete">
            <label on:dblclick="this.edit(todo)">{{ todo.name }}</label>
            <button class="destroy" on:click="todo.destroy()"></button>
          </div>
          <input class="edit" type="text"
            default:bind="todo.name"
            on:enter="this.updateName()"
            focused:from="this.isEditing(todo)"
            on:blur="this.cancelEdit()"/>
        </li>
      {{/ for }}
    </ul>
  `,
  ViewModel: {
    todos: Todo.List,
    editing: Todo,
    backupName: "string",
    isEditing(todo) {
      return todo === this.editing;
    },
    edit(todo) {
      this.backupName = todo.name;
      this.editing = todo;
    },
    cancelEdit() {
      if(this.editing) {
        this.editing.name = this.backupName;
      }
      this.editing = null;
    },
    updateName() {
      this.editing.save();
      this.editing = null;
    }
  }
});

Component.extend({
  tag: "todo-mvc",

  view: `
    <section id="todoapp">
      <header id="header">
        <h1>todos</h1>
        <todo-create/>
      </header>
      <section id="main" class="">
        <input id="toggle-all" type="checkbox"
              checked:bind="allChecked"
              disabled:from="todosList.saving.length"/>
        <label for="toggle-all">Mark all as complete</label>
		{{# if(todosPromise.isResolved) }}
        <todo-list todos:from="todosPromise.value"/>
		{{/ if }}
      </section>
	  {{# if(todosPromise.isResolved) }}
		  <footer id="footer" class="">
			<span id="todo-count">
			  <strong>{{ todosPromise.value.active.length }}</strong> items left
			</span>
			<ul id="filters">
			  <li>
				<a href="{{ routeUrl(filter=undefined) }}"
				  {{# routeCurrent(filter=undefined) }}class='selected'{{/ routeCurrent }}>All</a>
			  </li>
			  <li>
				<a href="{{ routeUrl(filter='active') }}"
				  {{# routeCurrent(filter='active') }}class='selected'{{/ routeCurrent }}>Active</a>
			  </li>
			  <li>
				<a href="{{ routeUrl(filter='complete') }}"
				  {{# routeCurrent(filter='complete') }}class='selected'{{/ routeCurrent }}>Completed</a>
			  </li>
			</ul>
			<button id="clear-completed"
					on:click="todosList.destroyComplete()">
			  Clear completed ({{ todosPromise.value.complete.length }})
			</button>
		  </footer>
		{{/if}}
    </section>
  `,

  ViewModel: {
    routeData: {
      default() {
        can.route.register("{filter}");
        can.route.start();
        return route.data;
      }
    },
    get todosPromise(){
      if(!this.routeData.filter) {
        return Todo.getList({});
      } else {
        return Todo.getList({
          filter: { complete: this.routeData.filter === "complete" }
        });
      }
    },
    todosList: {
      get: function(lastSetValue, resolve){
        this.todosPromise.then(resolve);
      }
    },
    get allChecked(){
      return this.todosList && this.todosList.allComplete;
    },
    set allChecked(newVal){
        this.todosList && this.todosList.updateCompleteTo(newVal);
    }
  }
});

describe("Application Integration Tests", () => {
  let app = null;

  beforeEach(() => {
	// 1. Render an application
	app = document.createElement("todo-mvc")
    document.body.appendChild(app);
  });

  afterEach(() => {
	// 5. Clean up
    document.body.removeChild(app);
    localStorage.clear();
  });

  it("Todo list", (done) => {
	// 2. Verify that the application rendered correctly
    F("todo-mvc li.todo")
      .size(2, "one todo loaded from server");

	// 3. Simulate user interaction(s)
    F("todo-mvc #new-todo")
      .type("Profit\r");

	// 4. Verify that the application responds correctly
    F("todo-mvc li.todo")
      .size(3, "new todo added");

	// 3. Simulate user interaction(s)
    F("todo-mvc #clear-completed")
      .click();

	// 4. Verify that the application responds correctly
    F("todo-mvc #todo-count strong")
      .text(2, "completed todos cleared")
      .then(() => done());
  }).timeout(10000);
});

// start Mocha
mocha.run();
</script>
<style>
html,
body {
	margin: 0;
	padding: 0;
}

button {
	margin: 0;
	padding: 0;
	border: 0;
	background: none;
	font-size: 100%;
	vertical-align: baseline;
	font-family: inherit;
	color: inherit;
	-webkit-appearance: none;
	/*-moz-appearance: none;*/
	-ms-appearance: none;
	-o-appearance: none;
	appearance: none;
}

todo-mvc {
	font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
	line-height: 1.4em;
	background: #eaeaea url('bg.png');
	color: #4d4d4d;
	width: 550px;
	margin: 0 auto;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	-ms-font-smoothing: antialiased;
	-o-font-smoothing: antialiased;
	font-smoothing: antialiased;
}

#todoapp {
	background: #fff;
	background: rgba(255, 255, 255, 0.9);
	margin: 130px 0 40px 0;
	border: 1px solid #ccc;
	position: relative;
	border-top-left-radius: 2px;
	border-top-right-radius: 2px;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2),
				0 25px 50px 0 rgba(0, 0, 0, 0.15);
}

#todoapp:before {
	content: '';
	border-left: 1px solid #f5d6d6;
	border-right: 1px solid #f5d6d6;
	width: 2px;
	position: absolute;
	top: 0;
	left: 40px;
	height: 100%;
}

#todoapp input::-webkit-input-placeholder {
	font-style: italic;
}

#todoapp input::-moz-placeholder {
	font-style: italic;
	color: #a9a9a9;
}

#todoapp h1 {
	position: absolute;
	top: -120px;
	width: 100%;
	font-size: 70px;
	font-weight: bold;
	text-align: center;
	color: #b3b3b3;
	color: rgba(255, 255, 255, 0.3);
	text-shadow: -1px -1px rgba(0, 0, 0, 0.2);
	-webkit-text-rendering: optimizeLegibility;
	-moz-text-rendering: optimizeLegibility;
	-ms-text-rendering: optimizeLegibility;
	-o-text-rendering: optimizeLegibility;
	text-rendering: optimizeLegibility;
}

#header {
	padding-top: 15px;
	border-radius: inherit;
}

#header:before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	height: 15px;
	z-index: 2;
	border-bottom: 1px solid #6c615c;
	background: #8d7d77;
	background: -webkit-gradient(linear, left top, left bottom, from(rgba(132, 110, 100, 0.8)),to(rgba(101, 84, 76, 0.8)));
	background: -webkit-linear-gradient(top, rgba(132, 110, 100, 0.8), rgba(101, 84, 76, 0.8));
	background: -moz-linear-gradient(top, rgba(132, 110, 100, 0.8), rgba(101, 84, 76, 0.8));
	background: -o-linear-gradient(top, rgba(132, 110, 100, 0.8), rgba(101, 84, 76, 0.8));
	background: -ms-linear-gradient(top, rgba(132, 110, 100, 0.8), rgba(101, 84, 76, 0.8));
	background: linear-gradient(top, rgba(132, 110, 100, 0.8), rgba(101, 84, 76, 0.8));
	filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,StartColorStr='#9d8b83', EndColorStr='#847670');
	border-top-left-radius: 1px;
	border-top-right-radius: 1px;
}

#new-todo,
.edit {
	position: relative;
	margin: 0;
	width: 100%;
	font-size: 24px;
	font-family: inherit;
	line-height: 1.4em;
	border: 0;
	outline: none;
	color: inherit;
	padding: 6px;
	border: 1px solid #999;
	box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	-ms-box-sizing: border-box;
	-o-box-sizing: border-box;
	box-sizing: border-box;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	-ms-font-smoothing: antialiased;
	-o-font-smoothing: antialiased;
	font-smoothing: antialiased;
}

#new-todo {
	padding: 16px 16px 16px 60px;
	border: none;
	background: rgba(0, 0, 0, 0.02);
	z-index: 2;
	box-shadow: none;
}

#main {
	position: relative;
	z-index: 2;
	border-top: 1px dotted #adadad;
}

label[for='toggle-all'] {
	display: none;
}

#toggle-all {
	position: absolute;
	top: -42px;
	left: -4px;
	width: 40px;
	text-align: center;
	border: none; /* Mobile Safari */
}

#toggle-all:before {
	content: ">";
	font-size: 28px;
	color: #d9d9d9;
	padding: 0 25px 7px;
}

#toggle-all:checked:before {
	color: #737373;
}

#todo-list {
	margin: 0;
	padding: 0;
	list-style: none;
}

#todo-list li {
	position: relative;
	font-size: 24px;
	border-bottom: 1px dotted #ccc;
}

#todo-list li:last-child {
	border-bottom: none;
}

#todo-list li.saving {
	font-style: italic;
}
#todoapp #todo-list li.destroying label {
	font-style: italic;
    color: #a88a8a;
}

#todo-list li.editing {
	border-bottom: none;
	padding: 0;
}

#todo-list li.editing .edit {
	display: block;
	width: 506px;
	padding: 13px 17px 12px 17px;
	margin: 0 0 0 43px;
}

#todo-list li.editing .view {
	display: none;
}

#todo-list li .toggle {
	text-align: center;
	width: 40px;
	/* auto, since non-WebKit browsers doesn’t support input styling */
	height: auto;
	position: absolute;
	top: 0;
	bottom: 0;
	margin: auto 0;
	border: none; /* Mobile Safari */
	-webkit-appearance: none;
	/*-moz-appearance: none;*/
	-ms-appearance: none;
	-o-appearance: none;
	appearance: none;
}

#todo-list li .toggle:after {
	content: '\2713';
	line-height: 43px; /* 40 + a couple of pixels visual adjustment */
	font-size: 20px;
	color: #d9d9d9;
	text-shadow: 0 -1px 0 #bfbfbf;
}

#todo-list li .toggle:checked:after {
	color: #85ada7;
	text-shadow: 0 1px 0 #669991;
	bottom: 1px;
	position: relative;
}

#todo-list li label {
	word-break: break-word;
	padding: 15px;
	margin-left: 45px;
	display: block;
	line-height: 1.2;
	-webkit-transition: color 0.4s;
	-moz-transition: color 0.4s;
	-ms-transition: color 0.4s;
	-o-transition: color 0.4s;
	transition: color 0.4s;
}

#todo-list li.completed label {
	color: #a9a9a9;
	text-decoration: line-through;
}

#todo-list li .destroy {
	display: none;
	position: absolute;
	top: 0;
	right: 10px;
	bottom: 0;
	width: 40px;
	height: 40px;
	margin: auto 0;
	font-size: 22px;
	color: #a88a8a;
	-webkit-transition: all 0.2s;
	-moz-transition: all 0.2s;
	-ms-transition: all 0.2s;
	-o-transition: all 0.2s;
	transition: all 0.2s;
}

#todo-list li .destroy:hover {
	text-shadow: 0 0 1px #000,
				 0 0 10px rgba(199, 107, 107, 0.8);
	-webkit-transform: scale(1.3);
	-moz-transform: scale(1.3);
	-ms-transform: scale(1.3);
	-o-transform: scale(1.3);
	transform: scale(1.3);
}

#todo-list li .destroy:after {
	content: 'x';
}

#todo-list li:hover .destroy {
	display: block;
}

#todo-list li .edit {
	display: none;
}

#todo-list li.editing:last-child {
	margin-bottom: -1px;
}

#footer {
	color: #777;
	padding: 0 15px;
	position: absolute;
	right: 0;
	bottom: -31px;
	left: 0;
	height: 20px;
	z-index: 1;
	text-align: center;
}

#footer:before {
	content: '';
	position: absolute;
	right: 0;
	bottom: 31px;
	left: 0;
	height: 50px;
	z-index: -1;
	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3),
				0 6px 0 -3px rgba(255, 255, 255, 0.8),
				0 7px 1px -3px rgba(0, 0, 0, 0.3),
				0 43px 0 -6px rgba(255, 255, 255, 0.8),
				0 44px 2px -6px rgba(0, 0, 0, 0.2);
}

#todo-count {
	float: left;
	text-align: left;
}

#filters {
	margin: 0;
	padding: 0;
	list-style: none;
	position: absolute;
	right: 0;
	left: 0;
}

#filters li {
	display: inline;
}

#filters li a {
	color: #83756f;
	margin: 2px;
	text-decoration: none;
}

#filters li a.selected {
	font-weight: bold;
}

#clear-completed {
	float: right;
	position: relative;
	line-height: 20px;
	text-decoration: none;
	background: rgba(0, 0, 0, 0.1);
	font-size: 11px;
	padding: 0 10px;
	border-radius: 3px;
	box-shadow: 0 -1px 0 0 rgba(0, 0, 0, 0.2);
}

#clear-completed:hover {
	background: rgba(0, 0, 0, 0.15);
	box-shadow: 0 -1px 0 0 rgba(0, 0, 0, 0.3);
}

#info {
	margin: 65px auto 0;
	color: #a6a6a6;
	font-size: 12px;
	text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
	text-align: center;
}

#info a {
	color: inherit;
}

/*
	Hack to remove background from Mobile Safari.
	Can’t use it globally since it destroys checkboxes in Firefox and Opera
*/
@media screen and (-webkit-min-device-pixel-ratio:0) {
	#toggle-all,
	#todo-list li .toggle {
		background: none;
	}

	#todo-list li .toggle {
		height: 40px;
	}

	#toggle-all {
		top: -56px;
		left: -15px;
		width: 65px;
		height: 41px;
		-webkit-transform: rotate(90deg);
		transform: rotate(90deg);
		-webkit-appearance: none;
		appearance: none;
	}
}

.hidden{
	display:none;
}

hr {
	margin: 20px 0;
	border: 0;
	border-top: 1px dashed #C5C5C5;
	border-bottom: 1px dashed #F7F7F7;
}

.learn a {
	font-weight: normal;
	text-decoration: none;
	color: #b83f45;
}

.learn a:hover {
	text-decoration: underline;
	color: #787e7e;
}

.learn h3,
.learn h4,
.learn h5 {
	margin: 10px 0;
	font-weight: 500;
	line-height: 1.2;
	color: #000;
}

.learn h3 {
	font-size: 24px;
}

.learn h4 {
	font-size: 18px;
}

.learn h5 {
	margin-bottom: 0;
	font-size: 14px;
}

.learn ul {
	padding: 0;
	margin: 0 0 30px 25px;
}

.learn li {
	line-height: 20px;
}

.learn p {
	font-size: 15px;
	font-weight: 300;
	line-height: 1.3;
	margin-top: 0;
	margin-bottom: 0;
}

.quote {
	border: none;
	margin: 20px 0 60px 0;
}

.quote p {
	font-style: italic;
}

.quote p:before {
	content: '“';
	font-size: 50px;
	opacity: .15;
	position: absolute;
	top: -20px;
	left: 3px;
}

.quote p:after {
	content: '”';
	font-size: 50px;
	opacity: .15;
	position: absolute;
	bottom: -42px;
	right: 3px;
}

.quote footer {
	position: absolute;
	bottom: -40px;
	right: 0;
}

.quote footer img {
	border-radius: 3px;
}

.quote footer a {
	margin-left: 5px;
	vertical-align: middle;
}

.speech-bubble {
	position: relative;
	padding: 10px;
	background: rgba(0, 0, 0, .04);
	border-radius: 5px;
}

.speech-bubble:after {
	content: '';
	position: absolute;
	top: 100%;
	right: 30px;
	border: 13px solid transparent;
	border-top-color: rgba(0, 0, 0, .04);
}

/**body*/.learn-bar > .learn {
	position: absolute;
	width: 272px;
	top: 8px;
	left: -300px;
	padding: 10px;
	border-radius: 5px;
	background-color: rgba(255, 255, 255, .6);
	transition-property: left;
	transition-duration: 500ms;
}

@media (min-width: 899px) {
	/**body*/.learn-bar {
		width: auto;
		margin: 0 0 0 300px;
	}
	/**body*/.learn-bar > .learn {
		left: 8px;
	}
	/**body*/.learn-bar #todoapp {
		width: 550px;
		margin: 130px auto 40px auto;
	}
}
</style>
```
@highlight 208-243,only
@codepen
