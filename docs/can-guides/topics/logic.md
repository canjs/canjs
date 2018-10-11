@page guides/logic Logic
@parent guides/essentials 9
@outline 2

@description Learn how to write observables in an organized, maintainable, and testable way.

@body

This guide will show you many techniques for writing the logic of a Component’s ViewModel so that it is easy to test and easy to maintain. It will show how to organize a ViewModel so that there is a clear purpose for each property and method, how to use derived properties to handle complex logic, how to write methods that are focused on doing a single thing, how to isolate side effects so they do not affect other logic and unit tests, and how to clean up event listeners to prevent memory leaks.

## Organize ViewModel properties

The organization of a Component’s ViewModel should convey which properties the ViewModel should change and where those changes should happen. We suggest organizing a ViewModel using the following sections:

* External stateful properties - Properties passed in to the component through [can-stache-bindings bindings].
* Internal stateful properties - Stateful properties "owned" by this component.
* Derived properties - Properties derived from stateful properties.
* Methods - Methods that change stateful properties and dispatch events that can be used in derived properties and side effects.
* Side effects - Side effects that depend on the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction#What_is_the_DOM) should be done in the `connectedCallback`.

Here is an example (click the "Run in your browser" button to see them in action):

```html
<viewmodel-organization heading:raw="ViewModel Organization Example"></viewmodel-organization>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "viewmodel-organization",

  view: `
    {{# if(heading) }}
      <h2>{{ heading }}</h2>
    {{/ if }}

    <p>
      {{# if(showExternalStatefulProperties) }}
        <span on:click="showExternalStatefulProperties = false">-</span>
      {{ else }}
        <span on:click="showExternalStatefulProperties = true">+</span>
      {{/ if }}
      External stateful properties
    </p>
    <p {{# unless(showExternalStatefulProperties) }}class="hidden"{{/ unless }}>
      Properties passed in to the component through <a href="//canjs.com/doc/can-stache-bindings.html">bindings</a>.
    </p>

    <p>
      {{# if(showInternalStatefulProperties) }}
        <span on:click="showInternalStatefulProperties = false">-</span>
      {{ else }}
        <span on:click="showInternalStatefulProperties = true">+</span>
      {{/ if }}
      Internal stateful properties
    </p>
    <p {{# unless(showInternalStatefulProperties) }}class="hidden"{{/ unless }}>
      Stateful properties "owned" by this component.
    </p>

    <p>
      {{# if(showDerivedProperties) }}
        <span on:click="hideDerivedProperties = true">-</span>
      {{ else }}
        <span on:click="hideDerivedProperties = false">+</span>
      {{/ if }}
      Derived properties
    </p>
    <p {{# unless(showDerivedProperties) }}class="hidden"{{/ unless }}>
      Properties derived from stateful properties. This is where most of the logic of this ViewModel should happen.
    </p>

    <p>
      <button on:click="toggleShowMethods()">
        {{# if(showMethods) }}Hide {{/ if }} Methods
      </button>
    </p>
    <p {{# unless(showMethods) }}class="hidden"{{/ unless }}>
      Methods can change stateful properties and dispatch events that can be used in derived properties and side effects.
    </p>

    <p><button on:click="showSideEffects()">Side Effects</button></p>
    <div class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-body">
            <p>The connectedCallback is where side effects should be handled. This will prevent them from happening during unit tests of the ViewModel.</p>
          </div>
        </div>
      </div>
    </div>
  `,

  ViewModel: {
    // EXTERNAL STATEFUL PROPERTIES
    heading: "string",

    // INTERNAL STATEFUL PROPERTIES
    showExternalStatefulProperties: { default: false },
    showInternalStatefulProperties: { default: false },
    hideDerivedProperties: { default: true },
    showMethods: { default: false },

    // DERIVED PROPERTIES
    get showDerivedProperties () {
      return !this.hideDerivedProperties;
    },

    // METHODS
    toggleShowMethods() {
      this.showMethods = !this.showMethods;
    },
    showSideEffects() {
      this.dispatch("show-side-effects");
    },

    // SIDE EFFECTS
    connectedCallback(element) {
      const $modal = $(element).find(".modal");

      this.listenTo("show-side-effects", () => {
        $modal.show();
      });

      this.listenTo(window, "click", () => {
        $modal.hide();
      });
    }
  }
});
</script>
<style>
viewmodel-organization {
  display: block;
}

span {
  cursor: pointer;
  font-weight: 700;
  padding: 4px;
}

span.right-arrow:after {
 content: "►";
}

span.down-arrow:after {
  content: "▼";
}

p.hidden {
  display: none;
}
</style>
```
@highlight 74-107,only
@codepen

## Derived properties

A derived property is a property whose value is not set by any other function; derived properties calculate their own value based on the values of other properties, changes to other properties, and other events.

Since the logic of a derived property is isolated to that property’s definition, it is much easier to understand and debug than a property that can be changed directly by other functions. Beacuse of this, **most of the logic of a ViewModel should be handled by derived properties**.

CanJS has two ways to create derived properties:

* [guides/logic#Derivepropertiesfromotherproperties get property behaviors] can derive their value from the value of other properties and the value they were last set to.
* [guides/logic#Derivepropertiesfromchangestoanotherproperty value property behaviors] can derive their value from more complex logic such as changes to other properties, dispatched events, and their own previously derived values.

The sections below show how to use these property behaviors to build maintainable, testable ViewModels.

### Derive properties from other properties

Getters in CanJS can be used to derive a value based on the _current_ value of the properties read by the getter, each time the getter runs.

> Getters will run when the property is read, and automatically re-run whenever one of the properties read by the getter changes (if the property defined by the getter is bound).

Getters can be used to replace imperative logic like this:

```html
<a-pp></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
	<p>First: <input value:from="first" on:change="setFirst(scope.element.value)"></p>
	<p>Last: <input value:from="last" on:change="setLast(scope.element.value)"></p>
    <p>{{ name }}</p>
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    first: { default: "Kevin" },
    last: { default: "McCallister" },
	name: { default: "Kevin McCallister" },

    // METHODS
    setFirst(first) {
        this.first = first;
        this.name = `${first} ${this.last}`;
    },

    setLast(last) {
        this.last = last;
        this.name = `${this.first} ${last}`;
    }
  }
});
</script>
```
@highlight 21-29,only
@codepen

Using a derived property removes a lot of this boilerplate, and more importantly, isolates the logic for `name` to `name`’s property definiton.

```html
<a-pp></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    <p>First: <input value:bind="first"></p>
    <p>Last: <input value:bind="last"></p>
    <p>{{ name }}</p>
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    first: { default: "Kevin" },
    last: { default: "McCallister" },

    // DERIVED PROPERTIES
    get name() {
      return `${this.first} ${this.last}`;
    }
  }
});
</script>
```
@highlight 20-22,only
@codepen

### Side effects when derived properties change

When using derived properties like this, it can be tempting to add side effects inside of the getter. For example, if you wanted to keep a list of all of the values of `name` over time, you might try to do something like this:

```js
  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    first: { default: "Kevin" },
    last: { default: "McCallister" },
    names: { Default: DefineList },

    // DERIVED PROPERTIES
    get name() {
      const name = `${this.first} ${this.last}`;
      this.names.push( name );
      return name;
    }
  }
```
@highlight 8-12

Doing mutations like this can cause lots of problems, including inifinite loops and stack overflows.

<div class="deprecated warning">
Mutations should not be done in a getter.
</div>

Here is an example demonstrating the issues that can be caused by doing mutations in a getter:

```html
<a-pp></a-pp>
<script type="module">
import { Component, fixture, ajax } from "can";

fixture.delay = 500;

fixture({ url: "/api/{id}" }, (req, resp) => {
  const id = req.data.id;

  if (id < 50) {
    resp({ data: { id: id } });
  } else {
    resp(404, { message: "Not Found" });
  }
});

Component.extend({
  tag: "a-pp",

  view: `
    {{# if(data.error) }}
      <p class="error">Error: {{ data.error }}</p>
    {{ else }}
      <p>{{ data.id }}</p>
    {{/ if }}
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    id: { default: 0 },

    // DERIVED PROPERTIES
    data: {
      get(lastSet, resolve) {
        ajax({
          url: `/api/${this.id}`
        })
        .then(resp => {
          resolve(resp.data);
          this.id++;
        })
        .catch(err => {
          resolve({
            error: err.message
          })
        });
      }
    }
  }
});
</script>
```
@highlight 35-41,only
@codepen

This example uses an async getter to make an [can-ajax ajax] call to retrieve data for the current `id`. Once the response is received, the getter uses `resolve` to set the value of the property then increments `id`. Since this getter also reads `id` to create the URL for the ajax request, the getter immediately re-runs when `id` changes. This means that the getter will continue making ajax requests in an infinite loop.

In real-world applications, where a getter may depend on other derived values and have many dependencies, it can be much less obvious that this type of circular dependency exists. This is why **mutations should not be done in a getter.**

The next section will show how to handle situations like this where you need to update a derived value every time another property changes.

### Derive properties from _changes_ to another property

The [can-define.types.value value property behavior] is available for defining complex derived values that cannot be created using getters.

The `value` property behavior defines a property by **listening to** changes in other properties (and its own **last set** value) and calling **resolve** with new values.

Here is an example of using `value` to keep a list of all of the values of a derived `name` property over time:

```html
<a-pp></a-pp>
<script type="module">
import { Component, DefineList } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    <p>{{ name }}</p>

    <h2>Names:</h2>
    {{# for(name of names) }}
      <p>{{ name }}</p>
    {{/ for }}
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    first: { default: "Kevin" },
    last: { default: "McCallister" },

    // DERIVED PROPERTIES
    get name() {
      return `${this.first} ${this.last}`;
    },
    names: {
      value({ listenTo, resolve }) {
        let names = resolve( new DefineList([ this.name ]) );

        listenTo("name", (ev, name) => {
          names.push(name);
        });
      }
    }
  }
});
</script>
```
@highlight 23-34,only
@codepen

Using a `value` defition, allows `names` to update when `name` _changes_ and eliminates having the need for the side effect in the `name` getter. This makes it much easier to debug the `names` property and makes this code much easier to maintain.

### Derive properties from _changes_ to multiple other properties

The `value` property behavior can also be quite useful when a property needs to derive its value from changes to _multiple_ other properties. The `value` function can listen to changes in all of the necessary properties and resolve with the new value accordingly.

The following example has a slider for selecting a value within a range. The value should be updated:

- when the user selects a new value using the slider, set the `selectedValue` property to the new value or to the `minimum` or `maximum` if the new `selectedValue` is outside the range
- if the `minimum` changes, set the `selectedValue` property to the new `minimum` if it is currently lower
- if the `maximum` changes, set the `selectedValue` property to the new `maximum` if it is currently higher

This could be accomplished using a series of setters like in the code below. However, this scatters the mutations for `selectedValue` throughout the ViewModel:

```js
    // INTERNAL STATEFUL PROPERTIES
    selectedValue: {
      default: 100,
      set(val) {
        return val > this.maximum ? this.maximum :
               val < this.minimum ? this.minimum : val;
      }
    },
    minimum: {
      default: 50,
      set(min) {
        if (this.selectedValue < min) {
          this.selectedValue = min;
        }
        return min;
      }
    },
    maximum: {
      default: 150,
      set(max) {
        if (this.selectedValue > max) {
          this.selectedValue = max;
        }
        return max;
      }
    }
```
@highlight 5-6,13,22

Code like this becomes very hard to maintain as you cannot look at a the [can-define.types.propDefinition property definition] for `selectedValue` to understand how it works.

**Keeping all of the logic for a property within its property definition makes code much easier to maintain.**

This same functionality can be accomplished using a `value` definition:

```html
<range-slider></range-slider>
<script type="module">
import { Component } from "can";

const RangeSlider = Component.extend({
  tag: "range-slider",

  view: `
    <p>
      Min: <input type="range" min="0" max="200" valueAsNumber:bind="minimum"> {{ minimum }}
    </p>

    <p>
    Value: <input type="range" min="0" max="200" valueAsNumber:bind="selectedValue"> {{ selectedValue }}
    </p>

    <p>
      Max: <input type="range" min="0" max="200" valueAsNumber:bind="maximum"> {{ maximum }}
    </p>
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    minimum: { default: 50 },
    maximum: { default: 150 },

    // DERIVED PROPERTIES
    selectedValue: {
      value({ listenTo, lastSet, resolve }) {
        let latest = resolve(100);

        listenTo(lastSet, (val) => {
          latest = val;

          if (latest > this.maximum) {
            latest = this.maximum;
          }

          if (latest < this.minimum) {
            latest = this.minimum;
          }

          resolve(latest);
        });

        listenTo("minimum", (ev, min) => {
          if(latest < min) {
            resolve(min);
          }
        });

        listenTo("maximum", (ev, max) => {
          if(latest > max) {
            resolve(max);
          }
        });
      }
    }
  }
});
</script>
```
@highlight 28-58,only
@codepen

## Methods

Methods are a staple of [Object Oriented Programming](https://en.wikipedia.org/wiki/Object-oriented_programming). In CanJS applications, methods can be used to update ViewModel state when an event occurs.

### Use a method to set a property

Methods can be used to update stateful properties when an event occurs:

```html
<a-pp></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    <p>{{ day }}</p>

    <button on:click="resetDay()">Reset Day</button>
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    day: { default: "Sun" },

    // METHODS
    resetDay() {
      this.day = "Sun";
    }
  }
});
</script>
```
@highlight 11,19-21,only
@codepen

You can also do this using a "simple setter" directly in the view:

```js
  view: `
    <p>{{ day }}</p>

    <button on:click="day = 'Sun'">Reset Day</button>
  `
```
@highlight 4

To simplify debugging and make documentation easier, using methods may still be useful for your application.

### Use a method to set multiple properties

If you need to do update more than one stateful property when an event occurs, it can be tempting to generalize the event handler to do everything:

```js
  view: `
    {{# if(editing) }}
      <input value:bind="day">
    {{ else }}
      <p>{{ day }}</p>
    {{/ if }}

    <button on:click="resetDay()">Reset Day</button>
  `,

  ViewModel: {
    // INTERNAL STATEFUL PROPERTIES
    day: { default: "Sun" },
    editing: { default: true },

    // METHODS
    resetDay() {
      this.day = "Sun";
      this.editing = false;
    }
  }
```
@highlight 2-6,17-20

Functions like this become very hard to maintain as an application continues to grow because it is difficult to understand everything that will happen when the function is called.

Instead of using a single function to update multiple properties, [can-event-queue/map/map.dispatch] can be used to dispatch an event that other properties can then derive their values from:

```html
<a-pp day:raw="Wed" editing:raw="true"></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    {{# if(editing) }}
      <input value:bind="day">
    {{ else }}
      <p>{{ day }}</p>
    {{/ if }}

    <button on:click="resetDay()">Reset Day</button>
  `,

  ViewModel: {
    // DERIVED PROPERTIES
    day: {
      default: "Sun",
      value({ lastSet, listenTo, resolve }) {
        resolve( lastSet.value );

        listenTo("reset-day", () => {
          resolve("Sun");
        });
      }
    },

    editing: {
      default: false,
      value({ lastSet, listenTo, resolve }) {
        resolve( lastSet.value );

        listenTo("reset-day", () => {
          resolve(false);
        });
      }
    },

    // METHODS
    resetDay() {
      this.dispatch("reset-day");
    }
  }
});
</script>
<style>
input {
  width: 100px;
}

p {
  width: 100px;
  margin: 0;
  display: inline-block;
}
</style>
```
@highlight 25-27,36-38,43-45,only
@codepen

Using this technique, it is possible to read each property definition and know exactly how it will behave when this event occurs.

## DOM side effects

Side effects of properties changing that depend on the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction#What_is_the_DOM) being available should be handled in the [can-component/connectedCallback]. This will ensure that the ViewModel can be tested without the DOM.

The `connectedCallback` can use [can-event-queue/map/map.listenTo] to listen to dispatched events or property changes and perform necessary side effects. This example shows how to [play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) an `<audio>` element each time a button is pressed:

```html
<memory-game></memory-game>
<script type="module">
import { Component, DefineList } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "color-picker",

  view: `
    <button
      on:click="this.selectColor( this.color )"
      style="background-color: {{ this.color }}"
    ></button>
  `,

  ViewModel: {
    // EXTERNAL STATEFUL PROPERTIES
    color: "string"
  }
});

const Simon = Component.extend({
  tag: "memory-game",

  view: `
    <audio
      class="green"
      src="https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"
    ></audio>
    <audio
      class="red"
      src="https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"
    ></audio>
    <audio
      class="yellow"
      src="https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"
    ></audio>
    <audio
      class="blue"
      src="https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"
    ></audio>

    <div>
      <color-picker
        selectColor:from="selectColor"
        color:raw="green"
      ></color-picker>

      <color-picker
        selectColor:from="selectColor"
        color:raw="red"
      ></color-picker>
    </div>

    <div>
      <color-picker
        selectColor:from="selectColor"
        color:raw="yellow"
      ></color-picker>

      <color-picker
        selectColor:from="selectColor"
        color:raw="blue"
      ></color-picker>
    </div>

    <div class="pattern">
      {{# for(color of pattern) }}
        <span style="background-color: {{ color }}"></span>
      {{/ for }}
    </div>
  `,

  ViewModel: {
    // DERIVED PROPERTIES
    pattern: {
      value({ listenTo, resolve }) {
        const list = new DefineList();

        listenTo("color-change", (ev, color) => {
          list.push(color);
        });

        resolve(list);
      }
    },

    // METHODS
    selectColor(color) {
      this.dispatch("color-change", [ color ]);
    },

    // SIDE EFFECTS
    connectedCallback(el) {
      let playingSound = Promise.resolve(true);

      const play = (audioElement) => {
        playingSound = playingSound.then(() => {
          return new Promise(resolve => {
            audioElement.play().then(() => {
              audioElement.addEventListener("ended", () => {
                resolve(true);
              });
            });
          });
        });
      };

      const audioElements = {
        green: el.querySelector("audio.green"),
        red: el.querySelector("audio.red"),
        yellow: el.querySelector("audio.yellow"),
        blue: el.querySelector("audio.blue")
      };

      this.listenTo("color-change", (ev, color) => {
        play( audioElements[color] );
      });
    }
  }
});
</script>
<style>
color-picker button {
  width: 50px;
  height: 50px;
  margin: 0;
  padding: 0;
  border: 0;
}

.pattern span {
  display: inline-block;
  width: 23px;
  height: 23px;
}
</style>
```
@highlight 88-90,108-117,only
@codepen

## Clean up event listeners

In most cases, CanJS will automatically clean up event listeners, but there are a few situations where event listeners will need to be cleaned up manually. These are discussed in the following sections.

### Clean up listeners set up in connectedCallback

Any listeners set up using [can-event-queue/map/map.listenTo] in the `connectedCallback` will be cleaned up automatically when the component is torn down:

```js
ViewModel: {
  // SIDE EFFECTS
  connectedCallback() {
    // this will be cleaned up automatically
    listenTo("name", () => {
      // ...
    });
  }
}
```

This clean up is done by [can-event-queue/map/map.stopListening], which is the default teardown function. A function can be returned from the [can-component/connectedCallback] to provide a custom teardown function. When doing this, it is necessary to call [can-event-queue/map/map.stopListening] manually to clean up event listeners:

```js
ViewModel: {
  // SIDE EFFECTS
  connectedCallback() {
    listenTo("aProperty", () => {
      // ...
    });

    // custom teardown function
    return () => {
      // calling `stopListening` manually to clean up
      // event listeners set up with `listenTo`
      this.stopListening();
    };
  }
}
```

Event listeners set up with anything other than `listenTo`, as well as timers and anything else that needs to be cleaned up, can also be cleaned up in this teardown function:

```js
ViewModel: {
  // SIDE EFFECTS
  connectedCallback(el) {
    listenTo("aProperty", () => {
      // ...
    });

    const timeoutId = setInterval(() => {
      // ...
    });

    const jqueryEventHandler = () => {
      // ...
    };

    $(el).on("some-jquery-event", jqueryEventHandler);

    const vanillaEventHandler = () => {
      // ...
    };

    el.addEventListener("some-vanilla-event", vanillaEventHandler);

    return () => {
      // clean up `listenTo` event listeners
      this.stopListening();

      // clean up other event listeners
      $(el).off("some-jquery-event", jqueryEventHandler);
      el.removeEventListener("some-vanilla-event", vanillaEventHandler);

      // clean up timers
      clearTimeout( timeoutId );
    };
  }
}
```

### Clean up listeners in a `value` definition

The same technique can be used to clean up listeners set up in a [can-define.types.value] definition. A function returned from the `value` function will be called when that property is no longer bound.

**Event listeners set up using `listenTo` in a `value` definition will be cleaned up automatically. Other listeners should be cleaned up manually.**

Here is an example:

```js
    // DERIVED PROPERTIES
    namedCounter: {
      value({ listenTo, resolve }) {
        let count = 0;
        let name = this.name;

        resolve(`${name}: ${count}`);

        let timeoutId = setInterval(() => {
          count++;
          resolve(`${name}: ${count}`);
        }, 1000);

        listenTo("name", (ev, n) => {
          name = n;
          resolve(`${name}: ${count}`);
        });

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
```
