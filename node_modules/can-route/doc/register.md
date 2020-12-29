@function can-route.register register
@parent can-route.static

@description Create a route matching rule.

@signature `route.register(rule [, defaults])`

  Create a url matching rule. Optionally provide defaults that will be applied to the underlying [can-route.data] when the rule matches.

  The following sets `route.data.page = "cart"` when the url is `#cart` and `route.data.page = "home"` when the url is `#`.

  ```html
  <mock-url></mock-url>
  <script type="module">
  import "//unpkg.com/mock-url@^5.0.0";
  import {route} from "can";

  route.register( "{page}", {page: "home"} );
  
  route.start();
  console.log( route.data.page ); // -> "home"
  route.data.page = "cart";
  </script>
  ```
  @codepen

  @param {String} rule the fragment identifier to match. The fragment identifier shouldn't contain characters that have special meaning: `/`, `{`, `}`, `?`, `#`, `!`, `=`, `[`, `]`, `&`), for example: `route.register("_||${foo}@^")` is a valid fragment. Identifiers wrapped in braces ( `{ }` ) are interpreted as being properties on can-route’s [can-route.data], these can contain (a-Z), typical property identifiers (`_`, `$`), and numbers after the first character. Examples:

   ```html
   <mock-url></mock-url>
   <script type="module">
   import "//unpkg.com/mock-url@^5.0.0";
   import {route} from "can";
  
   route.register( "{foo}" );
   route.register( "foo/{bar}" );
   console.log( route.data ); //-> {foo: undefined, bar: undefined}
   
   route.start();
   route.data.bar = "fie"; // Url hash changes to #!foo/fie
   </script>
   ```
   @codepen

  @param {Object} [defaults] An object of default values. These defaults are applied to can-route’s [can-route.data] when the route is matched.

  @return {Object} The internal route object. 
    Since `route.register` returns the route object, register calls can me chained.

    ```js
    route.register("todos/{todoId}")
      .register("users/{userId}");
    ```



