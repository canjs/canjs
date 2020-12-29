@module {Object} can-join-uris
@parent can-js-utilities
@collection can-infrastructure
@description Join together a URI path to a base.
@signature `joinURIs(base, href)`

Provides a convenient way to join together URIs handling relative paths.

```js
import joinURIs from "can-join-uris";

const base = "http://example.com/some/long/path";
const href = "../../images/foo.png";

const res = joinURIs( base, href );

console.log( res ); // -> http://example.com/images/foo.png
```

@param {String} base
@param {String} href
@return {String} The result of joining the two parts.
