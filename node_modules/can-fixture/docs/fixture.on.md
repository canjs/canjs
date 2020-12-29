@property {Boolean} can-fixture.on on
@parent can-fixture.properties

@description Turns all fixtures on or off. Defaults to `true` for on.

@signature `fixture.on`

  Turns all fixtures on or off. Defaults to `true` for on.

  ```js
  import {fixture, ajax} from "can";

  fixture( "GET /todos", () => {
    return "success";
  } );

  fixture.on = false; //-> AJAX requests will not be trapped

  ajax( {url: "/todos"} ).catch( error => {
      console.log("Couldn't connect.");
  } );
  ```
  @codepen
  @highlight 7

@body

## Alternatives

To remove a fixture you can also use `fixture(ajaxSetting, null)`. This method is elaborated further in [can-fixture].

```js
import {fixture, ajax} from "can";

fixture( "GET /todos", () => {
  return "success";
} );

fixture( "GET /todos", null );

ajax( {url:"/todos"} ).catch( error => {
    console.log("Couldn't connect.");
} );
```
@codepen
@highlight 7
