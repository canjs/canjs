# can-test-helpers

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join our Discourse](https://img.shields.io/discourse/https/forums.bitovi.com/posts.svg)](https://forums.bitovi.com/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canjs/can-test-helpers/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/can-test-helpers.svg)](https://www.npmjs.com/package/can-test-helpers)
[![Travis build status](https://travis-ci.org/canjs/can-test-helpers.svg?branch=master)](https://travis-ci.org/canjs/can-test-helpers)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-test-helpers.svg)](https://greenkeeper.io/)

Common utilities for effectively testing the features of CanJS.

## Documentation

### `dev.willWarn(expected, [fn])`

Requests that `canDev.warn` track and notify about matching warnings.

- `expected`: {String|Regexp} expected The warning message to check for
- `fn`: {Function(String, Boolean)} [fn] an optional callback to fire on every warning; each call has the actual warning message and a Boolean indicating whether it was matched.

Returns a function that tears down the warning check and returns the number of matched warnings when called.

`willWarn()` takes either a String or a RegExp as its `expected` warning, and does a full, case-sensitive String
match in the case of a String, or a regex test in the case of a RegExp, for every warning logged through
[can-log/dev/dev.warn].  In addition, if `fn` is provided, it is fired on _every_ warning with the content
of the warning message and whether it matched `expected`.

`willWarn()` returns a teardown function, which must be called at least once to disable the tracking of the matched
warning.  when called, the teardown function returns the number of times `expected` was matched by a dev warning.

```js
import dev from "can-log/dev/dev";
import devHelpers from "can-test-helpers/lib/dev";

const finishWarningCheck = devHelpers.willWarn( "something evil", function( message, match ) {
	message; // -> "something evil"
	match; // true
} );

canDev.warn( "something evil" );

finishWarningCheck(); // -> 1

```

### `dev.willError(expected, [fn])`

Requests that [can-log/dev/dev.error canDev.error] track and notify about matching errors.

- `expected` {String|Regexp} expected The error message to check for
- `fn` {Function(String, Boolean)} [fn] an optional callback to fire on every error; each call has the actual error
 message and a Boolean indicating whether it was matched

Returns a function that tears down the error check and returns the number of matched errors when called.

`willError()` takes either a String or a RegExp as its `expected` error, and does a full, case-sensitive String
match in the case of a String, or a regex test in the case of a RegExp, for every error logged through
[can-log/dev/dev.error].  In addition, if `fn` is provided, it is fired on _every_ error logged by dev.error
with the content of the error message and whether it matched `expected`.

`willError()` returns a teardown function, which must be called at least once to disable the tracking of the matched
error.  when called, the teardown function returns the number of times `expected` was matched by a dev error.

```js
import dev from "can-log/dev/dev";
import devHelpers from "can-test-helpers/lib/dev";

const finishErrorCheck = devHelpers.willError( "something evil", function( message, match ) {
	message; // -> "something evil"
	match; // true
} );

canDev.error( "something evil" );

finishErrorCheck(); // -> 1

```

### `dev.devOnlyTest(...)`

Defines a test that runs only in development mode.

- {Number} [waits] an optional number of async waits
- {String} name  the String identifier for the test in the test module
- {Function} fn  the function body of the test.

The parameter list above assumes that `test` on the global object is a QUnit test function. With `devOnlyTest`,
the global test function will be run with the supplied parameters when the system environment is either
unknown or not one of the production tests.  This is to help facilitate tests that rely on, e.g., canDev
behavior that only exists in development builds.

```js
dev.devOnlyTest( "it works", function() {
	QUnit.ok( true, "it works!" );
} );
```


## Changelog

See the [latest releases on GitHub](https://github.com/canjs/can-test-helpers/releases).

## Contributing

The [contribution guide](https://github.com/canjs/can-test-helpers/blob/master/CONTRIBUTING.md) has information on getting help, reporting bugs, developing locally, and more.

## License

[MIT](https://github.com/canjs/can-test-helpers/blob/master/LICENSE)
