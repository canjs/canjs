@property {Array} can-fixture.fixtures fixtures
@parent can-fixture.properties
@hide

@signature `fixture.fixtures`

  The list of currently active fixtures.

  ```js
  import {fixture} from "can";

  fixture( "GET /todos", {} );

  console.log( fixture.fixtures ); //-> [{
  //   fixture() { return data };
  //   type: "GET",
  //   url: "/todos",
  // }]
  ```
  @codepen
  