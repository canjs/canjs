@function can-route.isCurrent isCurrent
@parent can-route.static

@description Check if data represents the current route.

@signature `route.isCurrent(data [,subsetMatch] )`

  Compares `data` to the current route. Used to verify if an object is
  representative of the current route.

  The following example calls `route.isCurrent` with a single matching parameter when `route.data` has two properties. If `subsetMatch` is `false` or left default `route.isCurrent` won't try and match subsets.

  ```js
  import {route} from "can";

  route.data =  {page: "recipes", id: "5"}; // location.hash -> "#!&page=recipes&id=5"
  route.start();

  setTimeout(() => {
    const completeSet = route.isCurrent( {page: "recipes"} );
    console.log( completeSet ); //-> false

    const subSet = route.isCurrent( {page: "recipes"}, true );
    console.log( subSet ); //-> true
  }, 200);
  ```
  @codepen

  @param {Object} data Data to check against the current route.
  @param {Boolean} [subsetMatch] If true, `route.current` will return true
  if every value in `data` matches the current route data, even if
  the route data has additional properties that are not matched.  Defaults to `false`
  where every property needs to be present.
  @return {Boolean} Whether the data matches the current URL.
