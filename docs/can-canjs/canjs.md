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

## You’re probably wondering what makes CanJS different

### Custom data types

CanJS’s model layer helps you define your app’s data types as object-oriented observables.
Add custom properties and methods directly on the data returned by your API.
All the logic for each reusable data type is available on every instance.

Additionally, CanJS adds five methods to every instance:

- [can-connect/can/map/map.prototype.isNew isNew()] tells you if it hasn’t been saved in the backend
- [can-connect/can/map/map.prototype.save save()] when you want to POST new instances or PUT changes
- [can-connect/can/map/map.prototype.isSaving isSaving()] tells you it’s being saved
- [can-connect/can/map/map.prototype.destroy destroy()] when you want to DELETE it
- [can-connect/can/map/map.prototype.isDestroying isDestroying()] tells you it’s being deleted

CanJS also provides [can-connect/can/map/map.getList .getList()] and [can-connect/can/map/map.get .get()]
on every model to fetch a list or single instance, respectively. The raw data returned from your API is
automatically turned into your custom data types so you don’t have to write that boilerplate code.

### First-class support for Promises in templates

CanJS’s [can-stache stache templating language] is similar to Handlebars and Mustache.
When your app’s data changes, its user interface is updated automatically. Likewise,
if you fetch again from the server and there’s new data, your app’s UI will be updated.

Additionally, stache has first-class support for Promises, with helpers for reading the
state and value of a Promise:

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

Stache’s succinct syntax means you write less code for your templates.
We promise you’ll love writing your templates this way.

### Automatic list management and real-time updating

Data fetched from APIs is turned into object-oriented observables that are easy to understand and manipulate. When you make a change to one of the observables, your entire interface updates automatically. When you show a list of items, if one of the items should no longer be shown in the list because it doesn’t meet your filtering criteria, it’s automatically removed.

Save yourself time by not writing code that updates your app’s UI.

<br />

> Start building your first app! [guides/todomvc Get started →]

### One-way and two-way binding

Your app’s model data is stored in your custom data types. CanJS’s one-way and two-way
binding syntax let you bind directly to your model data. Read directly from it and
write directly to it without additional helper functions.

Additionally, the binding syntax makes it easy to pass data down to child components,
extract data from child components, and two-way bind to form elements. Listening to
any DOM (or custom) event is easy too. The syntax is clear and succinct, which means
it’s easy to read and write.

<br />

> Take the tutorial now! [guides/todomvc Get started →]

### CanJS has all the tools you need to build your app

Don’t waste your time hacking together a bunch of libraries that might not work together.
CanJS has libraries for working with APIs, creating object-oriented observables,
binding to form elements, building reusable custom elements, routing, and more.

### No build tool or CLI required

Start a CanJS app with just a single import statement. No compiler, no build step,
no configuration, no special tools required.

### Become an expert quickly with our extensive guides & documentation

Our guides will teach you the best way to architect your application so you spend less time
maintaining it and more time building features that make you money.

### Use DevTools to debug your app

Use the CanJS DevTools to edit your app’s state at runtime, visualize the dependency graphs
between elements and state, and debug changes to observables.

<br />

> Ready to build your app? [guides/todomvc Get started →]

### Browser support

CanJS supports Internet Explorer 11, Chrome, Edge, Firefox, and Safari.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

### Small bundle size

At 72 KB gzipped, CanJS provides all the tools you need at a small size.

### Our community has your back

CanJS is backed by [Bitovi](https://www.bitovi.com/), a company built on using and publishing open source software.

Our community is here to help you get started and answer your questions.
[Join us on Slack](https://bitovi.com/community/slack) or [our forums](https://forums.bitovi.com/).

<style type="text/css">
.social-proof img {
  margin: 1em 1em 0;
}
</style>
