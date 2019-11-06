@page guides/testing Testing
@parent guides/topics 8
@outline 2

@description Learn how to test CanJS applications.

@body

This guide will show you how to set up and write tests for different pieces of CanJS applications. It will also show techniques that can be used to test things that would otherwise be difficult to test. Not all of these techniques will be needed for every application.

This guide does not focus on how to write applications in a maintainable, testable way. That is covered in the [guides/logic Logic Guide].

> **Note:** All of the examples in this guide use the [Mocha](https://mochajs.org/) test framework and [Chai](http://www.chaijs.com/) assertion library, but none of the examples are specific to Mocha/Chai and should work with any setup.

## Observables

Observables contain a majority of the logic in CanJS applications, so it is very important that they are well-tested. Since CanJS observables act mostly like normal JavaScript objects, testing them usually works just like working with normal objects—set a property (or call a function) then check the value of other properties. This setup is shown below, followed by a few techniques for making it easier to test more complex observables.

> Note: The examples below show how to test an [can-observable-object ObservableObject], but the same techniques also work with an [can-observable-array ObservableArray].

### Basic setup

The basic setup for testing an observable is:

1. Create an instance of the observable
2. Test default values of the observable’s properties
3. Set properties (or call functions) on the observable
4. Test values of the observable’s properties
5. Repeat 3 & 4

@sourceref ./observable-objects-basic-setup.html
@highlight 31-59,only
@codepen

### Asynchronous behavior

Asynchronous behavior is one of the toughest things to test in JavaScript. There are a few techniques that can be used to make it a little easier in CanJS applications.

The following example uses `listenTo` to capture the value whenever you type into the `<input>` element, but it only updates the value of the `text` property when nothing has been typed for 500ms:

@demo demos/testing/throttled-input.html
@codepen

The difficulty in testing this observable is knowing when to run assertions. One approach to testing this code is:

- Set the `text` property
- Wait 500ms
- Test that the value of the `text` property is correct

This might work initially, but different browsers will not handle this 500ms delay in exactly the same way. Tests using `setTimeout` like this become very brittle and prone to break as browsers and test environments change. It is very frustrating to write a test and have it start failing six months down the road even though nothing in the code has changed.

This brittleness can be avoided by using an [can-event-queue/map/map.listenTo event listener] instead of `setTimeout`. Using this technique, the test approach is:

- Set the `text` property
- Wait for the `text` property to change
- Test that the value of the `text` property is correct

Since the event listener needs to be set up before the property is changed, in practice this approach becomes:

- Create an event listener for when the `text` property changes
- Set the `text` property
- When the event listener is triggered, test that the value of the `text` property is correct

Here is how this is done for this example:

@sourceref ./observable-objects-asynchronous-behavior.html
@highlight 34-41,only
@codepen

> **Note:** When using Mocha, [testing asynchronous code](https://mochajs.org/#asynchronous-code) is accomplished by calling the `done` callback to indicate the test is complete. Different testing frameworks might have slightly different solutions.

### Properties derived from asynchronous behavior

It is often useful to use an [can-observable-object/define/async asynchronous property] to load data from a model or service layer. It can be difficult to test this without also testing the model. The async property might look something like this:

```js
class Todos extends ObservableObject {
	static props = {
		todoCount: {
			async(resolve) {
				todoConnection.getList({}).then(response => {
					resolve(response.metadata.count);
				});
			}
		}
	};
}
```

The primary logic in this code is responsible for reading the `metadata.count` property from the service layer response and setting it as the `todoCount` property on the observable. The way this code is written makes it very difficult to test this logic.

In order to make it easier, first **split** this property into two properties:

- the count property itself
- the promise returned by the Model

```js
class Todos extends ObservableObject {
	static props = {
		todoCount: {
			async(resolve) {
				this.todoCountPromise.then(response => {
					resolve(response.metadata.count);
				});
			}
		},

		todoCountPromise: {
			get(lastSet) {
				return todoConnection.getList({});
			}
		}
	};
}
```

Next, make it possible to override the `todoCountPromise` property by utilizing [can-observable-object/define/get#Propertiesvaluesthatchangewiththeirinternalsetvalue lastSet]:

@sourceref ./observable-objects-properties-derived-from-asynchronous-behavior-async.html
@codepen
@highlight 24-26,only

Now this can be tested by setting the default value of `todoCountPromise` to a promise that [resolves](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) with test data:

@sourceref ./observable-objects-properties-derived-from-asynchronous-behavior-async.html
@codepen
@highlight 41-43,only

Since this is a default value, the actual model’s `getList` method will never be called. The `todoCount` property can then be tested like any other [guides/testing#Testingasynchronousbehavior asynchronous behavior].

@sourceref ./observable-objects-properties-derived-from-asynchronous-behavior-async.html
@codepen
@highlight 36-48,only

It is also possible to test this synchronously by setting `todoCountPromise` to a normal object that [has the same methods](https://en.wikipedia.org/wiki/Duck_typing) as a Promise, but “resolves” synchronously. This might look like:

```js
const testTodoCountPromise = {
	then(resolve) {
		resolve(todoResponse);
	}
};

const todos = new Todos({
	todoCountPromise: testTodoCountPromise
});
```

With this approach, the assertions can be made outside of the `listenTo` callback and there is no need to call `done()` since this test is now synchronous.

> **Note:** Even with this approach, `listenTo` still needs to be called; without this, CanJS will not provide the `resolve` function to the asynchronous getter. This is done to prevent memory leaks.

@sourceref ./observable-objects-properties-derived-from-asynchronous-behavior-sync.html
@codepen
@highlight 41-53,only

### Properties derived from models (or any imported module)

The [guides/testing#Propertiesderivedfromasynchronousbehavior previous example] shows how to test logic that is dependent on a promise returned by a [guides/data-introduction#Retrievingalistofrecords getList] call. That example did not show how to test that the Model is used correctly.

Specifically, we did not test:

- `todoCountPromise` calls `todoConnection.getList`
- `todoCountPromise` is the return value of `todoConnection.getList`

```js
import todoConnection from "models/todo";

class Todos extends ObservableObject {
	static props = {
		todoCountPromise: {
			get(lastSet) {
				return todoConnection.getList({});
			}
		}
	};
}
```

@highlight 6-8,only

This could be tested using [can-fixture], but doing this would also test any logic in the `todoConnection` itself. A unit test of the observable should just test the code in the observable; testing the model should be handled by tests specifically created to test the model and/or in integration tests. Both of these will be discussed later in this guide.

To test the `todoCountPromise`, you can store the `todoConnection` as a property on the observable and then use `this.todoConnection` instead of the `todoConnection` that was imported:

```js
import todoConnection from "models/todo";

class Todos extends ObservableObject {
	static props = {
		todoConnection: {
			get default() {
				return todoConnection;
			}
		},
		todoCountPromise: {
			get(lastSet) {
				return this.todoConnection.getList({});
			}
		}
	};
}
```

@highlight 5-9,12,only

Using this technique allows you to set a new value of `todoConnection` by passing it as a default value to the [can-observable-object ObservableObject] constructor. You can then test that the `getList` function was called (as well as test the arguments passed to it) and also test that the getter returned the correct value.

@sourceref ./observable-objects-properties-derived-from-models.html
@codepen
@highlight 15-19,29,40-45,48,53-71,only

This technique is useful for testing code using models, but it can be used to test any code that uses a function or property _exported directly_ from another module.

## Components

Components are the glue that holds CanJS applications together—connecting observables to the DOM, handling events triggered by user interaction, interfacing with third-party libraries, and many other things.

There are different challenges to testing each of these responsibilities. These are discussed in the sections below.

### Properties

All of the techniques described in [guides/testing#Observables Testing Observables] can be used for testing a component’s properties by creating an instance of the component:

@sourceref ./custom-elements-observable-object.html
@highlight 12,30-43,51,only
@codepen

### DOM Events

DOM events handled through [can-stache-bindings], like `value:bind="first"`, can be tested through the component directly as shown in [guides/testing#Basicsetup Testing Observables]. However, they can also be tested by:

1. Creating an instance of the component
2. Calling [can-stache-element/lifecycle-methods.render] on the instance to render the component’s view into its `innerHTML`
3. Finding the event target through the component
4. Using [can-dom-events.dispatch domEvents.dispatch] to dispatch the event

> **Note:** Tests like this will work even if the component is not in the document.

@sourceref ./custom-elements-dom-events-form.html
@highlight 49-64,only
@codepen

This strategy can also be used to test events using `listenTo` in a [can-observable-object/define/value] behavior (or a Map’s [can-event-queue/map/map.listenTo] method):

@sourceref ./custom-elements-dom-events-modal.html
@highlight 26-28,37-49,only
@codepen

Another place you might use `listenTo` is in [can-stache-element/lifecycle-methods.connect]. The same testing procedure can be used in this scenario, but you need to make sure `connect` is called, which is discussed in the next section.

### connected

The [can-stache-element/lifecycle-hooks.connected connected hook] is a good place to put code that is expected to run once a component is in the document. To test this code, the [can-stache-element/lifecycle-methods.connect connect method] needs to be called. One way to do this is to call it manually:

@sourceref ./custom-elements-connect-manually.html
@highlight 39,only
@codepen

If the code relies on the element actually being in the document, you can add the element to the page using [appendChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild):

@sourceref ./custom-elements-connect-append-child.html
@highlight 39,only
@codepen

> **Note:** Some test frameworks like [QUnit](https://qunitjs.com/cookbook/#keeping-tests-atomic) have special test areas that you insert elements into for your tests.
> These are automatically cleaned up after each test, so you do not have to worry about a test causing problems for other tests.
> If the framework you’re using doesn’t have this, make sure to clean up after the test yourself.

## Routing

Routing in CanJS applications has three primary responsibilities:

1. Connecting a component to [can-route]
2. Displaying the corrent component based on the route
3. Passing data to the displayed component

Separating these into three separate properties on the component means that they can each be tested independently. This will be shown in the following sections.

### Route data

CanJS’s router uses the observable key-value object [can-route.data can-route.data] to bind the URL to a StacheElement. To make this observable available to the StacheElement, you can make a property that returns `route.data` its [can-observable-object/define/get-default default value]:

```js
class Application extends StacheElement {
	static props = {
		routeData: {
			get default() {
				return route.data;
			}
		}
	};
}
```

@highlight 3-7

Most applications also set up [guides/routing#Registerroutes “pretty” routes] by calling [can-route.register route.register]. This can also be done in the default value definition before calling [can-route.start]:

@sourceref ./routing-route-data.html
@highlight 18-20,only
@codepen

Testing this can be difficult because changes to `routeData` will also cause changes to the URL. This can cause big problems: if the URL suddenly changes to `/list/5` in the middle of running the tests, the test page is no longer going to be functional.

To avoid this, CanJS provides [can-route-mock RouteMock] so that you can interact with `route.data` without actually changing the URL.

After setting [can-route.urlData] to an instance of `RouteMock`, you can make changes to the `value` of the `RouteMock` instance to simulate changes to the URL and then verify that the StacheElement’s `routeData` property updates correctly:

@sourceref ./routing-route-data.html
@highlight 30-42,only
@codepen

You can also make changes to the `routeData` and check that the URL is updated correctly by verifying the `value` of the `RouteMock` instance. In CanJS, the URL is changed asynchronously, so you will need to use an asynchronous test that uses `routeMock.on` to determine when to run assertions:

@sourceref ./routing-route-data.html
@highlight 44-61,only
@codepen

### Displaying the correct component

Testing that the correct component is displayed based on the `routeData` can be done completely independently from `can-route` when `routeData` is defined as a [can-observable-object/define/get-default default value] as shown above.

The component can be defined using a [can-observable-object/getter getter] that reads `routeData` and creates an instance of the correct type of component:

@sourceref ./routing-displaying-custom-elements.html
@highlight 28-34,only
@codepen

In order to test this, create an observable and pass it to the ObservableObject constructor as the `routeData` property:

@sourceref ./routing-displaying-custom-elements.html
@highlight 51-58,only
@codepen

This will override what is set up in the `default() {}` and allow you to make changes to the `routeData` object and verify that the correct component is created:

@sourceref ./routing-displaying-custom-elements.html
@highlight 60-71,only
@codepen

### Passing data to the component

Data that needs to be passed to the component being displayed can also be tested independently if it is created as a separate property on the ObservableObject that is derived from the `routeData` property:

@sourceref ./routing-passing-data.html
@highlight 6,43-51,only
@codepen

With the component data set up like this, you can make changes to `routeData` and confirm that the child component will get the correct values by verifying the `value` of the observable passed through the `elementToShowBindings`:

@sourceref ./routing-passing-data.html
@highlight 83-93,only
@codepen

You can also set the `value` of the properties of `elementToShowBindings` and verify that the `routeData` is updated correctly:

@sourceref ./routing-passing-data.html
@highlight 95-107,only
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

@sourceref ./models-connections.html
@highlight 38-49,only
@codepen

### QueryLogic

CanJS model mixins internally use [can-query-logic] to perform queries of your service layer data and compare different queries against each other. It uses the logic of these queries to understand how to cache data and provide real-time behavior.

It can be useful to test this logic to ensure that it will work correctly when used for these other behaviors. It is also very useful to add tests like this when you run into an issue with your model not working as expected.

One useful way to do this is to use [can-query-logic.prototype.filterMembers] to verify that a specific query will correctly filter an array of data:

@sourceref ./models-query-logic.html
@highlight 37-54,only
@codepen

It can also be useful to use [can-query-logic.prototype.isMember] to verify that a specific record is contained within the results of a query:

@sourceref ./models-query-logic.html
@highlight 56-67,only
@codepen

## Integration Testing

Integration testing is designed to test multiple units of an application to make sure they work together.

There are a few things that make writing and maintaining integration tests more costly than unit tests:

- Functional tests usually take longer to write because they require an understanding of a larger portion of the application
- Functional tests take longer to _run_ because of the time it takes to render and interact with the DOM
- Functional tests often need to be updated when the structure of an application’s HTML and CSS changes

For these reasons, you may not want to write integration tests for every feature of an application. That being said, integration tests of an application’s **most important functionality** are very valuable. Also, for applications with no tests at all, adding integration tests **before making big changes** (like large upgrades, etc) can make it much easier to verify that the app is still functioning after the changes are in place.

No matter the purpose of the integration test, they generally follow the same pattern:

1. Render an application
2. Verify that the application rendered correctly
3. Simulate user interaction
4. Verify that the application responds correctly
5. Clean up

> **Note:** The test below is written using [FuncUnit](https://funcunit.com/) but it would also work with [cypress.io](https://www.cypress.io/), [dom-testing-library](https://www.npmjs.com/package/dom-testing-library), or whatever integration testing setup you prefer.

@sourceref ./integration-testing.html
@highlight 242-275,only
@codepen
