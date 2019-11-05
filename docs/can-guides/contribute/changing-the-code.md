@page guides/contributing/code Changing the Code
@parent guides/contribute 5

@description Learn how to contribute a code change to CanJS. Read the [guides/contributing/adding-ecosystem-modules]
guide on how to make a plugin to CanJS.

@body

Now that your computer is set up to [guides/contributing/developing-locally develop CanJS locally], you can make changes in your local repository.

The CanJS projects generally follow the [GitHub flow](https://help.github.com/articles/github-flow/). This section will briefly explain how you can make changes on your computer and submit a pull request to have those changes merged into the main project.

## Creating a new branch

Starting in the CanJS repository you have cloned to your computer, you can create a new branch:

```shell
git checkout -b your-branch-name
```

Replace `your-branch-name` with the name of your feature branch, e.g. `git checkout -b html5-fix` to create a `html5-fix` branch.

## Style guide

Our code generally follows [jQuery’s coding conventions](https://contribute.jquery.org/style-guide/js/).

Where possible, CanJS code uses:

- Tabs not spaces
- JSHint
- CommonJS not ES6
- jQuery’s [coding conventions](https://contribute.jquery.org/style-guide/js/)

Below are some other recommendations for how to write/document CanJS code.

### Use `this` in stache expressions

Write:

```html
Count: <span>{{ this.count }}</span>
<button on:click='this.increment()'>+1</button>
```

…instead of:

```html
Count: <span>{{ count }}</span>
<button on:click='increment()'>+1</button>
```

### Name classes

Write:

```js
class MyCounter extends StacheElement { }
customElements.define("my-counter", MyCounter);
```

…instead of:

```js
customElements.define("my-counter", class extends StacheElement {
});
```

### Use class fields for static properties

Write:

```js
class MyCounter extends StacheElement {
  static view = `
  `;
  static props = {
  };
}
```

…instead of:

```js
class MyCounter extends StacheElement {
  static get view() {
    return `
    `;
  }
  static get props() {
    return {
    };
  }
}
```

### Order classes

1. view
2. props
3. lifecycle methods
4. other methods

```js
class MyCounter extends StacheElement {
  static view = `
  `;
  static props = {
  };
  connected() {
  }
  myMethod() {
  }
}
```

### Use `for(of)` instead of `each` and scope walking

Write:

```js
static view = `
  {{# for(item of items) }}
    {{# for(subitem of item.subitems) }}
      {{ this.query }}
    {{/ for }}
  {{/ for }}
`;
```

…instead of:

```js
  {{# each(items) }}
    {{# each(this.subitems) }}
      {{ ../../query }}
    {{/ each }}
  {{/ each }}
```

### Use the “strictest” type possible

The CanJS 6 codemods will change all types to use `type.maybeConvert` because this matches the behavior of `can-define`. Usually we can be more strict than this and use either the raw type (like `id: Number`), `type.convert`, or `type.maybe`.

### Space out your stache

https://canjs.com/doc/can-stache.html#Spacingandformatting

**TLDR:**

- Put a space after opening stache tags (`{{`, `{{{`, `{{#`,`{{/`, `{{<`, `{{!`, `{{^`, `{{>`)
- Put a space before closing stache tags (`}}`, `}}}`)

### Don’t use propertyDefaults unless it is necessary

The codemods add this to ObservableObjects and StacheElements:

```js
static get propertyDefaults() {
  return DeepObservable;
}
```

This is added because this reproduces the behavior of `DefineMap`; however, this should not be needed by most of our guides. This is only needed in cases where a property is set to an object or array that has nested objects or arrays that need to be observable, otherwise it should be removed.

### Replace `(event, newValue)` with `({ value })`

This:

```js
listenTo("event", ( event, value ) => {
});
```

…can now be this:

```js
listenTo("event", ({ value }) => {
});
```

## Updating tests

The [`test` directory](https://github.com/canjs/canjs/tree/master/test) contains files related to testing the code in the repository. When fixing bugs or writing new features, you should update the existing tests or create new tests to cover your changes.

After updating the tests, run `npm test` to make sure the tests pass.

## Updating the documentation

The [`docs`](https://github.com/canjs/canjs/tree/master/docs) and [`guides`](https://github.com/canjs/canjs/tree/master/guides) directories contain the files used to generate [CanJS.com](https://canjs.com/).

## Submitting a pull request

Once you’ve made your changes and run the tests, you can push your branch to GitHub:

```shell
git push origin your-branch-name
```

Make sure you replace `your-branch-name` with the name of your branch. For example, `git push origin html5-fix`.

Next, submit a pull request! On GitHub, navigate to Pull Requests and click the
“New Pull Request” button. Give your PR a meaningful title and provide details
about the change in the description, including a link to the issue(s) your PR
addresses. If applicable, please include a screenshot or gif to demonstrate your
change. This makes it easier for reviewers to verify that it works for them.
[LICEcap](http://www.cockos.com/licecap/) is a great tool for making gifs.

When finished, press “Send pull request”. The core team will be notified of your
submission and will let you know of any problems or a targeted release date.

GitHub has additional documentation on [creating a pull request from a fork](https://help.github.com/articles/creating-a-pull-request-from-a-fork/) that you might find useful.

If you enjoy making these kinds of fixes and want to directly influence CanJS’s direction,
consider joining our [Core team](https://donejs.com/About.html#core-team).
