@function can-route.deparam deparam
@parent can-route.static

@description Extract data from a route path.

@signature `route.deparam(url)`

  Extract data from a url fragment, creating an object representing its values. The url fragment could be a [location.hash](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/hash) or [location.search](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/search).

  ```js
  import {route} from "can";

  const result = route.deparam("page=home");
  console.log( result.page ); //-> "home"
  ```
  @codepen

  @param {String} url A route fragment to extract data from.
  @return {Object} An object containing the extracted data.

@body

## Use

`route.deparam` creates a data object based on the query string passed into it. This is useful to create an object based on the `location.hash`.

```js
import {route} from "can";

const result = route.deparam("id=5&type=videos"); 
console.log( result ); //-> { id: 5, type: "videos" }
```
@codepen

It's important to make sure the hash or exclamation point is not passed to `route.deparam` otherwise it will be included as a property.

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

route.data = {};
route.register("")
route.data.id = 5;  // location.hash -> #!id=5
route.data.type = "videos"; // location.hash -> #!&id=5&type=videos

route.start();

// setting datatype is synchronous
setTimeout(() => {
  const result = route.deparam(location.hash);
  console.log( result ); //-> { #!: "", id: "5", type: "videos" }
}, 300);
</script>
```
@codepen

`route.deparam` will try and find a matching route and, if it does, will deconstruct the URL and parse out the key/value parameters into the data object.

```js
import {route} from "can";

route.register("{type}/{id}");

const result = route.deparam("videos/5");
console.log( result ); //-> { id: 5, type: "videos" }
```
@codepen
