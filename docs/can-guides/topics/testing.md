@page guides/testing Testing
@parent guides/essentials 8
@outline 2

@description Learn how to test CanJS applications.

@body

> NOTE: This guide is a work in progress. New sections will be added as they are completed. Have a topic you want covered? Add it to [the issue](https://github.com/canjs/canjs/issues/3862).

This guide will explain how to test the different pieces of CanJS applications. It will show techniques that will make tests easier to write and the mechanics of how to set up and write tests. This guide does not focus on how to write your application in a maintainable, testable way. That is covered in the [guides/logic Logic Guide].

> NOTE: All of the examples in this guide use the [Mocha](https://mochajs.org/) test framework and [Chai](http://www.chaijs.com/) assertion library, but none of the examples are specific to Mocha/Chai and should work with any setup.

## ViewModels

### Basic Setup

```html
<div id="mocha"></div>
<link rel="stylesheet" href="//unpkg.com/mocha@5.2.0/mocha.css">
<script src="//unpkg.com/mocha@5.2.0/mocha.js" type="text/javascript"></script>
<script src="//unpkg.com/chai@4.1.2/chai.js" type="text/javascript"></script>
<script type="module">
import { DefineMap } from "can";

// Mocha / Chai Setup
mocha.setup('bdd')
var assert = chai.assert;

let ViewModel = DefineMap.extend({
	first: "string",
	last: "string",
	get name() {
		return `${this.first} ${this.last}`;
	}
});

describe("ViewModel", () => {
	let vm;

	beforeEach(() => {
		vm = new ViewModel({
			first: "Kevin",
			last: "McCallister"
		});
	});

	it("name", () => {
		assert.equal(vm.name, "Kevin McCallister");

		vm.last = "Phillips";
		assert.equal(vm.name, "Kevin Phillips");
	});
});

// start Mocha
mocha.run();
</script>
```
@highlight 24-27,30-35,only
@codepen
