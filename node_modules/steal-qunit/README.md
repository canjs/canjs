[![Build Status](https://travis-ci.org/stealjs/steal-qunit.svg?branch=master)](https://travis-ci.org/stealjs/steal-qunit)
[![npm version](https://badge.fury.io/js/steal-qunit.svg)](http://badge.fury.io/js/steal-qunit)

# steal-qunit

This provides an npm installable QUnit that fires off all tests 
when the app has finished loading.

## Install

From NPM:

```shell
npm install steal-qunit --save-dev
```

## Configuration

If you are using the [npm](http://stealjs.com/docs/npm.html) no configuration is needed. Otherwise configure the `paths` and `meta` properties:

```js
System.config({
	paths: {
		"steal-qunit/*": "path/to/steal-qunit/*.js",
		"steal-qunit": "path/to/steal-qunit/steal-qunit.js",
		"qunit/qunit/*": "path/to/qunit/qunit/*.js",
		"qunit/qunit/qunit.css": "path/to/qunit/qunit/qunit.css"
	},
	meta: {
		"qunit/qunit/qunit": {
			"format": "global",
			"exports": "QUnit",
			"deps": [
				"steal-qunit/add-dom"
			]
		}
	}
});
```
