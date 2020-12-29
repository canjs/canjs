@typedef {function} can-fixture.response response
@parent can-fixture.types

@description Used to detail a response.

@signature `response( [status], body, [headers], [statusText] )`

  Using the response function to return an unauthorized error.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/todos/{action}"},
    ( request, response, headers, ajaxSettings ) => {
      response(
        401,
        { message: "Unauthorized" },
        { "WWW-Authenticate": "Basic realm=\"myRealm\"" },
        "unauthorized"
      );
    }
  );

  // fixture response log {
  //   headers: {WWW-Authenticate: "Basic realm='myRealm'"},
  //   responseBody: {message: "Unauthorized"},
  //   statusCode: 401,
  //   statusText: "unauthorized"
  // }

  ajax( {type:"POST", url: "/todos/delete"} ).catch( error => {
    console.log(error); //-> {message: "Unauthorized"}
  } );
  ```
  @codepen

  The default `statusText` will be `"ok"` for statuses between `200` and `300` including `200`, and `304`. It will `"error"` for everything else.

  @param {Number} status The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or the raw string text that will be set as the responseText of the XHR object.
  @param {Object} headers An object of [HTTP response headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) and values.
  @param {String} statusText The status text of the response. Ex: ``"ok"`` for 200.

@signature `response( body )`

  Using the body object to return a single message.
  The status will be `200` and statusText will be `"ok"`.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/todos"}, ( request, response ) => {
    // Just body
    response( { message: "Hello World" } );
  });

  ajax( {url: "/todos"} ).then( result => {
    console.log( result ); //-> {message: "Hello World"}
  } );

  ```
  @codepen
  @highlight 5

  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or the raw string text that will be set as the responseText of the XHR object.

@signature `response( [status], body )`

  Response will always return a `401` status. The statusText will be `"error"`.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/todos"}, ( request, response ) => {
    // status and body
    response( 401, { message: "Unauthorized" } );
  });

  ajax( {url:"/todos"} ).catch( error => {
    console.log( error ); //-> 401, {message: "Unauthorized"}
  });

  ```
  @codepen
  @highlight 5

  @param {Number} status The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or the raw string text that will be set as the responseText of the XHR object.

@signature `response( body, [headers] )`

  Response will return the responseBody with custom headers.
  Because it's not set the `status` will default to `200`, and the `statusText` to `"ok"`.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/todos"}, ( request, response ) => {
    // body and headers
    response(
      "{\"message\":\"Unauthorized\"}",
      { "WWW-Authenticate": "Basic realm=\"myRealm\"" }
    );
  });

  ajax( {url: "/todos"} ).then( result => {
    console.log( result ); //-> {message: "Unauthorized"}
  } );

  ```
  @codepen
  @highlight 5-8

  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or the raw string text that will be set as the responseText of the XHR object.
  @param {Object} headers An object of [HTTP response headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) and values.

@signature `response( [status], body, [statusText] )`

  Response will return with the given `status` and `statusText` along with the `responseBody`.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/todos"}, ( request, response ) => {
    // status, body, statusText
    response( 401, "{\"message\":\"Unauthorized\"}", "unauthorized" );
  });

  ajax( {url: "/todos"} ).catch( error => {
    console.log(error); //-> {message: "Unauthorized"}
  } );

  ```
  @codepen
  @highlight 5

  @param {Number} status The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or the raw string text that will be set as the responseText of the XHR object.
  @param {String} statusText The status text of the response. Ex: ``"ok"`` for 200.
