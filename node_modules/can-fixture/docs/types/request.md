@typedef {Object} can-fixture/types/request request
@parent can-fixture.types

@description An object with easily digestible values derived from the mock XHR object.  

@type {Object}

  This object is passed to a [can-fixture.requestHandler]
  and can be used to determine the response.

  ```js
  import {fixture, ajax} from "can";

  fixture( "GET /todos/{id}", ( request, response ) => {
    console.log( request.url );     //-> "todos/5"
    console.log( request.method );  //-> "get"
    console.log( request.data );    //-> {id: "5", include: ["owner"]}
    console.log( request.headers ); //-> {Accept: "*/*", X-Requested-With: "XMLHttpRequest"}
    console.log( request.async );   //-> false
    return;
  } );

  ajax( {url: "/todos/5?include[]=owner"} );
  ```
  @codepen

  @option {String} url The requested url with anything after the querystring taken off in `GET` and `DESTROY` method requests.
  @option {String} method The method of the request. Ex: `GET`, `PUT`, `POST`, etc.
  @option {Object} data The data of the querystring or the data to `XMLHTTPRequest.prototype.send` converted back to JavaScript objects with either `JSON.stringify` or [can-deparam].
  @option {Object} headers Headers added to the XHR object with `XMLHTTPRequest.prototype.setRequestHeader`.
  @option {Boolean} async `true` if the request was a synchronous request.
  @option {XMLHTTPRequest} xhr The mock xhr request.
