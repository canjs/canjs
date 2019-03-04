@page canjs Build CRUD apps in fewer lines of code
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description

If you’re like us, you build interactive web apps where users need to <strong>C</strong>reate, <strong>R</strong>ead,
<strong>U</strong>pdate, and <strong>D</strong>elete data.

CanJS provides all the tools you need to fetch your data, render your user interface, and make it interactive, in
fewer lines of code than other JavaScript frameworks.

<br />

> [guides/todomvc Learn how to build a CRUD app →]

@body

## Model layer

CanJS makes it easy to GET data from an API, mutate those objects, and PUT those changes back to the API.
Creating new instances and deleting old ones is a breeze too.
Save yourself time by not writing boilerplate XHR/fetch requests.

[We could show just a few lines of the code below, or the whole thing, depending on space:]

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Todo.getList().then(todos => {// Get all the todos (GET)

  const todo = new Todo({name: "Learn CanJS"});// Create a new todo
  todo.save();// Create it on the server (POST)

  todo.completed = true;// Get & set properties
  todo.save();// Save changes (PUT)

  todos[0].destroy();// Delete the todo (DELETE)
});

// Get a single todo (GET)
Todo.get({ id: 1 });
```

## Promises in templates

CanJS’s stache templating language can directly read the state and values from Promises.
No async callbacks to get the value from a promise, and no extra code to determine whether
the Promise is still pending, has been resolved, or resulted in an error.

[We could have an animation showing a loading screen, then an error state, maybe alternate back to loading and then a success state, or the following code:]

```handlebars
{{#if(promise.isPending)}}
	Loading…
{{/if}}

{{#if(promise.isRejected)}}
	Error: {{promise.reason.message}}
{{/if}}

{{#if(promise.isResolved)}}
	Value: {{promise.value}}
{{/if}}
```

## Real-time list updating

When you query an API to get a list of objects back, CanJS can understand your query.
When new objects are created that match that query, any arrays based off that query
will have the new object added to them. Your UI always stays in sync with the model.

## Get started with just a few lines of code

<p class="codepen" data-height="512" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="omqyMw" style="height: 512px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — Basic Todo App">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/omqyMw/">
  CanJS 5 — Basic Todo App</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
<br>

Define your custom types, connect to a backend API, create a custom element, render a list of data, and make the list editable.
Write CRUD apps like this in just a few lines of code.

<br />

> [guides/todomvc Ready to get started? →]

## You know who else builds CRUD apps?

<div class="social-proof">
  <img alt="Apple" height="32" src="../docs/images/logos/apple.svg" />
  <img alt="Bitovi" height="32" src="../docs/images/logos/bitovi.svg" />
  <img alt="Chase" height="32" src="../docs/images/logos/chase.svg" />
  <img alt="Delta" height="32" src="../docs/images/logos/delta.svg" />
  <img alt="FedEx" height="32" src="../docs/images/logos/fedex.svg" />
  <img alt="HP" height="32" src="../docs/images/logos/hp.svg" />
  <img alt="Tucows" height="32" src="../docs/images/logos/tucows.svg" />
</div>

## Our community has your back

CanJS is backed by [Bitovi](https://www.bitovi.com/), a company built on using and publishing open source software.

Our community is here to help you get started and answer your questions.
[Join us on Slack](https://bitovi.com/community/slack) or [our forums](https://forums.bitovi.com/).

<style type="text/css">
.social-proof img {
  margin: 1em 1em 0;
}
</style>

## One-way and two-way binding

Your app’s model data is stored in your custom data types. CanJS’s one-way and two-way
binding syntax let you bind directly to your model data. Read directly from it and
write directly to it without additional helper functions.

Additionally, the binding syntax makes it easy to pass data down to child components,
extract data from child components, and two-way bind to form elements. Listening to
any DOM (or custom) event is easy too. The syntax is clear and succinct, which means
it’s easy to read and write.

<br />

> Take the tutorial now! [guides/todomvc Get started →]

## CanJS has all the tools you need to build your app

Don’t waste your time hacking together a bunch of libraries that might not work together.
CanJS has libraries for working with APIs, creating object-oriented observables,
binding to form elements, building reusable custom elements, routing, and more.

## No build tool or CLI required

Start a CanJS app with just a single import statement. No compiler, no build step,
no configuration, no special tools required.

## Become an expert quickly with our extensive guides & documentation

Our guides will teach you the best way to architect your application so you spend less time
maintaining it and more time building features that make you money.

## Use DevTools to debug your app

Use the CanJS DevTools to edit your app’s state at runtime, visualize the dependency graphs
between elements and state, and debug changes to observables.

<br />

> Ready to build your app? [guides/todomvc Get started →]

## Browser support

CanJS supports Internet Explorer 11, Chrome, Edge, Firefox, and Safari.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

## Small bundle size

At 72 KB gzipped, CanJS provides all the tools you need at a small size.
