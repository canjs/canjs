@page guides/recipes/search-list-details Search, List, Details
@parent guides/recipes/advanced

@description This advanced guide walks through building a Search, List, Details flow with lazy-loaded routes.

@body

The final widget looks like:

<p class="codepen" data-height="426" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="NWKNYbL" style="height: 426px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Search / List / Details - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/NWKNYbL/">
  Search / List / Details - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works (if it’s not obvious).
- __The solution__ — The solution to the problem.

## Setup ##

### The problem

In this section, we will fork [this CodePen](https://codepen.io/bitovi/pen/PoYNNgJ?editors=1000) that contains some starting code that we will modify to have a Search, List, Details flow with lazy-loaded routes.

### What you need to know

This CodePen:

- Loads all of CanJS’s packages. Each package is available as a named export. For example [can-stache-element] is available as `import { StacheElement } from "can";`.
- Creates a basic `<character-search-app>` element.
- Includes a `<mock-url>` element for interacting with the route of the CodePen page.

### The solution

__START THIS TUTORIAL BY CLONING THE FOLLOWING CodePen__:

> Click the `EDIT ON CODEPEN` button.  The CodePen will open in a new window. In that new window,  click `FORK`.

<p class="codepen" data-height="316" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="PoYNNgJ" style="height: 316px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Search / List / Details - Setup">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/PoYNNgJ/">
  Search / List / Details - Setup</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

## Configure routing ##

### The problem

In this section, we will:

- Import [can-route].
- Define a `routeData` property whose value is [can-route.data route.data].
- Set up "pretty" routing rules.
- Initialize [can-route].

We want to support the following URL patterns:
- `#!`
- `#!search`
- `#!list/rick`
- `#!details/rick/1`

### What you need to know

- Use [can-observable-object/define/default] to create element properties that default to objects:

```js
class MyElement extends StacheElement {
  static props = {
    dueDate: {
      get default() {
        return new Date();
      }
    }
  };
}
```

- `route.register( "{abc}" );` will create a URL matching rule.

```js
// default route - if hash is empty, default `viewModel.abc` to `"xyz"`
route.register( "", { abc: "xyz" });

// match routes like `#!xyz` - sets `viewModel.abc` to `xyz`
route.register( "{abc}" );

// match routes like `#!xyz/uvw` - sets `viewModel.abc` to `xyz`, `viewModel.def` to `uvw`
route.register( "{abc}/{def}" );
```

- `route.start()` will initialize [can-route].

### How to verify it works

You can access the app’s properties using `document.querySelector("character-search-app")` from the console.

You should be able to update the element properties and see the URL update. Also, updating the URL should update the properties on the element.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-set-up-routing.js
@highlight 1,11-22

## Lazy load elements ##

### The problem

In this section, we will load the code for each route when that route is displayed. This technique prevents loading code for routes a user may never visit.

The elements we will use for each route are available as ES Modules on [unpkg](https://unpkg.com/):
- [//unpkg.com/character-search-components@6/character-search.mjs](//unpkg.com/character-search-components@6/character-search.mjs)
- [//unpkg.com/character-search-components@6/character-list.mjs](//unpkg.com/character-search-components@6/character-list.mjs)
- [//unpkg.com/character-search-components@6/character-details.mjs](//unpkg.com/character-search-components@6/character-details.mjs)

### What you need to know

- Use [can-observable-object/define/get] to create virtual properties that will be re-evaluated when an observable property they depend on changes:

```js
class Person extends ObservableObject {
  static props = {
    first: {
      default: "Kevin"
    },
    last: {
      default: "McCallister"
    }
  };
  // The name property will update whenever `first` or `last` changes
  get name() {
    return this.first + " " + this.last;
  }
}

// make sure to put `name` in the view so that bindings are set up correctly
static view = `{{ name }}`;
```

- Call the `import()` keyword as a function to [dynamically import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) a module.

### How to verify it works

Changing the `routeData.page` property will cause the code for the new route to be loaded in the devtools Network Tab.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-lazy-load-elements.js
@highlight 9,26-33

## Display elements ##

### The problem

Now that the code is loaded for each route, we can create an instance of the loaded element and display it in the view.

### What you need to know

- `import()` returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
- Promises can be [can-reflect-promise used directly] in the view.

```js
class MyElement extends StacheElement {
  static view = `
    {{# if(this.aPromise.isPending) }}
      The code is still loading
    {{/ if }}

    {{# if(this.aPromise.isRejected) }}
      There was an error loading the code
    {{/ if }}

    {{# if(this.aPromise.isResolved) }}
      The code is loaded: {{ this.aPromise.value }} -> Hello
    {{/ if }}
  `;
  static props = {
    aPromise: {
      get default() {
        return new Promise((resolve) => {
          resolve("Hello");
        });
      }
    }
  };
}
```

- `import()` resolves with a module object - `module.default` is the element constructor.
- Elements can be instantiated programmatically using `new ElementConstructor()`.

### How to verify it works

You can check the devtools Elements Panel for the correct element on each page:

- `#!search` -> `<character-search-page>`
- `#!list` -> `<character-list-page>`
- `#!details` -> `<character-details-page>`

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-instantiate-elements.js
@highlight 9-15,38-42

## Pass data to elements ##

### The problem

After the last step, the correct element is displayed for each route, but the elements do not work correctly. To make these work, we will pass properties from the `character-search-app` element into each element.

### What you need to know

- The [can-stache-element/lifecycle-methods.bindings bindings lifecycle method] can be used to create bindings between an element’s properties and parent observables.
- [can-value] can be used to programmatically create observables that are bound to another object.

```js
const elementInstance = new ElementConstructor().bindings({
  givenName: value.from(this, "name.first"),
  familyName: value.bind(this, "name.last"),
  fullName: value.to(this, "name.full")
});
```

- The element for all three pages need a `query` property. The `<character-details-page>` also needs an `id` property.

### How to verify it works

The app should be fully functional:

- Typing in the `<input>` and clicking the `Search` button should take you to the list page with a list of matching characters.
- Clicking a character on the list page should take you to the details page for that character.
- Clicking the `< Characters` button should take you back to the list page.
- Clicking the `< Search` button should take you back to the search page with the query still populated in the `<input>`.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-bind-properties.js
@highlight 1,32-46,57

## Result

When complete, you should have a working Search, List, Details flow like the following CodePen:

<p class="codepen" data-height="426" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="NWKNYbL" style="height: 426px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Search / List / Details - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/NWKNYbL/">
  Search / List / Details - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
