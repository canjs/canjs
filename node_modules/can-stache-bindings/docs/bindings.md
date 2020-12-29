@module {Object} can-stache-bindings
@parent can-views
@collection can-core
@group can-stache-bindings.syntaxes Syntaxes
@package ../package.json
@outline 2

Listen to events and create one-way and two-way bindings.

@type {Object}

[can-stache-bindings] exports a binding object that can be added to [can-stache]
via [can-stache.addBindings] as follows:

  ```js
  import { stache, stacheBindings } from "can";

  stache.addBindings(stacheBindings);
  ```

  This is automatically done by [can-stache-element] and [can-component], so these bindings are
  typically available automatically in [can-stache].

@body

## Purpose

Bindings allow communication between html elements
and observables (e.g. [can-rest-model models], [can-stache-element/static.props], [can-component.prototype.ViewModel ViewModels], etc.).

Communication happens primarily by:

- Listening to events and calling methods (`<button on:click="this.doSomething()">`)
- Passing values (`<input value:from="this.name">`)

[can-stache-bindings] are designed to be:

- Powerful — Many different types of binding behaviors are possible:
  - Pass data down and update when the data changes: `<input value:from="this.name" />`
  - Pass data up and update when the data changes: `<input value:to="this.name" />`
  - Pass data up and update on a specified event: `<input on:input:value:to="this.name" />`
  - Update both directions: `<input value:bind="this.name" />`
  - Listen to events and call a method: `<input on:change="this.doSomething()" />`
  - Listen to events and set a value: `<input on:change="this.name = scope.element.value" />`
- Declarative — Instead of magic tags like `(click)` or `{(key)}`, it uses descriptive terms like [can-stache-bindings.event on:], [can-stache-bindings.toChild :from], [can-stache-bindings.toParent :to], and [can-stache-bindings.twoWay :bind] so beginners have an idea of what is happening.


[can-stache-bindings] is separate from [can-stache] as other view-binding syntaxes
have been supported in the past.

## Basic Use

The [can-stache-bindings] plugin provides useful [can-view-callbacks.attr custom attributes] for template declarative events, one-way bindings, and two-way
bindings on element attributes and the [can-view-scope scope].
Bindings communicate between two entities, typically a __parent__
entity and a __child__ entity.  Bindings look like:


- [can-stache-bindings.event on:event="key()"] for event binding.
- [can-stache-bindings.toChild prop:from="key"] for one-way binding to a child.
- [can-stache-bindings.toParent prop:to="key"] for one-way binding to a parent.
- [can-stache-bindings.twoWay prop:bind="key"] for two-way binding.

> __Note:__ DOM attribute names are case-insensitive, but [can-stache-element/static.props], [can-component.prototype.ViewModel], or [can-view-scope scope] properties can be `camelCase` and [can-stache stache] will encode them so they work correctly in the DOM.

The following are the bindings available within [can-stache]:

- __[can-stache-bindings.event event]__

  Binds to `childEvent` on `<my-element>` and calls
  `method` on the [can-view-scope scope] with the specified arguments:

  ```html
  <my-element on:childEvent="method('primitive', key, hash1=key1)" />
  ```

  If the element is a native HTML element, binds to `domEvent` on the element and calls
  `method` on the [can-view-scope scope] with the specified arguments:

  ```html
  <div on:domEvent="method('primitive', key, hash1=key1)" />
  ```

  You can also set a value. The following sets the `todo.priority` property to `1` when the button is clicked:

  ```html
  <button on:click="todo.priority = 1">Critical</button>
  ```

- __[can-stache-bindings.toChild one-way to child]__

  Updates `childProp` on `<my-element>` with `value` from the [can-view-scope scope]:

  ```html
  <my-element childProp:from="value" />
  ```

  > This can be read as “set `childProp` _from_ `value`”.

  If the element is a native HTML element, updates the `child-attr` attribute or property of the
  element with `value` in the [can-view-scope scope]:

  ```html
  <div child-attr:from="value" />
  ```

  > __Note:__ If the value being passed to the element is an object, changes to the object’s properties will still be visible to the element.   Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One-Way Binding With Objects].

## Register can-stache-bindings

If you are not using [can-stache-element] or [can-component], you can use [can-stache-bindings] in your templates by importing the `stacheBindings` module and registering it with [can-stache.addBindings] like so:

```js
import { stache, stacheBindings } from "can";

stache.addBindings(stacheBindings);
```

## Binding types

The following are the bindings that should be used with [can-stache]:

- __[can-stache-bindings.toParent one-way to parent]__

  Updates `value` in the [can-view-scope scope]  with `childProp`
  in `<my-element>`:

  ```html
  <my-element childProp:to="value" />
  ```

  > This can be read as "send `childProp` _to_ `value`".

  If the element is a native HTML element, it updates `value`
  in the [can-view-scope scope] with the `childAttr` attribute or property of the element.

  ```html
  <div childAttr:to="value" />
  ```

  > __Note:__ If the value being passed to the element is an object, changes to the object’s properties will still be visible to the element.   Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One-Way Binding With Objects].

- __[can-stache-bindings.twoWay two-way]__

  Updates `childProp` in `<my-element>` with `value` in the [can-view-scope scope] and vice versa:

  ```html
  <my-element childProp:bind="value" />
  ```

  Updates the `childAttr` attribute or property of the element with `value`
  in the [can-view-scope scope] and vice versa:

  ```html
  <div childAttr:bind="value" />
  ```

### Call a function when an event happens on an element

Use [can-stache-bindings.event] to listen to when an event is dispatched on
an element.  The following calls the `sayHi` method when the
button is clicked:

```html
<say-hi></say-hi>
<script type="module">
import { StacheElement } from "can";

class SayHi extends StacheElement {
    static view = `<button on:click="this.sayHi()">Say Hi</button>`;

    sayHi() {
        alert("Hi!");
    }
}
customElements.define("say-hi", SayHi);
</script>
```
@codepen
@highlight 6-10,only

The event, element, and arguments the event handler would be called with are available
via [can-stache/keys/scope].  The following prevents the form from being submitted
by passing `scope.event`:

```html
<my-demo></my-demo>
<script type="module">
import { ObservableArray, StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <form on:submit="this.reportData(scope.element, scope.event)">
            <input name="name" placeholder="name" />
            <input name="age" placeholder="age" />
            <button>Submit</button>
        </form>
        <h2>Data</h2>
        <ul>
            {{# for(submission of this.submissions) }}
                <li>{{ submission }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        submissions: {
            get default() {
                return new ObservableArray();
            }
        }
    };

    reportData(form, submitEvent) {
        submitEvent.preventDefault();
        const submission = JSON.stringify({
            name: form.name.value,
            age: form.age.value
        });
        this.submissions.push(submission);
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 7,29,only

### Call a function when an event is dispatched from a component

Use [can-stache-bindings.event] to listen to when an event is dispatched on
a [can-stache-element].

In the following example, `<my-demo>` listens to `number` events from `<random-number-generator>`:

```html
<my-demo></my-demo>
<script type="module">
import { ObservableArray, StacheElement } from "can";

class RandomNumberGenerator extends StacheElement {
    connected() {
        const interval = setInterval( () => {
            this.dispatch({ type: "number", value: Math.random() });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }
}

customElements.define("random-number-generator", RandomNumberGenerator);

class MyDemo extends StacheElement {
    static view = `
        <random-number-generator on:number="this.addNumber(scope.event.value)" />
        <h2>Numbers</h2>
        <ul>
            {{# for(number of this.numbers) }}
                <li>{{ number }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        numbers: {
            get default() {
                return new ObservableArray();
            }
        }
    };

    addNumber(number) {
        this.numbers.push(number);
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 8,21,only

Note that when properties are set on a [can-stache-element], these produce events too. In the following example, `<my-demo>` listens to
`number` produced when `<random-number-generator>`’s `number` property [can-observable-object/define/value changes]:


```html
<my-demo></my-demo>
<script type="module">
import { ObservableArray, StacheElement } from "can";

class RandomNumberGenerator extends StacheElement {
    static props = {
        number: {
            value({ resolve }) {
                const interval = setInterval( () => {
                    resolve(Math.random())
                }, 1000);

                return () => {
                    clearInterval(interval);
                };
            }
        }
    };
}

customElements.define("random-number-generator", RandomNumberGenerator);

class MyDemo extends StacheElement {
    static view = `
        <random-number-generator on:number="this.addNumber(scope.viewModel.number)" />
        <h2>Numbers</h2>
        <ul>
            {{# for(number of this.numbers) }}
                <li>{{ number }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        numbers: {
            get default() {
                return new ObservableArray();
            }
        }
    };

    addNumber(number) {
        this.numbers.push(number);
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 7-17,25,only

### Call a function when an event happens on a value in the scope (animation)

Use `on:event:by:value` to listen to an event and call a method.  This can often be useful for running animations.

The following listens to when a todo’s `complete` event is fired and calls `this.shake`. `this.shake` uses [anime](https://animejs.com/) to animate the `<div>`:

```html
<my-demo></my-demo>
<script src="//unpkg.com/animejs@3/lib/anime.min.js"></script>
<script type="module">
import { ObservableObject, StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        {{# for(todo of this.todos) }}
            <div on:complete:by:todo="this.shake(scope.element)">
                <input type="checkbox" checked:bind="todo.complete" />
                {{ todo.name }}
            </div>
        {{/ for }}
    `;

    static props = {
        todos: {
            get default() {
                return [
                    new ObservableObject({ name: "animate", complete: false }),
                    new ObservableObject({ name: "celebrate", complete: true })
                ];
            }
        }
    };

    shake(element) {
        anime({
            targets: element,
            translateX: [ 10, -10, 0 ],
            easing: "linear"
        });
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 9,27-33,only


### Update an element’s value from the scope

Use [can-stache-bindings.toChild] to:

- initialize an element’s property or attribute with the
  value from [can-stache stache’s] [can-view-scope scope], and
- update the element’s property or attribute with the scope value changes.

The following shows updating the _BIG RED BUTTON_’s `disabled` from
`this.enabled` in the scope. The [can-stache.helpers.not] helper
is used to inverse the value of `this.enabled`. Notice that as `this.enabled`
changes, `disabled` updates.


```html
<my-demo></my-demo>
<style>
.big-red {
	background-color: red; color: white;
	display: block; width: 100%; height: 50vh;
	cursor: pointer;
}
.big-red:disabled {
	background-color: #800000;
	color: black; cursor: auto;
}
</style>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <button on:click="this.enabled = true">Enable</button>
        <button on:click="this.enabled = false">Disable</button>

        <button
            disabled:from="not(this.enabled)"
            on:click="this.boom()"
            class="big-red">BIG RED BUTTON</button>
    `;

    static props = {
        enabled: false
    };

    boom() {
        alert("Red Alert!");
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 22,only
@codepen



### Update a component’s value from the scope

Use [can-stache-bindings.toChild] to:

- initialize a [can-stache-element]’s property value from [can-stache stache’s] [can-view-scope scope], and
- update the property when the scope value changes.

The following

```html
<my-demo></my-demo>
<style>
percentage-slider {
	border: solid 1px black;
	width: 100px; height: 20px;
	display: inline-block;
}
.percent { background-color: red; height: 20px; }
</style>
<script type="module">
import { StacheElement } from "can";

class PercentageSlider extends StacheElement {
    static view = `<div class="percent" style="width: {{ this.percent }}%"></div>`;

    static props = {
        percent: Number
    };
}

customElements.define("percentage-slider", PercentageSlider);

class MyDemo extends StacheElement {
    static view = `
        Percent Complete: <br/>
        <percentage-slider percent:from="this.value" />
        <br/>
        <button on:click="this.increase(-5)">-5</button>
        <button on:click="this.increase(5)">+5</button>
    `;

    static props = {
        value: 50
    };

    increase(amount) {
        const newValue = this.value + amount;
        if(newValue >= 0 && newValue <= 100) {
            this.value += amount;
        }
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 28,35,41,only
@codepen

[can-stache-bindings.toChild] can be used to pass the results of functions like `percent:from="this.method()"`.


### Pass a value from an element to the scope

Use [can-stache-bindings.toParent] to pass a value from an element to a value
on the scope.

The following updates `name` on the [can-stache-element] when the `<input>`’s _change_ event fires:


```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <p>Name: {{ this.name }}</p>
        <p>Update name when “change” fires: <input value:to="this.name" /></p>
    `;

    static props = {
        name: String
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 8,only
@codepen


The element value will be read immediately and used to set the scope value.  The following
shows that the default `name` will be overwritten to be an empty string because the input’s value
is read and overwrites the scope value:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <p>Name: {{ this.name }}</p>
        <p>Update name when “change” fires: <input value:to="this.name" /></p>
    `;

    static props = {
        name: "Justin"
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 8,12,only
@codepen

Use `on:event:elementPropery:to` to customize which event to listen to.  The following
switches to the `input` event:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <p>Name: {{ this.name }}</p>
        <p>Update name as you type: <input on:input:value:to="this.name" /></p>
    `;

    static props = {
        name: "Justin"
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 8,only
@codepen

> NOTE: Using `on:event:elementPropery:to` prevents initialization of the value until an event happens.
> You’ll notice the `name` is left as `"Justin"` until you start typing.

### Pass an element to the scope

You can use `this:to="key"` to pass an element reference to a value on the scope.

The following sets the `video` element as the `video` property so [play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) can be called when `isPlaying` is set to true:

```html
<video-player src="https://bit.ly/can-tom-n-jerry"></video-player>
<script type="module">
import { fromAttribute, StacheElement } from "can";

class VideoPlayer extends StacheElement {
    static view = `
        <video this:to="this.video">
            <source src="{{ this.src }}" />
        </video>
        <button on:click="this.togglePlay()">
            {{# if(this.isPlaying) }} Pause {{ else }} Play {{/ if }}
        </button>
    `;

    static props = {
        isPlaying: Boolean,
        src: {
          bind: fromAttribute,
          type: String
        },
        video: HTMLVideoElement
    };

    connected() {
        this.listenTo("isPlaying", ({ value }) => {
            if (value) {
                this.video.play();
            } else {
                this.video.pause();
            }
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
    }
}
customElements.define("video-player", VideoPlayer);
</script>
```
@highlight 7,21,27,only
@codepen

### Pass a value from a component to the scope

Use [can-stache-bindings.toParent] to pass a value from a component to a value
on the scope.

The following uses passes random numbers from `<random-number-generator>` to
`<my-demo>` using `number:to=""`

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement, type } from "can";

class RandomNumberGenerator extends StacheElement {
    static props = {
        number: {
            value({ resolve }) {
                const interval = setInterval( () => {
                    resolve(Math.random());
                }, 1000);
                return () => {
                    clearInterval(interval);
                };
            }
        }
    };
}

customElements.define("random-number-generator", RandomNumberGenerator);

class MyDemo extends StacheElement {
    static view = `
        <random-number-generator number:to="this.randomNumber" />
        <h1>Your random number is {{ this.randomNumber }}</h1>
    `;

    static props = {
        randomNumber: type.maybeConvert(Number)
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 24,only
@codepen

> NOTE: Just like passing an element value to the scope, passing a property value
> will overwrite existing scope values. You can use `on:event:key:to="scopeValue"`
> to specify the event to listen to.



### Keep a parent and child in sync

Use [can-stache-bindings.twoWay] to keep a parent and child value in sync.  Use [can-stache-bindings.twoWay]
to keep an element’s value in sync with a scope value.

The following keeps an `<input>`’s `.value` in sync with `this.name` in the scope:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <p>Name is currently: {{ this.name }}</p>
        <p><input value:bind="this.name" /></p>
    `;

    static props = {
        name: "Katherine Johnson"
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 8,only
@codepen

Use `on:event:key:bind="scopeValue"` to specify the event that should
cause the scope value to update. The following updates `this.name` when
the `<input>`’s `input` event fires:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <p>Name is currently: {{ this.name }}</p>
        <p><input on:input:value:bind="this.name" /></p>
    `;

    static props = {
        name: "Dorothy Vaughan"
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 8,only
@codepen

> NOTE: [can-stache-bindings.twoWay] always initializes parent and child values to match, even if `on:event:key:bind="scopeKey"`
> is used to specify the type of event. Read more about initialization on [can-stache-bindings.twoWay].

The following keeps [can-stache-element/static.props] in sync with a
scope value:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement, type } from "can";

class NameEditor extends StacheElement {
    static view = `
        <input placeholder="first" value:bind="first" />
        <input placeholder="last" value:bind="last" />
    `;

    static props = {
        first: String,
        last: String,
        get fullName() {
            return this.first + " " + this.last;
        },
        set fullName(newVal) {
            const parts = newVal.split(" ");
            this.first = parts[0] || "";
            this.last = parts[1] || "";
        }
    };
}

customElements.define("name-editor", NameEditor);

class MyDemo extends StacheElement {
    static view = `
        <p>Name is currently: {{ this.name }}</p>
        <p><name-editor fullName:bind="this.name" /></p>
        <p><button on:click="this.name = 'Captain Marvel'">Set name as Captain Marvel</button>
    `;

    static props = {
        name: "Carol Danvers"
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 30,only
@codepen


## Other Uses

The following are some advanced or non-obvious use cases.

### Pass values between siblings

Sometimes you have two sibling elements that need to communicate and creating
a value in the parent element is unnecessary.  Use [can-stache.helpers.let] to create a
variable that gets passed between both elements. The following creates an `editing` variable that
is used to communicate between `<my-drivers>` and `<edit-plate>`:

```html
<my-demo></my-demo>
<script type="module">
import { ObservableObject, StacheElement, type } from "can";

class MyDrivers extends StacheElement {
    static view = `
        <p>Select a driver:</p>
        <ul>
            {{# for(driver of this.drivers) }}
                <li on:click="this.selected = driver">
                    {{ driver.title }} {{ driver.first }} {{ driver.last }} - {{ driver.licensePlate }}
                </li>
            {{/ for }}
        </ul>
    `;

    static props = {
        drivers: {
            get default() {
                return [
                    new ObservableObject({ title: "Dr.", first: "Cosmo", last: "Kramer", licensePlate: "543210" }),
                    new ObservableObject({ title: "Ms.", first: "Elaine", last: "Benes", licensePlate: "621433" })
                ];
            }
        },
        selected: type.Any
    };
}

customElements.define("my-drivers", MyDrivers);

class EditPlate extends StacheElement {
    static view = `<input on:input="this.plateName = scope.element.value" value:from="this.plateName" />`;

    static props = {
        plateName: String
    };
}

customElements.define("edit-plate", EditPlate);

class MyDemo extends StacheElement {
    static view = `
        {{ let editing=undefined }}
        <my-drivers selected:to="editing" />
        {{# if(editing) }}
            <edit-plate plateName:bind="editing.licensePlate" />
        {{/ if }}
    `;
}
customElements.define("my-demo", MyDemo);
</script>
```
@highlight 10,44-48,only
@codepen


### Call a function when a custom event happens on an element

Custom events can be a great way to simplify complex DOM interactions.
[can-stache-bindings.event] listens to:

- Custom events dispatched by the browser (`element.dispatchEvent(event)`)
- Custom events registered by [can-dom-events].

<details>
<summary>
See an example of dispatching custom events.
</summary>

The following example shows a `<in-view>` component that dispatches a `inview` [custom event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) on elements when
they scroll into view. `<my-demo>` listens to those events and loads data with `<div on:inview="this.getData(item)">`.

```html
<my-demo></my-demo>
<style>
in-view {
    border: solid 1px black;
    display: block;
    height: 90vh;
    overflow: auto;
}
</style>
<script type="module">
import { ObservableObject, StacheElement } from "can";

const isVisibleSymbol = Symbol("isVisible");

class InView extends StacheElement {
    static view = `{{ content(context) }}`;

    connected() {
        function dispatchEvents() {
            // Get all visible elements
            const visible = Array.from(this.childNodes).filter( child => {
                return child.offsetTop > this.scrollTop
                    && child.offsetTop <= this.scrollTop + this.clientHeight;
            });
            // dispatch event on elements that have not
            // been dispatched
            visible.forEach( child => {
                if (!child[isVisibleSymbol]) {
                    child[isVisibleSymbol] = true;
                    child.dispatchEvent(new Event("inview"));
                }
            });
        }
        // Dispatch on visible elements right away
        dispatchEvents.call(this);
        // On scroll, dispatch
        this.listenTo(this, "scroll", dispatchEvents);
    }
}
customElements.define("in-view", InView);

class MyDemo extends StacheElement {
    static view = `
        {{< viewContent }}
            {{# for(item of this.items) }}
                <div on:inview="this.getData(item)">
                    {{ item.data }}
                </div>
            {{/ for }}
        {{/ viewContent }}
        <in-view content:from="viewContent" context:from="this" />
    `;

    static props = {
        items: {
            get default() {
                const items = [];
                for (let i = 0; i < 400; i++) {
                    items.push(new ObservableObject({ data: "unloaded" }));
                }
                return items;
            }
        }
    };

    getData(item) {
        item.data = "loading…"
        setTimeout(() => {
            item.data = "loaded";
        }, Math.random() * 1000);
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 30,46,only

</details>




<details>
<summary>
See an example of using custom events.
</summary>

CanJS has a special event registry - [can-dom-events]. You can add custom events to to this registry and
listen to those events with [can-stache-bindings.event].

CanJS already has several custom events:
- [can-dom-mutate/events/events domMutateEvents] - Listen to when an element is inserted or removed.
- [can-event-dom-enter] - Listen to when the _Enter_ key is pressed.

The following adds the enter and inserted events into the global registry and uses them:

```html
<my-demo></my-demo>
<script src="//unpkg.com/animejs@3/lib/anime.min.js"></script>
<style>
.light {position: relative; left: 20px; width: 100px; height: 100px;}
.red {background-color: red;}
.green {background-color: green;}
.yellow {background-color: yellow;}
</style>
<script type="module">
import { domEvents, domMutateDomEvents, enterEvent, StacheElement } from "can/ecosystem";

domEvents.addEvent(enterEvent);
domEvents.addEvent(domMutateDomEvents.inserted);

class MyDemo extends StacheElement {
    static view = `
        <div class="container" tabindex="0"
            on:enter="this.nextState()">
            Click me and hit enter.
            {{# switch(this.state) }}
                    {{# case("red") }}
                            <div class="light red"
                                on:inserted="this.shake(scope.element)">Red Light</div>
                    {{/ case }}
                    {{# case("yellow") }}
                            <div class="light yellow"
                                on:inserted="this.shake(scope.element)">Yellow Light</div>
                    {{/ case }}
                    {{# case("green") }}
                            <div class="light green"
                                on:inserted="this.shake(scope.element)">Green Light</div>
                    {{/ case }}
            {{/ switch }}
        </div>
    `;

    static props = {
        state: "red"
    };

    nextState() {
        const states = { red: "yellow", yellow: "green", green: "red" };
        this.state = states[this.state];
    }

    shake(element) {
        anime({
            targets: element,
            translateX: [ 10, -10, 0 ],
            easing: "linear"
        });
    }
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 10-13,18,23,27,31,only

</details>

### Using converters

Converters allow you to setup two-way translations between __child__ and __parent__ values.  These work
great with [can-stache-bindings.toParent] and [can-stache-bindings.twoWay] bindings.  

For example, [can-stache.helpers.not] can be used to update a scope value with the opposite of the
element’s `checked` property:

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <label>
            <input type="checkbox" checked:bind="not(this.activated)" />
            Disable
        </label>
    `;

    static props = {
        activated: true
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 8,only

[can-stache.helpers.not] comes with [can-stache], however [can-stache-converters] has a bunch of
other useful converters.  You can also create your own converters with [can-stache.addConverter].



### Binding to custom attributes (focused and values)

[can-attribute-observable] creates observables used for binding
element properties and attributes.

```html
<my-demo></my-demo>
<style>
:focus { background-color: yellow; }
</style>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
    static view = `
        <input
            on:input:value:bind="this.cardNumber"
            placeholder="Card Number (9 digits)" />
        <input size="4"
            on:input:value:bind="this.cvcNumber"
            focused:from="this.cvcFocus"
            on:blur="this.dispatch('cvcBlur')"
            placeholder="CVC" />
        <button
            focused:from="this.payFocus"
            on:blur="this.dispatch('payBlur')">Pay</button>
    `;

    static props = {
        cardNumber: String,
        cvcFocus: {
            value({ listenTo, resolve }) {
                listenTo("cardNumber", ({ value }) => {
                    if (value.length === 9) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
                listenTo("cvcBlur", () => {
                    resolve(false);
                });
            }
        },
        cvcNumber: String,
        payFocus: {
            value({ listenTo, resolve }) {
                listenTo("cvcNumber", ({ value }) => {
                    if (value.length === 3) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
                listenTo("payBlur", () => {
                    resolve(false);
                });
            }
        }
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 15,19,25-38,40-53,only

Read [can-attribute-observable] for a `values` example with `<select multiple>`.

### Bindings with objects

All of the bindings pass single references between __parent__ and __child__ values.  This means that objects that are passed are
passed as-is, they are not cloned or copied in anyway. And this means that changes to an object might be visible to either parent or
child.

The following shows passing a `name` object and changes to that object’s `first` and `last` are visible to the `<my-demo>` component:

```html
<my-demo></my-demo>
<script type="module">
import { ObservableObject, StacheElement } from "can";

class NameEditor extends StacheElement {
    static view = `
        <input on:input:value:bind="this.name.first" />
        <input on:input:value:bind="this.name.last" />
    `;

    static props = {
        name: ObservableObject
    };
}
customElements.define("name-editor", NameEditor);

class MyDemo extends StacheElement {
    static view = `
        <p>First: {{ this.name.first }}, Last: {{ this.name.last }}</p>
        <name-editor name:from="this.name" />
    `;

    static props = {
        name: {
            get default() {
                return new ObservableObject({ first: "Justin", last: "Meyer" });
            }
        }
    };
}
customElements.define("my-demo", MyDemo);
</script>
```
@codepen
@highlight 7-8,19-20,only

### Sticky Bindings

[can-stache-bindings.twoWay] bindings are _sticky_.  This means that if a __child__ value updates a __parent__ value and the
__parent__ and __child__ value do not match, the __parent__ value will be used to update the __child__ an additional time.

In the following example, `<parent-element>` always ensures that `parentName` is upper-cased.  If you type lower-case
characters in the input (example: `foo bar`), you’ll see that _Parent Name_, _Child Name_, and the input’s value are made upper-cased.

```html
<parent-element></parent-element>
<script type="module">
import { StacheElement, type } from "can";

class ChildComponent extends StacheElement {
    static view = `
        <p>Child Name: {{ this.childName }}</p>
        <input value:bind="this.childName" />
    `;

    static props = {
        childName: type.Any
    };
}

customElements.define("child-element", ChildComponent);

class ParentComponent extends StacheElement {
    static view = `
        <p>Parent Name: {{ this.parentName }}</p>
        <child-element childName:bind="this.parentName" />
    `;

    static props = {
        parentName: {
            default: "JUSTIN MEYER",
            set(newVal) {
                return newVal.toUpperCase();
            }
        }
    };
}
customElements.define("parent-element", ParentComponent);
</script>
```
@codepen
@highlight 7-8,20-21,27-29,only

This happens because after `parentName` is set, [can-bind] compares `parentName`’s '`FOO BAR` to `childName`’s
`foo bar`.  Because they are not equal, `childName` is set to `FOO BAR`.  Setting `childName` to `FOO BAR` will
also set the `<input>` to `FOO BAR`.

## How it works

Custom attributes are registered with [can-view-callbacks]. [can-stache] will call back these
handlers as it encounters these attributes.

For data bindings:

1. When those callbacks are encountered, an observable value is setup for
   both sides of the binding.  For example, `keyA:bind="keyB"` will create an observable
   representing the `keyA` value and an observable representing the `keyB` value.
2. Those observables are passed to [can-bind] which is used to update one value when the
   other value changes.

For component data bindings:

1. When a component is created, it processes all the binding attributes at the same time
   and it figures out the right-hand (scope) values first.
   This is so [can-stache-element] can create its properties with the values in the scope.  This avoids unnecessary changes
   and improves performance.

For event bindings:

1.  It parses the binding and attaches an event listener. When that event listener is called,
    it parses the right-hand expression and runs it.
