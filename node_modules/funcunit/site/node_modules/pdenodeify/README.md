[![Build Status](https://travis-ci.org/matthewp/pdenodeify.svg?branch=master)](https://travis-ci.org/matthewp/pdenodeify)

# pdenodeify

Dead simple `denodeify` function for Promises. Supports native promises, when they come to Node and/or the browser, falling back to [es6-promise](https://github.com/jakearchibald/es6-promise) if the global isn't available. Since the polyfill is optional you'll need to include it yourself (in Node just make sure it's installed).

# Example

```js
var denodeify = require('pdenodeify');
var readFile = denodeify(require('fs').readFile);

readFile('path/to/file').then(function(data) {
  // Use data
});
```

# License

MIT
