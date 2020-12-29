@function can-route.param param
@parent can-route.static

@description Creates a url fragment that represents provided state.

@signature `route.param( data )`

  Parameterizes the raw JS object representation provided in data. Any remaining data is added at the end of the URL as &amp; separated key/value parameters.

  ```js
  import {route} from "can";

  route.register( "{type}/{id}" );

  const video = route.param( { type: "video", id: 5 } );
  console.log( video ); // -> "video/5"

  const notNewVideo = route.param( { type: "video", id: 5, isNew: false } );
  console.log( notNewVideo ); // -> "video/5&isNew=false"
  ```
  @codepen

  @param {data} object The data to populate the route with.
  @param {String} [currentRouteName] The current route name.  If provided, this can be used to "stick" the url to a previous route. By "stick", we mean that if there are multiple registered routes that match the `object`, the `currentRouteName` will be used.

  @return {String} The route, with the data populated in it.
