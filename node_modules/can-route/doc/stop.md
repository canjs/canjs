@function can-route.stop stop
@parent can-route.static
@release 4.1

@description Stops listening to the [can-route.data] observable and tears down any setup bindings.

@signature `route.stop()`

  Stops listening to changes in the URL as well as the observable defined in [can-route.data], and removes the current binding.

  ```html
  <mock-url></mock-url>
  <script type="module">
  import "//unpkg.com/mock-url@^5.0.0";
  import {route} from "can";

  route.register("{page}", { page: "" });
  route.start();
  route.data.page = "home";

  // Changing the route is not synchronous
  setTimeout(() => {
    route.stop();
    route.data.page = "cart"; // hash is still "home"
    console.log( location.hash ) //-> "#!home"
  }, 1000);

  </script>
  ```
  @codepen

  @return {can-route} The can-route object.

@body

## Use

If you need to disconnect an observable from the URL, call stop.
To reconnect, call [can-route.start] again.

In the example shows a possible use reason for stopping can-route.
When the user logs out the page doesn't change, though the hash still updates.
Notice the `logout`/`login` functions start and stop route. When logged out you can't change the page,
even though the hash still updates.

```html
<mock-url></mock-url>
<my-app></my-app>
<script type="module">
import {StacheElement, route } from "can/everything";
import "//unpkg.com/mock-url@^5";

class MyApp extends StacheElement {
	static view = `
		<a href="{{ routeUrl(page="dashboard") }}">dashboard</a>
		<a href="{{ routeUrl(page="admin") }}">admin</a><br />
		{{# if (showLogin) }}
			<button on:click="login()">login</button>
		{{ else }}
			<button on:click="logout()">logout</button>
		{{/ if }}
		<h1>{{componentToShow}}</h1>
	`;

	static props = {
    routeData: {
      get default() {
        route.register("{page}");
        route.data.page = "admin";
        route.start();
        return route.data;
      }
    },
    get componentToShow() {
      return this.routeData.page;
    },
    get showLogin() {
      return this.routeData.page === "login";
    }
  };

  logout() {
  	route.data.page = "login";
  	route.stop();
  }
  
  login() {
  	route.start();
  	route.data.page = "admin";
  }
}

customElements.define("my-app", MyApp);
</script>
```
@codepen
