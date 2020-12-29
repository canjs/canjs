@module {QUnit} steal-qunit steal-qunit
@parent StealJS.ecosystem

@description

**steal-qunit** allows easy use of [QUnit](https://qunitjs.com/) in StealJS projects.

@option {QUnit} The QUnit object just as if you were using QUnit directly.

@body

**steal-qunit** makes it easy to use QUnit in StealJS projects. Instead of manually adding all of the HTML that QUnit expects, just use steal-qunit which will take care of that for you.

Additionally steal-qunit will wait until your code has finished loading and then start your tests.

## Install

Get steal-qunit from npm:

```
> npm install steal-qunit --save-dev
```

## Use

To use just import steal-qunit into your tests:

```js
var QUnit = require("steal-qunit");

QUnit.test("1 plus 2 is four", function(assert){
	assert.equal(1 + 1, 2, "Math works, wow!");
});
```
