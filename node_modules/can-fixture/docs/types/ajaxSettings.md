@typedef {Object} can-fixture/types/ajaxSettings ajaxSettings
@parent can-fixture.types

@description An object used to match incoming [can-fixture/types/request] objects.

@type {Object}

  This object is used to match values on [can-fixture/types/request] objects.
  If there's a match, the fixture handler provided with the
  [can-fixture/types/ajaxSettings] will be invoked.

  If a property on an `ajaxSettings` is not provided, all request values
  will be matched for that property.

  For example,
  you can match all `GET` requests, no matter what `url` is passed like:

  ```js
  import {fixture, ajax} from "can";

  fixture({method: "GET"}, () => {
    return "success";
  });

  // randomly selects '/example', '/canJS', or '/random'.
  const url = fixture.rand(["/example", "/canJS", "/random"], 1);

  ajax( {url} ).then(result => {
    console.log( result ); //-> "success"
  });
  ```
  @codepen
  @highlight 3-5

@option {String} url The requested url with anything after the querystring taken off in `GET` and `DESTROY` method requests.  For example, you can't match:

  ```js
  fixture({method: "GET", url: "/things?name=Justin"});
  ```

  Instead write:

  ```js
  import {fixture, ajax} from "can";

  fixture({method: "GET", url: "/things", data: {name: "Justin"}}, () => {
    return "success";
  } );

  // can also be: `$.get("/things", {name: "Justin"})`
  // attempting to just get from the endpoint "/things" won't work.
  ajax( {url: "/things?name=Justin"} ).then( result => {
    console.log( result ); //-> "success"
  } );
  ```
  @codepen
  @highlight 3-5

  The `url` can have templates like:

  ```js
  import {fixture, ajax} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture({method: "GET", url: "/things/{id}"}, () => {
    return "success";
  } );

  // attempting to just get from the endpoint "/things" won't work.
  ajax( {url: "/things/1"} ).then( result => {
    console.log( result ); //-> "success"
  } );
  ```
  @codepen
  @highlight 4-6

  The templated values get added to the [can-fixture/types/request] object's `data`.

  @option {String} [method] The method of the request. Ex: `GET`, `PUT`, `POST`, etc. Capitalization is ignored.
  @option {Object} [data] Match the data of the request. The data of the querystring or the data to `XMLHTTPRequest.prototype.send` is converted to a JavaScript objects with either `JSON.stringify` or [can-deparam].  The data must match part of the `request`'s data.
  @option {Boolean} [async] Write `true` to match asynchronous requests only.  
