@property can-observable-array/array.static.convertsTo convertsTo
@parent can-observable-array/static

@description Static method to create an extended `ObservableArray` where each item is a specific type.

@signature `ObservableArray.convertsTo(Type)`

  Returns an `ObservableArray` constructor with its [can-observable-array/static.items static items] property set to the `Type` argument. This can be used to define the [can-observable-object#Typedproperties Typed properties].

  ```html
  <my-app></my-app>

  <script type="module">
  import { ObservableArray, ObservableObject, StacheElement, type } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      name: String
    }
  }

  class MyApp extends StacheElement {
    static props = {
      people: type.convert( ObservableArray.convertsTo(Person) )
    };

    static view = `
      {{# for(person of people) }}
        Welcome {{ person.name }}
      {{/ for }}
    `;
  }

  customElements.define('my-app', MyApp);

  const app = document.querySelector('my-app');
  app.people = [{ name: 'Matt' }];
  </script>
  ```
  @codepen

  @param {Object|Function} Type The underlying type that will be set on [can-observable-array/static.items].

  @return {can-observable-array} An extended ObservableArray with the [can-observable-array/static.items] converting to the provided type.
