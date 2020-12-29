@function can-route.url url
@parent can-route.static

@description Creates a URL fragment based on registered routes given a set of data.

@signature `route.url(data [, merge])`

  Make a URL fragment that when set to window.location.hash will update can-route's properties to match those in `data`.

  ```js
  import {route} from "can";

  const url = route.url( { page: "home" } );
  console.log( url ); //-> "#!&page=home"
  ```
  @codepen

  @param {Object} data The data to populate the route with.
  @param {Boolean} merge Whether the given options should be merged into the current state of the route.
   ```js
   import {route} from "can";

   route.data.update( {type: "items", id: 5} );
   route.start();
 
   setTimeout(() => {
     const url = route.url( { page: "home" }, true );
     console.log( url ); //-> ""#!&type=test&id=5&page=home""
   }, 100);
   ```
   @codepen

  @return {String} The route URL and query string.

@body

## Use

`route.url` creates only the URL based on the route options passed into it.

```js
import {route} from "can";

const url = route.url( { type: "videos", id: 5 } );
console.log( url ); //-> "#!&type=videos&id=5"
```
@codepen

If a route matching the provided data is found the URL is built from the data. Any remaining data is added at the end of the URL as & separated key/value parameters.

```js
import {route} from "can";

route.register("{type}/{id}");

const video = route.url( { type: "videos", id: 5 } );
console.log( video ); //-> "#!videos/5"

const notNewVideo = route.url( { type: "video", id: 5, isNew: false } );
console.log( notNewVideo ); //-> "#!video/5&isNew=false"
```
@codepen