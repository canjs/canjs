@property {Object|HTMLElement} can-route.data data
@parent can-route.static

An observable key-value object used to cross bind to the url observable [can-route.urlData]. Set it to cross-bind a top level state object (Application ViewModel) to [can-route].

@type {Object} If `route.data` is set to a [can-reflect]ed observable object of
key-value pairs, once [can-route.start] is called, changes in `route.data`'s
properties will update the hash and vice-versa. `route.data` defaults to a [can-observable-object].

  ```html
  <mock-url></mock-url>
  <script type="module">
  import {ObservableObject, route} from "can";
  import "//unpkg.com/mock-url@^5.0.0/mock-url.mjs";

  route.data = new ObservableObject( {page: ""} );
  route.register( "{page}" );
  route.start();

  location.hash = "#!example";

  setTimeout(()=> {
    console.log( route.data ); //-> {page: "example"}
  }, 100);
  </script>
  ```
  @codepen


@type {HTMLElement} If `route.data` is set to an element, its
observable [can-view-model] will be used as the observable connected
to the browser's hash.

  <section class="warnings">
    <div class="deprecated warning">
    <h3>Deprecated</h3>
    <div class="signature-wrapper">
    <p>Assigning an <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement</a> to <code>route.data</code> has been deprecated in favor of setting it to an observable. If you have any further questions please refer to the [guides/routing Routing] guide.
    </div>
    </div>
  </section>

@body

For in-depth examples see the the [guides/routing Routing] guide.

## Use

`route.data` defaults to [can-observable-object], but `route.data` can be set to any observable. The following uses [can-define/map/map]:

```js
import { DefineMap, route } from "can/everything";

route.data = new DefineMap();
route.register( "{page}", { page: "home" } );
route.start();
console.log( route.data.page ) //-> "home"
```
@codepen
