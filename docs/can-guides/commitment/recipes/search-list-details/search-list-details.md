@page guides/recipes/search-list-details Search, List, Details (Advanced)
@parent guides/recipes

@description This guide walks through building a Search, List, Details flow with lazy-loaded routes.

@body

The final widget looks like:

<p data-height="426" data-theme-id="dark" data-slug-hash="yxJwwJ" data-default-tab="result" data-user="bitovi" data-embed-version="2" data-pen-title="CanJS 5.0 - Search / List / Details - Final" class="codepen">See the Pen <a href="https://codepen.io/bitovi/pen/yxJwwJ/">CanJS 5.0 - Search / List / Details - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>) on <a href="https://codepen.io">CodePen</a>.</p>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works (if it’s not obvious).
- __The solution__ — The solution to the problem.

## Setup ##

### The problem

In this section, we will fork [this CodePen](https://codepen.io/bitovi/pen/aaNrwO) that contains some starting code that we will modify to have a Search, List, Details flow with lazy-loaded routes.

### What you need to know

This CodePen:

- Loads all of CanJS’s packages. Each package is available as a named export.  For example [can-component] is available as `import { Component } from "can"`.
- Creates a basic `<character-search-app>` component.
- Includes a `<mock-url>` component for interacting with the route of the CodePen page.

### The solution

__START THIS TUTORIAL BY CLONING THE FOLLOWING CodePen__:

> Click the `EDIT ON CODEPEN` button.  The CodePen will open in a new window. In that new window,  click `FORK`.

<p data-height="316" data-theme-id="dark" data-slug-hash="aaNrwO" data-default-tab="js,result" data-user="bitovi" data-embed-version="2" data-pen-title="CanJS 5.0 - Search / List / Details - Setup" class="codepen">See the Pen <a href="https://codepen.io/bitovi/pen/aaNrwO/">CanJS 5.0 - Search / List / Details - Setup</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## Configure routing ##

### The problem

In this section, we will:

- Create an observable key-value object.
- Cross-bind the observable with the URL.
- Set up "pretty" routing rules.

We want to support the following URL patterns:
- `#!`
- `#!search`
- `#!list/rick`
- `#!details/rick/1`

### What you need to know

- Use [can-define.types.default] to create default values for properties on the `ViewModel`.

```js
ViewModel: {
    dueDate: {
        default() {
            return new Date();
        }
    }
}
```

- Use `new observe.Object({ ... })` to create an [can-observe.Object observable Object].
- Set [can-route.data route.data] to the object you want cross-bound to the URL.
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

You can access the viewModel for the app using `document.querySelector("character-search-app").viewModel` from the console.

You should be able to update properties on the viewModel and see the URL update. Also, updating the URL should update the properties on the viewModel.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-set-up-routing.js
@highlight 1,13-27

## Lazy load components ##

### The problem

In this section, we will load the code for each route when that route is displayed. This technique prevents loading code for routes a user may never visit.

The components we will use for each route are available as ES Modules on [unpkg](https://unpkg.com/):
- [//unpkg.com/character-search-components@5/character-search.mjs](//unpkg.com/character-search-components@5/character-search.mjs)
- [//unpkg.com/character-search-components@5/character-list.mjs](//unpkg.com/character-search-components@5/character-list.mjs)
- [//unpkg.com/character-search-components@5/character-details.mjs](//unpkg.com/character-search-components@5/character-details.mjs)

### What you need to know

- Use [can-define.types.get] to create virtual properties that will be re-evaluated when an observable property they depend on changes:

```js
ViewModel: {
    first: {
        default() {
            return "Kevin";
        }
    },
    last: {
        default() {
            return "McCallister";
        }
    },
	// The name property will update whenever `first` or `last` changes
	get name() {
		return this.first + " " + this.last;
	}
},
// make sure to put `name` in the view so that bindings are set up correctly
view: `
	{{name}}
`
```

- Call the `import()` keyword as a function to [dynamically import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) a module.

### How to verify it works

Changing the `routeData.page` property will cause the code for the new route to be loaded in the devtools Network Tab.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-lazy-load-components.js
@highlight 11,31-38

## Display components ##

### The problem

Now that the code is loaded for each route, we can create an instance of the loaded component and display it in the view.

### What you need to know

- `import()` returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
- Promises can be [can-reflect-promise used directly] in the view.

```js
ViewModel: {
	get aPromise() {
		return new Promise((resolve) => {
			resolve("Hello");
		});
	}
},
view: `
	{{# if(aPromise.isPending) }}
		The code is still loading
	{{/ if }}

	{{# if(aPromise.isRejected) }}
		There was an error loading the code
	{{/ if }}

	{{# if(aPromise.isResolved) }}
		The code is loaded: {{aPromise.value}} -> Hello
	{{/ if }}
`
```

- `import()` resolves with a module object - `module.default` is the component constructor.
- Components can be [can-component#Programmaticallyinstantiatingacomponent instantiated programmatically] using `new ComponentConstructor()`.

### How to verify it works

You can check the devtools Elements Panel for the correct component on each page:

- `#!search` -> `<character-search-page>`
- `#!list` -> `<character-list-page>`
- `#!details` -> `<character-details-page>`

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-instantiate-components.js
@highlight 11-17,42-46

## Pass data to components ##

### The problem

After the last step, the correct component is displayed for each route, but the components do not work correctly. To make these work, we will pass properties from the main ViewModel into each component.

### What you need to know

- You can pass a `viewModel` property when instantiating components to pass values to the component’s viewModel and set up bindings.
- [can-value] can be used to programmatically create observables that are bound to another object.

```js
const componentInstance = new ComponentConstructor({
  viewModel: {
    givenName: value.from(this, "name.first"),
    familyName: value.bind(this, "name.last"),
    fullName: value.to(this, "name.full")
  }
});
```

- The component for all three pages need a `query` property. The `<character-details-page>` also needs an `id` property.

### How to verify it works

The app should be fully functional:

- Typing in the `<input>` and clicking the `Search` button should take you to the list page with a list of matching characters.
- Clicking a character on the list page should take you to the details page for that character.
- Clicking the `< Characters` button should take you back to the list page.
- Clicking the `< Search` button should take you back to the search page with the query still populated in the `<input>`.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-bind-properties.js
@highlight 1,37-47,58

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## Result

When complete, you should have a working Search, List, Details flow like the following CodePen:


<p data-height="426" data-theme-id="dark" data-slug-hash="yxJwwJ" data-default-tab="result" data-user="bitovi" data-embed-version="2" data-pen-title="CanJS 5.0 - Search / List / Details - Final" class="codepen">See the Pen <a href="https://codepen.io/bitovi/pen/yxJwwJ/">CanJS 5.0 - Search / List / Details - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>) on <a href="https://codepen.io">CodePen</a>.</p>
