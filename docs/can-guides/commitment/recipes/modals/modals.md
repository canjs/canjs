@page guides/recipes/modals Multiple Modals
@parent guides/recipes/intermediate

@description This intermediate guide shows how to create a multiple modal form.

@body


The final widget looks like:

<p class="codepen" data-height="426" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="pozKzZo" style="height: 426px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 - Multiple Modals - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/pozKzZo/">
  CanJS 6.0 - Multiple Modals - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The following sections are broken down the following parts:

- __The problem__ - A description of what the section is trying to accomplish.

- __What you need to know__ - Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ - The solution to the problem.

## Setup ##

### The problem

In this section, we will fork [this CodePen](https://codepen.io/bitovi/pen/OJLdJvj?editors=1000) that contains some starting code that we will modify to use modals instead of adding
each form directly in the page.

### What you need to know

The CodePen creates and several basic components:

- `<occupation-questions>` - A form that asks the sorts of things the user does.
- `<diva-questions>` - A form that asks for expenses for divas.
- `<programmer-questions>` - A form that asks for a programmer's programming language.
- `<income-questions>` - A form that asks how the user gets paid.
- `<my-app>` - The main application component.  It uses all of the above components
  to update its value.

`<my-app>` is mounted in the `HTML` tab as follows:

```html
<my-app></my-app>
```

### The solution

__START THIS TUTORIAL BY CLONING THE FOLLOWING CODEPEN__:

> Click the `EDIT ON CODEPEN` button.  The CodePen will open in a new window. In that new window,  click `FORK`.

<p class="codepen" data-height="316" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="OJLdJvj" style="height: 316px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 - Multiple Modals - Setup">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/OJLdJvj/">
  CanJS 6.0 - Multiple Modals - Setup</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen:

- Loads all of CanJS’s packages. Each package is available as a named export.  For example [can-stache-element]
  is available as `import { StacheElement } from "can"`.



## Create a simple modal ##

### The problem

In this section, we will:

- Create a simple `<my-modal>` custom element that will put its "light DOM"
  within a modal window.
- Show the `<diva-questions>` component when `isDiva` is set to true.

### What you need to know

- Use `{{# if(value) }} HTML {{/ if }}` to show `HTML` when `value` is true.
- Content between custom element tags like:
  ```js
  <custom-element>SOME CONTENT</custom-element>
  ```
  Is available to be rendered with the `<content>` element within the
  custom element’s `view`.  The following would put `SOME CONTENT` within
  an `<h1>` element:

  ```js
  class CustomElement extends StacheElement {
    static view = `<h1><content></content></h1>`;
  }
  customElements.define("custom-element", CustomElement);
  ```

### How to verify it works

If you click the `isDiva` radio input, a modal window with the `<diva-questions>`
form should appear.

### The solution

Update the `JS` tab to:

@sourceref ./1-simple-modal.js
@highlight 133-142,153-157,only

## Pass a component instance ##

### The problem

In this section, we are matching the same behavior as the
previous example.  However, we are going to change the `<my-modals>`
component to take a component instance to render
in a modal instead of "light DOM".

### What you need to know

- Use `{ get default() { /* ... */ }}` to create a default value for a property:

  ```js
  class MyComponent extends StacheElement {
    static props = {
      dueDate: {
        get default(){
          return new Date();
        }
      }
    };
  }
  ```

- Component instances can be created like:
  ```js
  const component = new ProgrammerQuestions().initialize({
    programmingLanguage: "JS"
  });
  ```

  This is roughly equivalent to:

  ```html
  <programmer-questions programmingLanguage:from="'JS'" />
  ```

- Use [can-value] and [can-stache-element/lifecycle-methods.bindings] to setup a two-way binding from one component to another:

  ```js
  static props = {
    get default() {
      return new ProgrammerQuestions().bindings({
        programmingLanguage: value.bind(this, "programmingLanguage")
      });
    }
  };
  ```

  This is roughly equivalent to:

  ```html
  <programmer-questions programmingLanguage:bind="this.programmingLanguage" />
  ```

- Render a component instance with `{{ component }}`.

### The solution

Update the `JS` tab to:

@sourceref ./2-passing-components.js
@highlight 137,154,179-185,only


## Show multiple modals in the window ##

### The problem

In this section, we will:

- Show all form components within a modal box.
- Show the `<diva-questions>` and `<programmer-questions>` modals only
  if their respective questions (`isDiva` and `isProgrammer`) checkboxes
  are selected.
- Remove all the form components from being rendered in the main page content area.

We will do this by:

- Changing `<my-modals>` to:
  - take an array of component instances.
  - position the component instances within `<div class="modal-container">` elements
    20 pixels apart.
- Changing `<my-app>` to:
  - create instances for the `OccupationQuestions`, `ProgrammerQuestions`, and
  `IncomeQuestions` components.
  - create a `visibleQuestions` array that contains only the instances that
    should be presented to the user.

### What you need to know

- Use ES5 getters to transform component's stateful properties to new values.  For example, the following returns `true` if someone is a diva and a programmer:

  ```js
  static props = {
    isDiva: Boolean,
    isProgrammer: Boolean,
    get isDivaAndProgrammer() {
      return this.isDiva && this.isProgrammer;
    }
  };
  ```

  This can be used to derive the `visibleQuestions` array.


### The solution

Update the `JS` tab to:

@sourceref ./3-multiple-modals.js
@highlight 134-162,169-175,192-199,209-241,only

## Next should move to the next window ##

### The problem

In this section, we will make it so when someone clicks the `Next`
button in a modal, the next modal window will be displayed.

### What you need to know

We can use a index of which question we have answered to know which
questions should be returned by `visibleQuestions`.

The following creates a counting index and a method that increments it:

```js
class MyModals extends StacheElement {
  // ...
  static props = {
    questionIndex: { default: 0 }
  };

  next() {
    this.questionIndex += 1;
  }
}
```

To pass the `next` function to a component, you must make sure that the right `this`
is preserved.  You can do that with `function.bind` like:

```js
new ProgrammerQuestions().bindings({
  programmingLanguage: value.bind(this, "programmingLanguage"),
  next: this.next.bind(this)
});
```

### The solution

@sourceref ./4-next.js
@highlight 198,207,216,225,230,247,252-254,only

## Result

When complete, you should have a working multiple modal form like the following CodePen:

<p class="codepen" data-height="426" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="pozKzZo" style="height: 426px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 - Multiple Modals - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/pozKzZo/">
  CanJS 6.0 - Multiple Modals - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
