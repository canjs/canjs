@page guides/recipes/cta-bus-map CTA Bus Map
@parent guides/recipes/intermediate

@description This intermediate guide walks you through showing Chicago Transit Authority (CTA) bus locations on a Google Map.
You'll learn how to create a [can-stache-element StacheElement] that integrates with 3rd party widgets.

@body

In this guide, you will learn how to:

- Use `fetch` to request data.
- Create a custom element that wraps a google map.
- Add markers to the google map.

The final widget looks like:

<p class="codepen" data-height="560" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="LYPNNxw" style="height: 560px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CTA Bus Map (Medium)">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPNNxw/">
  CTA Bus Map (Medium)</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. __Click__ a _Bus Route_.
2. __Explore__ the markers added to the Google Map showing the bus locations for that route.
3. __Click__ the _route name overlay_ to refresh the bus locations.

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLICKING THE “EDIT ON CODEPEN” BUTTON IN THE TOP RIGHT CORNER OF THE FOLLOWING EMBED:__:

<p class="codepen" data-height="268" data-theme-id="0" data-default-tab="js" data-user="bitovi" data-slug-hash="rNBeeJo" style="height: 268px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CTA Bus Map (Medium) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/rNBeeJo/">
  CTA Bus Map (Medium) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

### What you need to know

There's nothing to do in this step. The CodePen is already setup with:

- A _basic_ CanJS setup.
- A promise that resolves when the Google Maps has loaded.
- Some variables useful to make requests to get bus routes and locations.

Please read on to understand the setup.

__A Basic CanJS Setup__

- A basic CanJS setup uses properties within a [can-stache-element StacheElement] to manage the
  behavior of a View as follows:

  ```js
  import { StacheElement } from "can";

  // Define the Component
  class MyComponent extends StacheElement {
    // The component View
    static view = ``;

    // The component properties
    static props = {};
  }

  // The component custom tag
  customElements.define("my-component", MyComponent);
  ```
- The component can be rendered by adding the custom tag to the HTML:
  ```html
  <my-component></my-component>
  ```

- CanJS [can-stache-element StacheElement] uses [can-stache] to render data in a template
  and keep it live. Templates can be authored in the component's `view` property like:

  ```js
  import { StacheElement } from "can";

  // Define the Component
  class MyComponent extends StacheElement {
    static view = `TEMPLATE CONTENT`;
  }

  customElements.define("my-component", MyComponent);
  ```

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] "magic tags" to insert data into
  the HTML output like:

  ```js
  import { StacheElement } from "can";

  // Define the Component
  class MyComponent extends StacheElement {
    static view = `{{something.name}}`;
  }

  customElements.define("my-component", MyComponent);
  ```

- Mount the component in the HTML:

  ```html
  <my-component></my-component>
  ```

__Loading Google Maps API__

The following loads [Google Maps API](https://developers.google.com/maps/documentation/javascript/):

@sourceref ./1-setup.html
@highlight 3-10,only

It creates a global `googleAPI` promise that resolves when Google Maps is ready.  You can use it like:

```js
googleAPI.then(function() {
	new google.maps.Map( /* ... */ );
})
```

__Loading CTA Bus Data__

This app needs to make requests to the [http://www.ctabustracker.com/](http://www.ctabustracker.com/) API.  The
`ctabustracker` API is hosted at:

```js
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
```

The API needs a token as part of the request:

```js
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
```

However, the API does __not__ support cross origin requests.  Therefore, we will request data using
a proxy hosted at:

```js
const proxyUrl = "https://can-cors.herokuapp.com/"
```

With that proxy, the requests for this app will look like:

```js
fetch("https://can-cors.herokuapp.com/"+
    "http://www.ctabustracker.com/bustime/api/v2/"+
    "getroutes"+
    "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json")
```

## Change the app title ##

### The problem

In this section, we will:

- Explore the relationship between component Props and View.
- Make it so the title of the page changes from `<h1>YOUR TITLE HERE</h1>`
  to `<h1>CHICAGO CTA BUS TRACKER</h1>`.
- Let us adjust the title simply by changing the property like:
  ```js
  element.title = "TITLE UPDATED"
  ```

![YOUR TITLE HERE](../../../docs/can-guides/commitment/recipes/cta-bus-map/1-app-title.png)


### What you need to know


- A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  import { StacheElement } from "can";

  class MyComponent extends StacheElement {
    static view = `{{this.someValue}}`;
  }

  customElements.define("my-component", MyComponent);
  ```

  These values come from the component properties.

- The StacheElement props allows you to define a property with a [can-observable-object/define/default] value like:

  ```js
  import { StacheElement } from "can";

  class MyComponent extends StacheElement {
    static view = `{{this.someValue}}`;

    static props = {
      someValue: {
        default: "This string"
      }
    }
  }

  customElements.define("my-component", MyComponent);
  ```

### How to verify it works

Run the following in the `Console` tab:

```js
document.querySelector('my-component').someValue = "TITLE UPDATED";
```

You should see the title update.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 13,39-41,only


## List bus routes ##

### The problem

In this section, we will:

- Load and list bus routes.
- Show `<p>Loading routes…</p>` while loading routes.

![List Bus Routes](../../../docs/can-guides/commitment/recipes/cta-bus-map/2-list-routes.png)


We will do this by:

- Store the promise of bus routes in a `routesPromise` property.
- `routesPromise` will resolve to an `Array` of the routes.
- Loop through each route and add an `<li>` to the page.
- Show the loading message while `routesPromise` is pending.


### What you need to know

- The [can-observable-object/define/default] property definition can return the initial value of a property like:
  ```js
  import { ObservableObject } from "can"

  class AppViewModel extends ObservableObject {
    static props = {
      myProperty: {
        get default() {
          return new Promise( /* ... */ );
        }
      }
    };
  }

  new AppViewModel().myProperty //-> Promise
  ```
- The [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is an easy way to make requests
  to a URL and get back JSON.  Use it like:

  ```js
  fetch(url).then(function(response) {
    return response.json();
  }).then(function(data) {

  });
  ```

  You'll want to use the `proxyUrl` and `getRoutesEnpoint` variables to make a request for
  CTA bus routes. The routes service returns data like:

  ```js
  {
    "bustime-response": {
      "routes": [
        {
          "rt": "1",
          "rtnm": "Bronzeville/Union Station",
          "rtclr": "#336633",
          "rtdd": "1"
        },
        // ...
      ]
    }
  }
  ```

  Make sure that `routesPromise` will be a Promise that resolves to an array of routes.

- Promises can transform data by returning new values.  For example if `outerPromise`
  resolves to `{innerData: {name: "inner"}}`, `resultPromise` will resolve to
  `{name: "inner"}`:
  ```js
  const resultPromise = outerPromise.then(function(data) {
    return data.innerData;
  });
  ```

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
- Use [can-stache.helpers.for-of {{# for(of) }}] to do looping in [can-stache].
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{# if(somePromise.isPending) }}`.
  - Loop through the resolved value of the promise like: `{{# for(item of somePromise.value) }}`.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-list-routes.js
@highlight 14,17-23,39-45,only


## Pick a route and log bus locations ##

### The problem

In this section, we will:

- Highlight the selected bus route after a user clicks it.
- Log the bus (vehicle) locations for the selected route.

<img src="../../../docs/can-guides/commitment/recipes/cta-bus-map/3-pick-route.png" width="857px"/>

We will do this by:

- Listening to when a user clicks one of the bus routes.
- Adding `active` to the class name of that route's `<li>` like: `<li class="active">`.
- Making the request for the vehicle locations of the selected route.

### What you need to know

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `doSomething()` when the `<div>` is clicked:

  ```html
  <div on:click="doSomething()"> ... </div>
  ```
- Use the `"any"` type to define a property of indeterminate type:
  ```js
  import { ObservableObject, type } from "can";

  class AppViewModel extends ObservableObject {
    static props = {
      myProperty: type.Any  
    };
  }

  const viewModel = new AppViewModel({});
  viewModel.myProperty = ANYTHING;
  ```
  You'll want to store the selected bus route as `route`.
- Use `fetch(proxyUrl + getVehiclesEndpoint + "&rt=" + route.rt)`
  to get the vehicles for a particular route. If there is route data, it comes
  back like:
  ```js
  {
    "bustime-response": {
      "vehicle": [
        {
          "vid": "8026",
          "tmstmp": "20171004 09:18",
          "lat": "41.73921241760254",
          "lon": "-87.66306991577149",
          "hdg": "359",
          "pid": 3637,
          "rt": "9",
          "des": "74th",
          "pdist": 6997,
          "dly": false,
          "tatripid": "10002232",
          "tablockid": "X9  -607",
          "zone": ""
        },
        // ...
      ]
    }
  }
  ```

  If there is an error or no buses, the response looks like:

  ```js
  {
    "bustime-response": {
      "error": [
        {
          "rt": "5",
          "msg": "No data found for parameter"
        }
      ]
    }
  }
  ```


### How to verify it works

In the `Console` tab, when you click a bus route (like `Cottage Grove`), you should see
an array of bus routes.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-pick-route.js
@highlight 18,27-32,50,53-64,only


## Show when buses are loading and the number of buses ##
### The problem

In this section, we will:

- Show `<p>Loading vehicles…</p>` while bus data is being loaded.
- Show `<div class="error-message">No vehicles available for this route</div>` in the overlay
  if the request for bus data failed.  
- Show the number of buses inside the `<div class="gmap">` like: `Bus count: 20`.

<img src="../../../docs/can-guides/commitment/recipes/cta-bus-map/3b-bus-loading.png" width="427px"/>


We will do this by:

- Defining and setting a `vehiclesPromise` property.

### What you need to know

- In stache, you can check if a promise was rejected like:
  ```html
  {{# if(somePromise.isRejected) }}<p>...</p>{{/ if }}
  ```
- The [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) method returns a rejected promise with the provided `reason`:
  ```js
  const rejectedPromise = Promise.reject({message: "something went wrong"});
  ```
- Promises can transform data by returning new promises.  For example if `outerPromise`
  resolves to `{innerData: {name: "inner"}}`, `resultPromise` will be a rejected promise
  with the `reason` as `{name: "inner"}`:
  ```js
  const resultPromise = outerPromise.then(function(data) {
    return Promise.reject(data.innerData);
  });
  resultPromise.catch(function(reason) {
    reason.name //-> "inner"
  });
  ```

### The solution
Update the __JavaScript__ tab to:

@sourceref ./3b-bus-loading.js
@highlight 15,31-33,36,54,59,65,67,only


## Initialize Google Maps to show Chicago ##

### The problem

In this section, we will:

- Create a custom `<google-map-view/>` element that adds a google map.
- The google map should be added to a `<div class="gmap"/>` element.
- The google map should be centered on Chicago (latitude: `41.881`, longitude `-87.623`).

<img src="../../../docs/can-guides/commitment/recipes/cta-bus-map/4-init-gmaps.png" width="428px"/>

We will do this by:

- Creating a custom [can-stache-element StacheElement] that adds the `<div class="gmap"/>` to its HTML.
- Listens to when the element is in the page and creates a new google map.

### What you need to know

- Use [can-stache-element StacheElement] to create custom elements.  Start by extending
  `StacheElement` and then define the custom element with the constructor:

  ```js
  import { StacheElement } from "can";

  class GoogleMapView extends StacheElement {};
  customElements.define("google-map-view", GoogleMapView);
  ```

  Next, provide the HTML [can-stache] template with the content you want to insert within
  the element.

  ```js
  import { StacheElement } from "can";

  class GoogleMapView extends StacheElement {
    static view = `<div class="gmap"/>`;
  };
  customElements.define("google-map-view", GoogleMapView);
  ```

  Any values you want the custom element to hold must be defined on [can-stache-element/static.props props]. The following specifies a `map` property that can be any value:

  ```js
  import { StacheElement, type } from "can";

  class GoogleMapView extends StacheElement {
    static view = `<div class="gmap"/>`;

    static props = {
      map: type.Any
    };
  };
  customElements.define("google-map-view", GoogleMapView);
  ```

  An element reference [can be passed](https://canjs.com/doc/can-stache-bindings.html#Passanelementtothescope) to the component like the following:

  ```js
  import { StacheElement } from "can";

  class GoogleMapView extends StacheElement {
    static view = `<div this:to="this.mapElement" class="gmap"/>`;

    static props = {
      map: type.Any,
      mapElement: type.maybeConvert(HTMLElement)
    };
  }
  ```

  StacheElement's [can-stache-element/lifecycle-hooks.connected] hook can be used to know when the component's element is inserted into the document as follows:

  ```js
  import { StacheElement, type } from "can";

  class GoogleMapView extends StacheElement {
    static view = `<div this:to="this.mapElement" class="gmap"/>`;

    static props = {
      map: type.Any,
      mapElement: type.maybeConvert(HTMLElement)
    };

    connected() {
      this // -> the <google-map-view> element
      this.mapElement // -> the HTML element that renders the map
    }
  };
  customElements.define("google-map-view", GoogleMapView);
  ```

- To create a google map, use [new google.map.Map( /* ... */ )](https://developers.google.com/maps/documentation/javascript/reference) once the `googleAPI` has completed loading:

  ```js
  new google.maps.Map(gmapDiv, {
    zoom: 10,
    center: {
      lat: 41.881,
      lng: -87.623
    };
  })
  ```


### The solution
Update the __JavaScript__ tab to:

@sourceref ./4-init-gmaps.js
@highlight 9-30,59,only

## Set markers for vehicle locations ##

### The problem

In this section, we will:

- Show markers at bus locations when the user clicks a route.

We will do this by:

- Passing the `vehicles` from `vehiclePromise` to `<google-map-view>`.
- Listening when `vehicles` changes and creating google map `Marker`s.


### What you need to know

- [can-stache-bindings.toChild childProp:from] can set a component's property from another value:
  ```js
  <google-map-view aProp:from="scopeValue"/>
  ```
- The component can listen to events fired by its properties like:

  ```js
  import { StacheElement, type } from "can";

  class MyComponent extends StacheElement {
    static props = {
      // ...
      vehicles: type.Any
    };

    connected() {
      this.listenTo("vehicles", (ev, newVehicles) => {
        // ...
      });
    }
  }
  ```

- Use [new google.maps.Marker](https://developers.google.com/maps/documentation/javascript/reference#Marker) to
  add a marker to a map like:

  ```js
  new google.maps.Marker({
    position: {
      lat: parseFloat(vehicle.lat),
      lng: parseFloat(vehicle.lon)
    },
    map: this.map
  });
  ```

### The solution
Update the __JavaScript__ tab to:

@sourceref ./5-set-markers.js
@highlight 18,32-44,77,only

## Clean up markers when locations change ##

### The problem

In this section we will:

- Remove markers from previous routes.
- Update marker locations when the user clicks the overlay.

We will do this by:

- Storing the active list of markers
- Clearing the old active markers when the list of vehicles is updated.
- Calling `pickRoute` when someone clicks on the `route-selected` overlay.

### What you need to know


- Use `marker.setMap(null)` to remove a marker from a map.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-clean-markers.js
@highlight 30-35,37,73,only

## Result

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="560" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="LYPNNxw" style="height: 560px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CTA Bus Map (Medium)">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPNNxw/">
  CTA Bus Map (Medium)</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
