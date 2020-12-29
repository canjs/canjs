# <a href="http://kefirjs.github.io/kefir/"><img src="http://kefirjs.github.io/kefir/Kefir-with-bg.svg" width="60" height="60"></a> Kefir



Kefir — is an Reactive Programming library for JavaScript
inspired by [Bacon.js](https://github.com/baconjs/bacon.js)
and [RxJS](https://github.com/Reactive-Extensions/RxJS)
with focus on high performance and low memory usage.

For docs visit [kefirjs.github.io/kefir](http://kefirjs.github.io/kefir).
See also [Deprecated API docs](https://github.com/kefirjs/kefir/blob/master/deprecated-api-docs.md).



[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kefirjs/kefir/blob/master/LICENSE.txt)
[![npm version](https://img.shields.io/npm/v/kefir.svg?style=flat)](https://www.npmjs.com/package/kefir)
[![Build Status](https://travis-ci.org/kefirjs/kefir.svg?branch=master)](https://travis-ci.org/kefirjs/kefir)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pozadi/kefir?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)



# Installation

Kefir available as NPM and Bower packages, as well as simple files download.

### NPM
```sh
npm install kefir
```

### Bower
```sh
bower install kefir
```

### Download

See [downloads](https://kefirjs.github.io/kefir/#downloads) section in the docs.

Also available on [jsDelivr](http://www.jsdelivr.com/#!kefir).

# Browsers support

We don't support IE8 and below, aside from that Kefir should work in any browser.


## [Flow](https://flowtype.org/)

The NPM package ships with Flow definitions. So you can do something like this if you use Flow:

```js
// @flow

import Kefir from 'kefir'

function foo(numberStream: Kefir.Observable<number>) {
  numberStream.onValue(x => {
    // Flow knows x is a number here
  });
}

const s = Kefir.constant(5);
// Flow can automatically infer the type of values in the stream and determine
// that `s` is of type Kefir.Observable<number> here.
foo(s);
```

# Development

```sh
npm run prettify    # makes source code pretty (you must run it before a PR could be merged)
npm run build-js    # builds js bundlers
npm run test        # runs all the checks
npm run test-only   # runs only unit tests without other checks
npm run test-debug  # runs tests with a chrome inspector connected to the node process
npm run build-docs  # builds the documentation html file
```
