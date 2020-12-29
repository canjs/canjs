@function can-route.link link
@parent can-route.deprecated

@description Creates a string representation of an anchor link using data and the registered routes.

<section class="warnings">
  <div class="deprecated warning">
  <h3>Deprecated 4.4.1</h3>
  <div class="signature-wrapper">
  <p><code>route.link</code> has been deprecated in favor of <a href="can-stache-route-helpers.routeUrl.html" title="Returns a url using route.url.">can-stache-route-helpers.routeCurrent</a>.
  </div>
  </div>
</section>

@signature `route.link(innerText, data, props [, merge])`

  Make an anchor tag (`<a>`) that when clicked on will update can-route's properties to match those in `data`. Creates and returns an anchor tag with a href of the route attributes passed into it, as well as any properties desired for the tag.

  ```js
  import {route} from "can";

  const link = route.link( "My videos", { type: "videos" }, {}, false );
  console.log( link ); //-> '<a href="#!&type=videos">My videos</a>'
  ```
  @codepen

  @param {Object} innerText The text inside the link.
  @param {Object} data The data to populate the route with.
  @param {Object} props Properties for the anchor other than `href`.

  Other attributes besides href can be added to the anchor tag by passing in a data object with the attributes desired.

   ```js
   import {route} from "can";

   const link = route.link( 
     "My videos", 
     { type: "videos" },
     { className: "new" },
     false
   );
   console.log( link ); //-> '<a href="#!&type=videos" class="new">My videos</a>'
   ```
   @codepen

  @param {Boolean} [merge] Whether the given options should be merged into the current state of the route.
  @return {String} A string with an anchor tag that points to the populated route.

@body

## Use

It is possible to utilize the current route options when making anchor
tags in order to make your code more reusable. If merge is set to true,
the route options passed into `canRoute.link` will be passed into the
current ones.

```js
import {route} from "can";

location.hash = "#!type=videos";
const videoLink = route.link( "The zoo", { id: 5 }, {}, true );
console.log( videoLink ); //-> <a href="#!&type=videos&id=5">The zoo</a>

location.hash = "#!type=pictures";
const pictureLink = route.link( "The zoo", { id: 5 }, {}, true );
console.log( pictureLink ); //-> <a href="#!&type=pictures&id=5">The zoo</a>
```
@codepen
