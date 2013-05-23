# Contributing to CanJS

## Contributing

When contributing, include tests with new features or bug fixes in a feature branch until you're ready to submit the code for consideration; then fork the repository, push to the fork, and issue a pull request.

Clone the repository and create a new feature branch.

	$ git clone git@github.com:bitovi/canjs.git
	$ git checkout -b html5-fix

Once your happy with your changes, push to the feature branch.

	$ git push origin html5-fix

Now that we have pushed all the changes to the repo, we need to submit a Pull Request to the main branch.  Navigate to [Pull Requests](https://github.com/bitovi/canjs/pulls) and click 'Pull Request' in the top navigation bar.  Fill in some details about your potential patch including a meaningful title. When finished, press "Send pull request". The core team will be notified about your submission and let you know of any problems or targeted release date.

## Documentation

If your pull request affects the public API, make relevant changes to the documentation.  Documentation is found either inline or in markdown files in the respective directory.

## Reporting Bugs

To report a bug, please visit [GitHub Issues](https://github.com/bitovi/canjs/issues).  

When filing a bug, its helpful to include:

- Small examples using tools like [JSBin](http://jsbin.com/)
- Breaking unit tests
- Proposed fix solutions
- Search for previous tickets, if there is one add to that one rather than creating another.

You can also post on the [Forums](https://forum.javascriptmvc.com/canjs) or talk to us in [IRC #canjs channel](http://webchat.freenode.net/?channels=canjs).

## Running Tests Locally

Its important that all tests pass before sending a pull request.  TravisCI will determine if your commits pass the tests, but while your developing you can run the QUnit tests locally.  

Open `~/can/test/test.html` in a web browser to run the tests locally.  Each module has its own tests too, you can run them by opening the `qunit.html` in each folder.

CanJS supports the following browsers:

- Chrome Current-1
- Safari Current-1
- Firefox Current-1
- IE 7+
- Opera Current-1

## Style Guide

### Linting
Grunt provides a JSHint task to verify some basic, practical soundness of the codebase. The options are preset.

### Spacing
Indentation with tabs, not spaces.

`if/else/for/while/try` always have braces, with the first brace on the same line.  For example:

	if(foo){

	}
	
Spaces after commas.  For example:

	myfn = function(foo, bar, moo){ ... }

### Assignments

Assignments should always have a semicolon after them.

Assignments in a declaration should always be on their own line. Declarations that don't have an assignment should be listed together at the start of the declaration. For example:

	// Bad
	var foo = true;
	var bar = false;
	var a;
	var b;

	// Good
	var a, b,
		foo = true,
		bar = false;

### Equality

Strict equality checks `===` should be used in favor of `==`. The only exception is when checking for undefined and null by way of null.

	// Bad
	if(bar == "can"){ ... }

	// Good
	if(bar === "can"){ ... }

If the statement is a truthey or falsey, use implied operators.  Falseys are when variables return `false`, `undefined`, `null`, or `0`.  Trutheys are when variables return `true`, `1`, or anything defined.

For example:

	// Bad
	if(bar === false){ ... }

	// Good 
	if(bar){ ... }

	// Good
	var foo = [];
	if(!foo.length){ ... }

###  Quotes

Use double quotes.

	var double = "I am wrapped in double quotes";

Strings that require inner quoting must use double outside and single inside.

	var html = "<div id='my-id'></div>";

### Comments

Single line comments go OVER the line they refer to:

	// We need an explicit "bar", because later in the code foo is checked.
	var foo = "bar";

For long comments, use:

	/* myFn
	 * Four score and seven—pause—minutes ago...
 	 */
 	
