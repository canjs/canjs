@page guides/logic Logic
@parent guides/essentials 9
@outline 2

@description Learn how to write observables in an organized, maintainable, and testable way.

@body

## Organize ViewModel properties

The organization of a ViewModel should convey which properties the ViewModel should change and where those changes should happen. This is how we suggest ViewModels be organized:

```js
ViewModel: {
  // EXTERNAL STATEFUL PROPERTIES
  todoId: "number",

  // INTERNAL STATEFUL PROPERTIES
  isEditing: { type: "boolean", default: false },

  // DERIVED PROPERTIES
  get something () {
    // ...
  },

  // METHODS
  updateTodo() {
    this.dispatch("update-todo");
  },

  // SIDE EFFECTS
  connectedCallback() {
    this.listenTo("update-todo", () => {
      new Todo().save();
    });
  }
}
```

Here is a breakdown of the different sections:

**External stateful properties** - Properties passed in to the component through [can-stache-bindings bindings]. These should not be changed by this ViewModel.

**Internal stateful properties** - Stateful properties "owned" by this component. These can be changed.

**Dervied properties** - Properties derived from stateful properties. This is where most of the logic of this ViewModel should happen.

**Methods** - These methods can change stateful properties and dispatch events that can be used in derived properties and side effects.

**Side effects** - The `connectedCallback` is where side effects should be handled. This will prevent them from happening during unit tests of the ViewModel.

## Derived properties

As mentioned above, most of the logic of a ViewModel should be handled by derived properties.

The sections below show different techniques for using derived properties in a maintainable, testable way.

### Derive properties from other properties

Getters in CanJS can be used to derive the value of a property based on the _current_ value of any other properties read by the getter.

> Getters will derive a value based on the _current_ value of the properties read by the getter, each time the getter runs.

To understand this, it is important to understand _when_ getters will run:

- if a property is unbound, its getter will run every time that property is read
- if a property is bound, its getter will run whenever one of the properties it reads changes

Here is a simple example of using a getter to create a derived property:

```html
<a-pp></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    <p>{{ name }}</p>
  `,

  ViewModel: {
    first: { default: "Kevin" },
    last: { default: "McCallister" },
    get name() {
      return `${this.first} ${this.last}`;
    }
  }
});
</script>
```
@highlight 15-17,only
@codepen

### Side effects when derived properties change

When using derived properties like this, it can be tempting to add side effects inside of the getter. For example, if you wanted to keep a list of all of the values of `name` over time, you might try to do something like this:

```js
  ViewModel: {
    first: { default: "Kevin" },
    last: { default: "McCallister" },
    names: { Default: DefineList },
    get name() {
      const name = `${this.first} ${this.last}`;
      this.names.push( name );
      return name;
    }
  }
```
@highlight 5-9

Doing mutations like this can cause lots of problems, including inifinite loops and stack overflows.

**Mutations should not be done in a getter.**

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
    id: { default: 0 },

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
@highlight 33-39,only
@codepen

This example uses an async getter to make an [can-ajax ajax] call to retrieve data for the current `id`. Once the response is received, the getter uses `resolve` to set the value of the property then increments `id`. Since this getter also reads `id` to create the URL for the ajax request, the getter immediately re-runs when `id` changes. This means that the getter will continue making ajax requests in an infinite loop.

In real-world applications, where a getter may depend on other derived values and have many dependencies, it can be much less obvious that this type of circular dependency exists. This is why **mutations should not be done in a getter.**

The next section will show how to handle situations like this where you need to update a derived value every time another property changes.

### Derive properties from _changes_ to another property

Getters are very powerful for deriving values from the value of other properties; however, they cannot derive values from

* changes to other values over time
* previous values returned by the getter

The [can-define.types.value value behavior] is available to make these more complex derived values possible.

> The `value` behavior defines a property by **listening to** changes in other properties (and its own **last set** value) and calling **resolve** with new values.

The value function will run:

- each time the property is read, if unbound
- once, if bound

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
    first: { default: "Kevin" },
    last: { default: "McCallister" },
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
@highlight 20-31,only
@codepen

Using a `value` defition, allows `names` to update when `name` _changes_ and eliminates having the need for the side effect in the `name` getter. This makes it much easier to debug the `names` property and makes this code much easier to maintain.

### Derive properties from _changes_ to multiple other properties

The `value` behavior can also be quite useful when a property needs to derive its value from changes to _multiple_ other properties. The `value` function can listen to changes in all of the necessary properties and resolve with the new value accordingly.

The following example has a slider for selecting a value within a range. The value should be updated:

- when the user selects a new value using the slider, set the `selectedValue` property to the new value or to the `minimum` or `maximum` if the new `selectedValue` is outside the range
- if the `minimum` changes, set the `selectedValue` property to the new `minimum` if it is currently lower
- if the `maximum` changes, set the `selectedValue` property to the new `maximum` if it is currently higher

This could be accomplished using a series of setters like in the code below. However, this scatters the mutations for `selectedValue` throughout the ViewModel:

```js
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
@highlight 4-5,12,21

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
    minimum: { default: 50 },
    maximum: { default: 150 },
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
@highlight 25-55,only
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
    <p>{{ foo }}</p>
    <button on:click="setFooToBar()">
      set foo to "bar"
    </button>
  `,

  ViewModel: {
    foo: { default: "abc" },
    setFooToBar() {
      this.foo = "bar";
    }
  }
});
</script>
```
@highlight 10,17-19,only
@codepen

You can also do this using a "simple setter" directly in the view:

```js
  view: `
    <p>{{ foo }}</p>
    <button on:click="foo = 'bar'">
      set foo to "bar"
    </button>
  `
```
@highlight 3

To simplify debugging and make documentation easier, using methods may still be useful for your application.

### Use a method to set multiple properties

If you need to do update more than one stateful property when an event occurs, it can be tempting to generalize the event handler to do everything:

```js
  view: `
    <p>{{ foo }}</p>
    <p>{{ baz }}</p>
    <button on:click="handleClick()">
      set foo to "bar" and baz to "quz"
    </button>
  `,

  ViewModel: {
    foo: { default: "abc" },
    baz: { default: "xyz" },
    handleClick() {
      this.foo = "bar";
      this.baz = "quz";
    }
  }
```
@highlight 4,12-15

Functions like this become very hard to maintain as an application continues to grow because it is difficult to understand everything that will happen when the function is called.

Instead of using a single function to update multiple properties, [can-event-queue/map/map.dispatch] can be used to dispatch an event that other properties can then derive their values from:

```html
<a-pp></a-pp>
<script type="module">
import { Component } from "can";

Component.extend({
  tag: "a-pp",

  view: `
    <p>{{ foo }}</p>
    <p>{{ baz }}</p>
    <button on:click="handleButtonClick()">
      set foo to "bar" and baz to "quz"
    </button>
  `,

  ViewModel: {
    foo: {
      value({ listenTo, resolve }) {
        resolve("abc");

        listenTo("button-click", () => {
          resolve("bar");
        });
      }
    },
    baz: {
      value({ listenTo, resolve }) {
        resolve("xyz");

        listenTo("button-click", () => {
          resolve("quz");
        });
      }
    },
    handleButtonClick() {
      this.dispatch("button-click");
    }
  }
});
</script>
```
@highlight 21-23,30-32,36,only
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
    pattern: {
      value({ listenTo, resolve }) {
        const list = new DefineList();

        listenTo("color-change", (ev, color) => {
          list.push(color);
        });

        resolve(list);
      }
    },

    selectColor(color) {
      this.dispatch("color-change", [ color ]);
    },

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
@highlight 85-87,104-113,only
@codepen

## Clean up event listeners

In most cases, CanJS will automatically clean up event listeners, but there are a few situations where event listeners will need to be cleaned up manually. These are discussed in the following sections.

### Clean up listeners set up in connectedCallback

Any listeners set up using [can-event-queue/map/map.listenTo] in the `connectedCallback` will be cleaned up automatically when the component is torn down:

```js
ViewModel: {
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
