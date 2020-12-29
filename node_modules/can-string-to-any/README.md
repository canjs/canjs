# can-string-to-any

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join our Discourse](https://img.shields.io/discourse/https/forums.bitovi.com/posts.svg)](https://forums.bitovi.com/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canjs/can-string-to-any/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/can-string-to-any.svg)](https://www.npmjs.com/package/can-string-to-any)
[![Travis build status](https://travis-ci.org/canjs/can-string-to-any.svg?branch=master)](https://travis-ci.org/canjs/can-string-to-any)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-string-to-any.svg)](https://greenkeeper.io/)

Convert strings to equivalent JavaScript values. Works in NodeJS and in all browsers.

## Use

```js
import stringToAny from 'can-string-to-any';

stringToAny("null")  //-> null
stringToAny("-3")     //-> -3
stringToAny("false") //-> false
stringToAny("NaN")   //-> NaN
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-string-to-any/dist/global/can-string-to-any.js'></script>
```

## Documentation

Read the [can-string-to-any API docs on CanJS.com](https://canjs.com/doc/can-string-to-any.html).

## Changelog

See the [latest releases on GitHub](https://github.com/canjs/can-string-to-any/releases).

## Contributing

The [contribution guide](https://github.com/canjs/can-string-to-any/blob/master/CONTRIBUTING.md) has information on getting help, reporting bugs, developing locally, and more.

## License

[MIT](https://github.com/canjs/can-string-to-any/blob/master/LICENSE)
