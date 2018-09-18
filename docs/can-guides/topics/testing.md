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

describe("ThrottledText ViewModel", () => {
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

describe("Todos ViewModel", () => {
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

      <p>Name: {{name}}</p>
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

      <p>Name: {{name}}</p>
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
@highlight 6,43-64,only
@codepen

Obviously this is much more complicated than just calling the `connectedCallback` manually, so only use this process if absolutely necessary.
