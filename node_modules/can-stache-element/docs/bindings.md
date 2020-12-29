@function can-stache-element/lifecycle-methods.bindings bindings
@parent can-stache-element/lifecycle-methods 6

Programmatically instantiate a component

@signature `element.bindings([props])`

Create bindings between an element's properties and parent observables. This is useful when you:

- have complex logic for switching between different components (e.g. routing)

The following defines `HomePage` and `MyApp` components that sets up bindings between them:

```js
class HomePage extends StacheElement {
  static props = {
    pageId: Number
  }
}

class MyApp extends StacheElement {
  static view = `{{{component}}}`

  static props = {
    componentName: String,
    pageId: Number,

    component: {
      get() {
        if(componentName === "home") {
          return new HomePage().bindings({
            pageId: value.from(this, "pageId")
          });
        }
      }
    }
  }
}
```

@param {Object} [props] Child properties to bind to.
@return {can-stache-element} The StacheElement instance.

@body

## Use

Pass an object of properties to bind to the element. For example:

```js
import {StacheElement, ObservableObject, value} from "can";

const appVM = new ObservableObject({
  association: "friend"
});

class MyGreeting extends StacheElement {
  static view = `{{greeting}} {{subject}}`

  static props = {
    greeting: String,
    subject: String
  }
}
customElements.define("my-greeting", MyGreeting);

const myGreetingInstance = new MyGreeting().bindings({
  greeting: "Hello",
  subject: value.bind(appVM, "association")
}).render();

console.log( myGreetingInstance );
// logs <my-greeting>Hello friend</my-greeting>

console.log( myGreetingInstance.subject );
// logs "friend"
```
@codepen
