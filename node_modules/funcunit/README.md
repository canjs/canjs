<!--
@hide title

@constructor FuncUnit
@group actions Actions
@group css CSS
@group dimensions Dimensions
@group manipulation Manipulation
@group traversal Traversal
@group waits Waits
@group utilities Utilities

-->
# FuncUnit

[![Build Status](https://travis-ci.org/bitovi/funcunit.svg?branch=master)](https://travis-ci.org/bitovi/funcunit)
[![npm version](https://badge.fury.io/js/funcunit.svg)](https://badge.fury.io/js/funcunit)
[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
> Write better tests, faster.

*Note:* [FuncUnit Roadmap](http://forum.javascriptmvc.com/#Topic/32525000001436023)

The [FuncUnit Getting Started](http://funcunit.com/guides/Guides.guides.start.html) guide is a quick walkthrough of creating and running a test.

## Set up a test

[QUnit](http://docs.jquery.com/Qunit) provides the basic structure needed to write unit or functional tests.

### Module

[Modules](http://docs.jquery.com/QUnit/module#namelifecycle) are groups of tests with setup and teardown methods that run for each test.

```js
module("Contacts", {
  // runs before each test
  setup: function(){
    // setup code
  },
  // runs after each test
  teardown: function(){
    // cleanup code
  }
});
```

### Test

```js
test("findOne", function(){
  // define a test
});
```

### Assertions

```js
test("counter", function() {
  ok(Conctacts.first().name, "there is a name property");
  equal(Contacts.counter(), 5, "there are 5 contacts");
});
```

## Open a page

The following uses `F.open( URL )` to open autocomplete.html before every test.

```js
module("autosuggest", {
  setup: function() {
    F.open('autosuggest.html');
  }
});
```

Calling open on window will cause FuncUnit commands to operate on the current window.  This is also the default if you don't open any page.


## Query for elements

FuncUnit tests are written just like jQuery. [`F`](http://funcunit.com/guides/funcunit.finding.html) is a copy of the `$` method. It is used to find elements in the page you're testing. Like `$`, FuncUnit methods are chainable on the results of `F`.

```js
// grab the #description element, wait for it to be visible, type in it
F("#description").visible().type("Test Framework");
```

## Simulate user actions

When you're testing a widget, you need to simulate the [actions](http://funcunit.com/guides/Guides.actions.html) that user takes.  FuncUnit uses the
[syn library](https://github.com/bitovi/syn) to accurately simulate the correct low level events like _mouseup_ and _keypress_ for high
level actions like [click()](http://funcunit.com/docs/FuncUnit.prototype.click.html) and [type()](http://funcunit.com/docs/FuncUnit.prototype.type.html).  The following shows how to simulate common user actions.

### Click

```js
// click a button
F('#submit_button').click();
```

### Type

```js
// type in an input
F('#task_name').type("Learn FuncUnit");
```

### Drag

```js
// drag a task item to the trash area
F('.task').drag(".trash");
```

## Wait for page conditions

After a user action, your test page's event handlers run and the page is changed.
Wait commands are used to wait for some page condition before continuing.

Waits are overloaded jQuery getter methods.  `F.fn.text( textVal, callback )`
waits for an element's `$.fn.text` to match the `textVal`.

```js
// wait for result to show "task complete"
F("#result").text("task complete");
```

### Visible

```js
// wait for first result to be visible
F('#autocomplete_results:first-child').visible();
```

### Width

```js
// after clicking a menu item, wait for its width to be 200px
F('#horizontal_menu_item').width(200);
```

### Val

```js
// wait for the input value
F('#language_input').val("JavaScript");
```

### Size

```js
// wait for number of matched elements
F('.contact').size(5);
```

There are many more [waits](http://funcunit.com/guides/Guides.waits.html) possible.


<h2 id="get">Get information and run assertions</h2>

After simulating an action and waiting for the page to change, you often want to get information
about an element and run assertions.  You can use jQuery getter methods in combination with QUnit assertions.

These methods (which return synchronous results) are used in callbacks that run after a wait method completes.

```js
// wait until we have some results, then call the callback
F('.autocomplete_item').visible(function(){
  equal( F('.autocomplete_item').size(), 5, "there are 5 results");
});
```

<h2 id="browser">Running in browser</h2>

These tests can be loaded in any browser.  The app page opens in a separate window and results show up in the QUnit page.

```js
test("JavaScript results", function(){
  F('input').click().type("JavaScript");

  // wait until we have some results
  F('.autocomplete_item').visible(function(){
    equal( F('.autocomplete_item').size(), 5, "there are 5 results");
  });
});
```
