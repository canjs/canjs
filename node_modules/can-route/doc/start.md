@function can-route.start start
@parent can-route.static
@release 3.3

@description Initializes the two way relationship between the url and route.data.

@signature `route.start()`

  Sets up the two-way binding between the hash and the [can-route.data can-route.data] and sets the route.data to its initial values. If URL data and route.data set at the same time the URL data will take precedence.

  ```html
  <mock-url></mock-url>
  <script type="module">
  import "//unpkg.com/mock-url@^5.0.0";
  import {route} from "can";

  route.register( "{page}", { page: "home" } );
  route.start();
  console.log( route.data.page ); // -> "home"
  </script>
  ```
  @codepen
  @highlight 7

  @return {can-route} The can-route object.

@body

## Use

After setting all your routes, call `route.start()`.

```js
import {route} from "can";

route.register( "overview/{dateStart}-{dateEnd}" );
route.register( "{type}/{id}" );
route.start();

console.log( route.data ); // -> {
//   dateEnd: undefined,
//   dateStart: undefined,
//   id: undefined,
//   type: undefined
// }
```
@codepen
