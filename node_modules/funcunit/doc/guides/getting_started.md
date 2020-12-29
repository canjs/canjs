@page Guides.guides.start Getting Started
@parent Guides 0

@body

In this guide, we'll use FuncUnit to simulate actions as a user would with a simple tabs and slider widget.

* How to get FuncUnit
* Intro to Funcunit
* Enhancing unit tests
* Testing a simple slider widget
* Functional testing with a tabs widget

Note:

FuncUnit has two dependencies:

* jQuery - only on the test runner page
* QUnit or Jasmine

## How to get FuncUnit

You can download [funcunit.js](/dist/latest/funcunit.js), or install as a bower component or npm package:

    bower install funcunit

or

    npm install funcunit --save-dev

If using from npm you can `require` FuncUnit in your application if you're using [StealJS](https://stealjs.com/) or Browserify.

    var F = require("funcunit");
    var QUnit = require("qunit");

    F.attach(QUnit);

This will attach `QUnit` to be your test runner. FuncUnit works with QUnit, Jasmine, and Mocha.

All examples below can be downloaded [here](/dist/examples.zip).

## Intro to Funcunit

When using FuncUnit, break down a user's interaction into three segments: finding elements, executing actions and waiting for assertions.

Find an element with jQuery's selector syntax:

    F('.selector')

Execute a user action:

    F('.selector').click()

Then wait for an assertion:

    F('.anotherselector').visible() //waits until element is visible

FuncUnit can be used to enhance existing unit tests or write new unit tests while keeping the standard QUnit/Jasmine ideology. FuncUnit can also be used to write functional tests as outlined below.

## Enhancing unit tests

This section takes a basic QUnit test and uses FuncUnit to simulate user interaction.

Instead of using the built in QUnit assertions, use any of FuncUnit's [waits](/guides/funcunit.waits.html).

    test('Hello World!', function() {
        F('.sample').text('Hello World!', 'h1 should have text hello world');
    });

_Note: Included in the [examples package](/dist/examples.zip) is a "Hello World" Jasmine spec._

## Testing a simple slider widget

This section takes a common [UI Slider](http://api.jqueryui.com/slider) from jQueryUI and employs FuncUnit's actions and waits.

The test page is setup with our basic dependencies: jQuery, jQueryUI, QUnit and FuncUnit

    <!doctype html>
    <html>
      <head>
        <title>Slider Tests</title>
        <link rel="stylesheet" href="../resources/qunit.css"/>
        <link rel="stylesheet" href="../resources/jquery-ui-1.10.3.custom.css"/>
      </head>

      <body>
        <div id="qunit"></div>
        <div id="qunit-test-area"></div>

        <script src="../resources/jquery.js"></script>
        <script src="../resources/jquery-ui-1.10.3.custom.js"></script>

        <script src="../resources/qunit.js"></script>
        <script src="../resources/funcunit.js"></script>

        <script src="qunit_test.js"></script>
      </body>
    </html>

First, the test file sets up a simple slider:

@codestart
module('slider', {
  setup: function() {
    $('#qunit-test-area').html($('&lt;div>'));
    $('#qunit-test-area div').slider();
  }
});
@codeend

To test the slider's change of value, use the [drag](/docs/FuncUnit.prototype.drag.html) action.

All FuncUnit actions accept a callback for additional validation. With the slider widget, assert the value has increased upon sliding.

@codestart
test('drag slider', function() {
  F('#qunit-test-area a').drag('+200 +0', function() {
    var value = $('#qunit-test-area div').slider('option', 'value');
    ok(value > 0, 'value after 200px should not be 0');
  });
});
@codeend

Mix or match your built in assertion library, as well as using FuncUnit's waits and actions to accurately depict user interaction.

## Functional testing with a tabs widget

Functional tests, for purposes of these guides, are defined as an application running in its true state. This is to say, not in an isolated fixture div or sandbox area. FuncUnit allows for opening a URL, then providing the same actions and waits to test the application.

_Note: It is recommended for these types of tests to have a fixturized service layer such as [CanJS fixtures](https://canjs.com/docs/can.fixture.html) or use an isolated test database when service calls are present._

Using [F.open](/docs/FuncUnit.open.html), test a simple tabs widget in its own page.

First, setup the QUnit runner page:

    <!doctype html>
    <html>
      <head>
        <title>Tabs Tests</title>
        <link rel="stylesheet" href="../resources/qunit.css">
      </head>

      <body>
        <div id="qunit"></div>
        <div id="qunit-fixture"></div>

        <script src="../resources/jquery.js"></script>
        <script src="../resources/qunit.js"></script>
        <script src="../resources/funcunit.js"></script>

        <script src="qunit_test.js"></script>
      </body>
    </html>

Then configure our setup module. Call the `open` method to create a new window with the requested URL. This will act as our sandbox test area.

@codestart
module('tabs', {
  setup: function() {
    F.open('tabs.html');
  }
});
@codeend

Then run actions and waits the same as in the slider test and watch as the newly opened window responds!

@codestart
test('single tab click', function() {
  F('li:contains("Fallout")').click();
  F('#starcraft').invisible('tab should be hidden');
  F('#fallout').visible('tab should be shown');
});

test('clicking one tab then another', function() {
  F('li:contains("Fallout")').click();
  F('#fallout').visible('tab should be shown');

  F('li:contains("Robot Unicorn Attack")').click();
  F('#fallout').invisible('tab should be hidden');
  F('#rua').visible('tab should be shown');
});
@codeend

## Conclusion

Hopefully, this guide illustrates how FuncUnit provides the holy grail of testing: easy, familiar syntax, in browser running for easy debugging and simple automation.

FuncUnit transforms your development lifecycle, gives your developers confidence and improves quality. For a more complex example with module loaders and multiple widgets, download the [examples package](/dist/examples.zip) and view the Srchr app's tests.

That's it! If you want to learn more, read about FuncUnit's [FuncUnit API](/docs).
