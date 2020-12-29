@module {function} can-stache
@parent can-views
@collection can-core
@release 2.1
@group can-stache.tags 0 Tags
@group can-stache.htags 1 Helpers
@group can-stache/expressions 2 Expressions
@group can-stache.static 3 Methods
@group can-stache/keys 4 Key Operators
@group can-stache.pages 5 Pages
@group can-stache.types 6 Types
@group can-stache/deprecated 7 Deprecated
@package ../package.json
@outline 2

@description Live binding templates.

@signature `stache([name,] template)`

  Processes the `template` string and returns a [can-stache.view view function] that can
  be used to create HTML elements with data.

  ```js
  import {stache} from "can";

  // parses the template string and returns a view function:
  const view = stache(`<h1>Hello {{this.subject}}</h1>`);

  // Calling the view function returns HTML elements:
  const documentFragment = view({subject: "World"});

  // Adds those elements to the page
  document.body.appendChild( documentFragment );

  console.log(document.body.innerHTML) //-> "<h1>Hello World</h1>";
  ```
  @codepen

  `stache` is most commonly used by [can-stache-element] to define a component's
  [can-stache-element/static.view]:

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      <h1>Hello {{this.subject}}</h1>
    `;

    static props = {
      subject: {default: "World"}
    };
  };
  customElements.define("my-demo", MyDemo);
  </script>
  ```

  Use [steal-stache] to import template view functions with [http://stealjs.com StealJS].

  Use [can-stache-loader](https://npmjs.com/package/can-stache-loader) to import template
  view functions with [webpack](https://webpack.js.org/).

  @param {String} [name] Provides an optional name for this type that will show up
  nicely in errors. Files imported with [steal-stache] will use their filename.

  @param {String} template The text of a stache template.

  @return {can-stache.view} A [can-stache.view view] function that returns
  a live document fragment that can be inserted in the page.

@body

## Purpose

Stache templates are used to:

- Convert data into HTML.
- Update the HTML when observable data changes.
- Enable [can-stache-element custom elements] and [can-stache-bindings event and data bindings].

Stache is designed to be:

- Safe. It does not use `eval` in __any__ form of its use.
- Easy for beginners to understand - It looks a lot like JavaScript.
  ```html
  {{# for( item of this.items ) }}
     <li>
       <span>{{ item.name }}</span>
       <label>{{ this.getLabelFor(item) }}</label>
     </li>
  {{/ }}
  ```
- Limited - Complex logic should be done in the `ViewModel` where it is more easily
  tested. Stache only supports a subset of JavaScript expressions.
- Powerful (where you want it) - Stache adds a few things JavaScript doesn't support
  but are very useful for views:
  - Stache tolerates undefined property values - The following will not error. Instead
    stache will simply warn:
    ```html
    {{this.property.does.not.exist}}
    ```
  - Stache is able to read from promises and other observables directly:
    ```html
    {{# if(promise.isPending) }} Pending {{/ if }}
    {{# if(promise.isRejected) }}
      {{ promise.reason.message }}
    {{/ if }}
    {{# if(promise.isResolved) }}
      {{ promise.value.message }}
    {{/ if}}
    ```
  - Stache has an `{{else}}` case for empty lists:
    ```html
    {{# for( item of this.items ) }}
       <li>{{ item.name }}</li>
    {{ else }}
       <li>There are no items</li>
    {{/ }}
    ```

## Basic Use

The following sections show you how to:

- [Load templates](#Loadingtemplates) so they be processed into views.
- [Writing values](#Writingvalues) within HTML to the page.
- Writing some HTML to the page or some other HTML to the page with [branch logic](#BranchingLogic).
- [Loop](#Looping) over a list of values and writing some HTML out for each value.
- [Listen to events](#Listeningtoevents) on elements.
- [Read and write](#Bindingtopropertiesandattributes) to element properties and attributes.
- Simplifying your templates with:
  - [Variables](#Creatingvariables)
  - [Helpers](#Creatinghelpers)
  - [Partials](#Creatingpartials)

### Loading templates

There are several ways to load a stache template:

- As a component's [can-stache-element/static.view].

  [can-stache-element] automatically processes strings passed to the `view` property as
  [can-stache] templates.

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      <h1>Hello {{ this.subject }}</h1>
    `;

    static props = {
      subject: "World"
    };
  };
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

- Programmatically.

  Create a [can-stache.view] function by importing stache and passing it a string.

  ```js
  import {stache} from "can";

  // parses the template string and returns a view function:
  const view = stache(`<h1>Hello {{ this.subject }}</h1>`);

  // Calling the view function returns HTML elements:
  const documentFragment = view({subject: "World"});

  // Adds those elements to the page
  document.body.appendChild( documentFragment );

  console.log(document.body.innerHTML) //-> "<h1>Hello World</h1>";
  ```
  @codepen

- Imported and pre-parsed.

  If you are using [http://stealjs.com StealJS] use [steal-stache]
  or if you are using [webpack](https://webpack.js.org/) use [can-stache-loader](https://npmjs.com/package/can-stache-loader) to
  create `.stache` file and import them like:

  ```js
  import {StacheElement} from "can";
  import view from "./my-component.stache";

  static MyComponent extends StacheElement {
    static view = view;
    static props = { ... }
  }

  customElements.define("my-component", MyComponent);
  ```

### Writing values

Use [can-stache.tags.escaped] to write out values into the page. The following
uses [can-stache.tags.escaped] to write out the `ViewModel`'s `subject`:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>Hello {{ this.subject }}</h1>
    `;

    static props = {
        subject: "World"
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

You can use [can-stache.tags.escaped] on any part of an HTML element except the tag name:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1 class='{{this.className}}' {{this.otherAttributes}}>
            Hello {{ this.subject }}
        </h1>
    `;

    static props = {
        subject: "World",
        className: "bigger",
        otherAttributes: "id='123'"
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

You can call methods within [can-stache.tags.escaped] too:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>Hello {{ this.caps( this.subject ) }}</h1>
    `;

    static props = {
        subject: "World"
    };

    caps(text) {
        return text.toUpperCase();
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

[can-stache.tags.escaped] will escape the value being inserted into the page. This
is __critical__ to avoiding [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks. However, if you have HTML to insert and you know it is safe, you can use [can-stache.tags.unescaped]
to insert it.

### Branching Logic

Stache provides severals helpers that help render logic conditionally.
For example, the following renders a sun if the `time` property equals `"day"`:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <p on:click="this.toggle()">
            Time:
            {{# eq(this.time,"day") }}
                SUN 🌞
            {{ else }}
                MOON 🌚
            {{/ eq }}
        </p>
    `;

    static props = {
        time: "day"
    };

    toggle() {
        this.time = (this.time === "day" ? "night" : "day");
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Notice that branching is performed using the [can-stache.tags.section],
[can-stache.helpers.else] and
[can-stache.tags.close] magic tags.  These define "sections" of content to render depending on
what the helper does.  We call these the _TRUTHY_ and _FALSY_ sections. In the example above, the [can-stache.helpers.eq] helper renders the _TRUTHY_ section (`SUN 🌞`) if `this.time` equals `"day"`. If
`this.time` is __not__ equal to `"day"`, the _FALSY_ section (`MOON 🌚`) is rendered.

The following helpers are used to render conditionally:


- [can-stache.helpers.if] - Renders the _TRUTHY_ section if the value is truthy.
  ```html
  EXAMPLE
  ```
- [can-stache.helpers.not] - Renders the _TRUTHY_ section if the value is falsy.
- [can-stache.helpers.eq] - Renders the _TRUTHY_ section all values are equal.
- [can-stache.helpers.and] - Renders the  _TRUTHY_ section if all values are truthy.
- [can-stache.helpers.or] - Renders the  _TRUTHY_ section if any value is truthy.
- [can-stache.helpers.switch] with [can-stache.helpers.case] - Renders the case section that matches the value.
- [can-stache.helpers.else] - Renders the  _FALSY_ section if the value is falsy.

These helpers (except for [can-stache.helpers.switch]) can be combined. For example,
we can show the sun if `this.time` equals `"day"` or `"afternoon"` as follows:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <p on:click="this.toggle()">
            Time:
            {{# or( eq(this.time,"day"), eq(this.time, "afternoon") ) }}
                SUN 🌞
            {{ else }}
                MOON 🌚
            {{/ eq }}
        </p>
    `;

    static props = {
        time: "day"
    };

    toggle() {
        this.time = (this.time === "day" ? "night" :
            (this.time === "night" ? "afternoon" : "day"));
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

> NOTE: One of stache's goals is to keep your templates as simple as possible.
> It might be better to create a `isSunUp` method in the ViewModel and use that instead.


### Looping

Use [can-stache.helpers.for-of] to loop through values. The following writes out the name of
each todo:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <ul>
            {{# for(todo of this.todos) }}
                <li>{{ todo.name }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        todos: {
            get default() {
                return [
                    {name: "Writing"},
                    {name: "Branching"},
                    {name: "Looping"}
                ]
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Use [can-stache/keys/scope scope.index] to access the index of a value in the
array. The following writes out the index with each todo's name:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <ul>
            {{# for(todo of this.todos) }}
                <li>{{scope.index}} {{ todo.name }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        todos: {
            get default() {
                return [
                    {name: "Writing"},
                    {name: "Branching"},
                    {name: "Looping"}
                ]
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Use [can-stache.helpers.for-of] to loop through key-value objects.

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <ul>
            {{# for(value of this.object) }}
                <li>{{scope.key}} {{ value }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        object: {
            get default() {
                return {
                    first: "FIRST",
                    value: "VALUE"
                };
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


### Listening to events

[can-stache-bindings.event] documents how you can listen to events on elements or
[can-stache-element/static.props props]. The following listens to `click`s on a button:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <button on:click="this.increment()">+1</button>
        Count: {{this.count}}
    `;

    static props = {
        count: 0
    };

    increment() {
        this.count++;
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

### Binding to properties and attributes

[can-stache-bindings] provides directional bindings to connect
values in stache to element [can-stache-element/static.props] or attributes.

This makes it easy to:

- Write out property values.

  The following updates the checkboxes `checked` property
  if the status is __not__ equal to 'critical':

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
      static view = `
          <input type="checkbox"
              checked:from="not( eq(this.status, 'critical') )" />
              Can ignore?

          <button on:click="this.status = 'critical'">Critical</button>
          <button on:click="this.status = 'medium'">Medium</button>
          <button on:click="this.status = 'low'">Low</button>
      `;

      static props = {
          status: "low"
      };
  };
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

- Update a value when an element property changes.

  The following updates the [can-stache-element/static.props] `name`
  when the `<input/>` changes:

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
      static view = `
          <input value:to="this.name" placeholder="name"/>
          Name: {{ this.name }}
      `;

      static props = {
          name: ""
      };
  };
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

[can-stache-bindings] supports a wide variety of different bindings.  Please checkout its documentation.

### Creating variables

The [can-stache.helpers.let] helper lets you create local variables.  For example, we can
create a `name` variable and write to that:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        {{ let name='' }}
        <input value:to="name" placeholder="name"/>
        Name: {{ name }}
    `;
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Variables can help you avoid unnecessary [can-stache-element/static.props]
like above. This is very handy when wiring [can-stache-element StacheElement]s within a
[can-stache.helpers.for-of] loop as follows:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        {{# for(todo of this.todos) }}
            {{ let locked=true }}
            <div>
                <p>
                    Locked:
                    <input type='checkbox' checked:bind="locked"/>
                </p>
                <p>
                    <input type='value' value:bind="todo.name" disabled:from="locked"/>
                </p>
            </div>
        {{/ for }}
    `;

    static props = {
        todos: {
            get default() {
                return [
                    {name: "Writing"},
                    {name: "Branching"},
                    {name: "Looping"}
                ];
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Currently, you can only create variables with [can-stache.helpers.let] for the entire template or
within [can-stache.helpers.for-of].  If there are other blocks where you would find this useful, please
let us know!

### Creating helpers

Helpers can simplify your stache code.  While CanJS comes with many helpers, adding
your own can reduce code. There are several different types of helpers, each with
different benefits.

__Global Helpers__

Use [can-stache.addHelper] to create a helper function that can be called from every
template. The following makes an `upperCase` helper:

```html
<my-demo></my-demo>
<script type="module">
import {stache, StacheElement} from "can";

stache.addHelper("upperCase", function(value){
	return value.toUpperCase();
})

class MyDemo extends StacheElement {
    static view = `
        <h1>Hello {{ upperCase(this.subject) }}</h1>
    `;

    static props = {
        subject: "World"
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Global helpers are easy to create and understand, but
they might create conflicts if another CanJS library defines
a similar helper.

__Component Methods__

Instead of creating a global helper, add your helper functions on
your component.  The following adds the `upperCase` method to the component.

```html
<my-demo></my-demo>
<script type="module">
import { stache, StacheElement, type } from "can";

class MyDemo extends StacheElement {
    static view = `
      <h1>Hello {{ this.upperCase(this.subject) }}</h1>
    `;

    static props = {
      subject: "World"
    };

    // View Helpers
    upperCase(value) {
      return value.toUpperCase();
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


<details>
<summary>Importing Functions</summary>

If you are using a module loader to import stache files, [can-view-import] can
be used to import a function to a [can-stache.helpers.let let variable]:

```html
<can-import from="app/helpers/upperCase"  module.default:to="upperCase"/>
{{upperCase(name)}}
```
</details>



### Creating partials

Partials are snippets of HTML that might be used several places. There are a few
ways of reusing HTML.

__Using Custom Elements__

You can always define and use [can-stache-element]. The following defines and uses
an `<address-view>` component:


```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class AddressView extends StacheElement {
    static view = `
        <address>{{this.street}}, {{this.city}}</address>
    `;
};

customElements.define("address-view", AddressView);

class MyDemo extends StacheElement {
    static view = `
        <h2>{{this.user1.name}}</h2>
        <address-view street:from="user1.street" city:from="user1.city"/>
        <h2>{{this.user2.name}}</h2>
        <address-view street:from="user2.street" city:from="user2.city"/>
    `;

    static props = {
        user1: {
            get default() {
                return {name: "Ramiya", street: "Stave", city: "Chicago"}
            }
        },
        user2: {
            get default() {
                return {name: "Bohdi", street: "State", city: "Chi-city"}
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

__Calling views__

You can create views programmatically with `stache`, make those views available
to another view (typically through the [can-stache-element/static.props]).  The following
creates an `addressView` and makes it available to `<my-demo>`'s [can-stache-element/static.view]
through the `addressView` property on the `ViewModel`:


```html
<my-demo></my-demo>
<script type="module">
import {stache, StacheElement} from "can";

const addressView = stache(`<address>{{this.street}}, {{this.city}}</address>`);

class MyDemo extends StacheElement {
    static view = `
        <h2>{{this.user1.name}}</h2>
        {{ addressView(street=user1.street city=user1.city) }}
        <h2>{{this.user2.name}}</h2>
        {{ addressView(street=user2.street city=user2.city) }}
    `;

    static props = {
      addressView: {
          get default() {
              return addressView;
          }
      },
      user1: {
          get default() {
              return {name: "Ramiya", street: "Stave", city: "Chicago"}
          }
      },
      user2: {
          get default() {
              return {name: "Bohdi", street: "State", city: "Chi-city"}
          }
      }
  };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

__Inline Partials__

If a single template needs the same HTML multiple places, use [can-stache.tags.named-partial {{<partialName}}]
to create an inline partial:


```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        {{< addressView }}
            <address>{{ this.street}}, {{ this.city }}</address>
        {{/ addressView }}
        <h2>{{ this.user1.name }}</h2>
        {{ addressView(user1) }}
        <h2>{{ this.user2.name }}</h2>
        {{ addressView(user2) }}
    `;

    static props = {
        user1: {
            get default() {
                return {name: "Ramiya", street: "Stave", city: "Chicago"}
            }
        },
        user2: {
            get default() {
                return {name: "Bohdi", street: "State", city: "Chi-city"}
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


## Other uses

### Reading promises

Stache can read "virtual" properties from [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and other types configured to work with
[can-reflect.getKeyValue].

The following "virtual" keys can be read from promises:

- `isPending` - `true` if the promise has not been resolved or rejected.
- `isResolved` - `true` if the promise has resolved.
- `isRejected` - `true` if the promise was rejected.
- `value` - the resolved value.
- `reason` - the rejected value.

```html
<my-demo></my-demo>
<script type="module">
import { StacheElement, type } from "can";

class MyDemo extends StacheElement {
    static view = `
        <div>
            {{# if(promise.isPending) }} Pending... {{/ if }}
            {{# if(promise.isRejected) }}
                Rejected! {{ promise.reason }}
            {{/ if }}
            {{# if(promise.isResolved) }}
                Resolved: {{ promise.value }}
            {{/ if}}
        </div>
        <button on:click="resolve('RESOLVED',2000)">Resolve in 2s</button>
        <button on:click="reject('REJECTED',2000)">Reject in 2s</button>
    `;

    static props = {
        promise: type.Any
    };

    resolve(value, time) {
        this.promise = new Promise((resolve)=>{
            setTimeout(()=>{
                resolve(value);
            },time)
        });
    }

    reject(value, time) {
        this.promise = new Promise((resolve, reject)=>{
            setTimeout(()=>{
                reject(value);
            },time)
        });
    }

    connected() {
        this.resolve("RESOLVED", 2000);
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

### Animation

Use [can-stache-bindings.event] to listen to an event and call an animation library.

The following listens to when a todo's `complete` event is fired and calls `this.shake`.
`this.shake` uses [anime](http://animejs.com/) to animate the `<div>`:

```html
<my-demo></my-demo>
<script src="//cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>
<script type="module">
import {ObservableObject, StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        {{# for(todo of todos) }}
            <div on:complete:by:todo="this.shake(scope.element)">
                <input type="checkbox" checked:bind="todo.complete"/>
                {{todo.name}}
            </div>
        {{/ for }}
    `;

    static props = {
        todos: {
            get default() {
                return [
                    new ObservableObject({name: "animate", complete: false}),
                    new ObservableObject({name: "celebrate", complete: true})
                ];
            }
        }
    };

    shake(element) {
        anime({
            targets: element,
            translateX: [ 10,-10,0 ],
            easing: 'linear'
        });
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

### Syntax Highlighting

Stache is very similar to handlebars and mustache.  Most editors have plugins for one of these
formats.

### Spacing and formatting

Stache tolerates spacing similar to JavaScript. However, we try to following the following
spacing in the following example:

```html
{{# if( this.check ) }}
	{{ this.value }}
{{ else }}
	{{ this.method( arg1 ) }}
{{/ if}}
```

You can use the following regular expressions to create this spacing:

- replace `\{\{([^ #\/\^!])` with `{{ $1`
- replace `\{\{([#\/\^!])([^ ])` with `{{$1 $2`
- replace `([^ ])\}\}` with `$1 }}`


### Accessing a helper if your property overwrites

Sometimes you have data with properties that conflict with stache's
helpers, but you still need to access those helpers.  To do this,
you can access all those helpers on `scope.helpers` like `scope.helpers.eq`.

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <p on:click="this.toggle()">
            Time:
            {{# scope.helpers.eq(this.eq,"day") }}
                SUN 🌞
            {{ else }}
                MOON 🌚
            {{/ }}
        </p>
    `;

    static props = {
        eq: "day"
    };

    toggle() {
        this.eq = (this.eq === "day" ? "night" : "day");
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

### Removing whitespace

Stache renders whitespace. For example, the following will render the space between
the `<h1>` tags and the `{{this.message}}` magic tag:

```js
import {stache} from "can";

var view = stache(`<h1>
	{{this.message}}
</h1>`);

var fragment = view({message: "Hi"});

console.log( fragment.firstChild.innerHTML ) //-> "\n\tHi\n"
```
@codepen

You can use [can-stache.tags.whitespace] to remove this whitespace like:


```js
import {stache} from "can";

var view = stache(`<h1>
	{{-this.message-}}
</h1>`);

var fragment = view({message: "Hi"});

console.log( fragment.firstChild.innerHTML ) //-> "Hi"
```
@codepen

## Understanding the stache language

Stache has a variety of magic tags and expressions that control the behavior of
the DOM it produces.  Furthermore, you are able to customize this behavior
to a large extent.

The following sections outline stache's formal syntax and grammar.  This knowledge
can be useful when attempting to combine features into advanced functionality.



- Magic tags - Magic tags like [can-stache.tags.escaped] and [can-stache.tags.unescaped]
  control control how stache operates on the DOM.
- Expression types - This is the valid semantics within a magic tag. For example, you
  can call functions like `{{ this.callSomeMethod() }}`.
- Scope and context - How variables and `this` get looked up.

### Magic tags

Rendering behavior is controlled with magic tags that look like `{{}}`.  There
are several forms of magic tags:

- Insertion tags
  - [can-stache.tags.escaped] - Insert escaped content into the DOM.
  - [can-stache.tags.unescaped] - Insert unescaped content into the DOM.
  - [can-stache.tags.comment] - Make a comment.
- Section tags - optional render a sub-section.
  - [can-stache.tags.section]TRUTHY[can-stache.helpers.else]FALSY[can-stache.tags.close] - Optionally render the _TRUTHY_ or _FALSY_ section.
  - [can-stache.tags.inverse]FALSY[can-stache.helpers.else]TRUTHY[can-stache.tags.close] - Optionally render the _TRUTHY_ or _FALSY_ section.
- Special
  - [can-stache.tags.named-partial {{<partialName}}]...[can-stache.tags.close {{/partialName}}] - Create
    an inline partial.
  - [can-stache.tags.whitespace] - Remove whitespace.

Magic tags are valid in the following places in HTML:

- Between a open and closed tag:
  ```html
  <div> {{magic}} </div>
  <div> {{#magic}} {{/magic}} </div>
  ```
- Wrapping a series of opening and closing tags:
  ```html
  <div> {{#magic}} <label></label> {{/magic}} </div>
  <div> {{#magic}} <label></label><span></span> {{/magic}} </div>
  ```
- Within an attribute:
  ```html
  <div class="selected {{magic}}"></div>
  <div class="{{#magic}}selected{{/magic}}"></div>
  ```
- Within a tag:
  ```html
  <div {{magic}}></div>
  ```
- Within a tag, wrapping attributes:
  ```html
  <div {{#magic}}class="selected"{{/magic}}></div>
  <input {{#magic}}checked{{/magic}}></div>
  ```

The following places are not supported:

- Defining the tag name:
  ```html
  <{{tagName}}></{{tagName}}>
  ```
- Wrapping an opening or closing tag:
  ```html
  <div> {{#magic}} <label> {{/magic}} </label></div>
  <div> <label> {{#magic}} </label><span></span> {{/magic}} </div>
  ```
- Intersecting part of an attribute:
  ```html
  <div {{attributeName}}="selected"></div>
  <div {{#magic}}class="{{/magic}}selected"></div>
  ```
- Attribute values without quotes:
  ```html
  <div attribute={{#magic}}"foo"{{/magic}}></div>
  <div key:raw={{#magic}}"foo"{{/magic}}></div>
  <div key:from={{#magic}}{{foo}}{{/magic}}></div>
  ```

### Expression types

Stache supports different expression types within most of the magic tags. The following
uses most of the expressions available:

```html
<div> {{ this.method( 1, keyA=null keyB=true )[key]( "string", value ) }}
```

There are 6 expression types stache supports:

- Literal expressions like `{{"string"}}`
- KeyLookup expressions like `{{key}}`
- Call expressions like `{{method(arg)}}`
- Hash expressions like `{{prop=key}}`
- Bracket expressions like `{{[key]}}`
- Helper expressions like `{{helper arg}}` (deprecated, but will probably be supported forever)

#### Literal expressions

A [can-stache/expressions/literal] specifies JS primitive values like:

- Strings `"strings"`
- Numbers `5`
- Booleans `true` or `false`
- And `null` or `undefined`

They are usually passed as arguments to Call expressions like:

```html
{{ task.filter( "completed", true ) }}
```

#### KeyLookup expressions

A [can-stache/expressions/key-lookup] specifies a value in the [can-view-scope scope]
that will be looked up. KeyLookup expressions
can be the entire stache expression like:

```html
{{ key }}
```

Or they can make up the method, arguments, bracket, and hash value parts of
Call and Hash expressions:

```html
{{ method( arg1, arg2 ) }}      Call
{{ method( prop=hashValue ) }}  Hash
{{ [key] }}                     Bracket
```

The value returned up by a KeyLookup depends on what the [can-stache.key] looks like, and
the scope.

#### Call expressions

A [can-stache/expressions/call] calls a function looked up in the [can-view-scope scope]. It looks like:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>{{ this.pluralize(this.type, this.ages.length) }}</h1>
    `;

    static props = {
        ages: {
            get default() {
                return [ 22, 32, 42 ];
            }
        },

        type: "age"
    };

    pluralize(type, count) {
        return type + ( count === 1 ? "" : "s" );
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


Call expression arguments are comma (,) separated.  If a Hash expression is an argument,
an object with the hash properties and values will be passed. For example:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>{{ this.pluralize(word=this.type count=this.ages.length) }}</h1>
    `;

    static props = {
        ages: {
            get default() {
                return [ 22, 32, 42 ];
            }
        },

        type: "age"
    };

    pluralize(options) {
        return options.word + ( options.count === 1 ? "" : "s" );
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


#### Hash expressions

A [can-stache/expressions/hash] specifies a property value on a object
argument. Notice how `method` is called below:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>{{ this.method(a=this.aProp b=null, c=this.func() ) }}</h1>
    `;

    static props = {
        aProp: "aValue"
    };

    method(arg1, arg2) {
        console.log(arg1, arg2) //-> {aProp: "aValue", b: null},{c:"FUNC"}
    }

    func() {
        return "FUNC";
    }
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

#### Bracket expressions

A [can-stache/expressions/bracket] can be used to look up a dynamic property in the [can-view-scope scope]. This is very useful when looping through properties to write out on many records:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <table>
            {{# for(record of records) }}
                <tr>
                    {{# for(key of keys )}}
                        <td>{{ record[key] }}</td>
                    {{/ for}}
                </tr>
            {{/ for}}
        </table>
    `;

    static props = {
        records: {
            get default() {
                return [
                    {first: "Justin", last: "Meyer", label: "Dad"},
                    {first: "Payal", last: "Meyer", label: "Mom"},
                    {first: "Ramiya", last: "Meyer", label: "Babu"},
                    {first: "Bohdi", last: "Meyer", label: "Baby"}
                ];
            }
        },
        keys: {
            get default() {
                return [
                    "first","last","label"
                ];
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen


This can be useful for looking up values using keys containing non-alphabetic characters:

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <h1>{{ this.data["special:prop"] }}</h1>
    `;

    static props = {
        data: {
            get default() {
                return {"special:prop": "SPECIAL VALUE"}
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

Bracket expressions can also be used to look up a value in the result of another expression:

```html
{{ this.getPerson()[key] }}
```

#### Helper expressions

[can-stache/expressions/helper]s are supported but deprecated. It's unlikely they will
be dropped for a long time.

### Scope and context

Stache maintains a [can-stache/keys/scope] similar to the one maintained in JavaScript. For example,
the `inner` function is able to access the `message`, `last`, and `first` variables:

```js
const message = "Hello";
function outer() {
    const last = "Meyer";

    function inner() {
        const first = "Bohdi";
        console.log( message + " " + first + " " + last );
    }
    inner();
}
outer();
```

Stache was originally built with a handlebars and mustache-type scope. This scope is still
supported, but deprecated. If you are supporting templates in this style, please read [can-stache.scopeAndContext].

The modern style of stache works much more like JavaScript. A view is rendered with
a `context` accessible as `this`.  For example:

```js
import {stache} from "can";
var view = stache(`<h1>Hello {{ this.subject }}</h1>`);

var context = {
	message: "World"
};

var fragment = view(context);

console.log(fragment.firstChild.innerHTML)
//-> Hello World
```

The [can-stache.helpers.for-of] helper creates variables local to the
section. In the following example `todo` is only available between `{{# for(...)}}` and
`{{/ for }}`.

```html
<my-demo></my-demo>
<script type="module">
import {StacheElement} from "can";

class MyDemo extends StacheElement {
    static view = `
        <ul>
            {{# for(todo of this.todos) }}
                <li>{{ todo.name }}</li>
            {{/ for }}
        </ul>
    `;

    static props = {
        todos: {
            get default() {
                return [
                    {name: "Writing"},
                    {name: "Branching"},
                    {name: "Looping"}
                ];
            }
        }
    };
};
customElements.define("my-demo", MyDemo);
</script>
```
@codepen

When a variable like `todo` is looked up, it will look for variables in its
scope and then walk to parent scopes until it finds a value.


## See also

[can-view-scope] is used by `stache` internally to hold and lookup values.  This is similar to
how JavaScript’s closures hold variables, except you can use it programmatically.

[can-stache-element] and [can-view-callbacks.tag can-view-callbacks.tag] allow you to define custom
elements for use within a stache template.  [can-view-callbacks.attr can-view-callbacks.attr] allow
you to define custom attributes.

[can-stache-bindings] sets up __element and bindings__ between a stache template’s [can-view-scope],
component [can-stache-element/static.props], or an element’s attributes.

## How it works

Coming soon!
