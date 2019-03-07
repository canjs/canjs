@page canjs Build CRUD apps in fewer lines of code
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700');
body {
  font-family: 'Open Sans', sans-serif;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: 300;
  color: #1A1E1F;
  border-bottom: none;
  margin: 0;
  padding: 0;
}
h2 {
  font-size: 32px;
}
h3 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #282C33;
}
.description p {
  font-size: 18px;
  padding-bottom: 15px;
}
button {
  border: 3px solid #0288C9;
  border-radius: 5px;
  background-color: transparent;
  margin: 0 auto;
  padding: 10px 20px;
  font-size: 24px;
  color: #327ABB;
  letter-spacing: 0;
  text-align: center;
}
.caption {
  display: flex;
  margin: 15px 30px;
  font-style: italic;
  line-height: 1.5;
}
.title, .description {
  margin: 0;
  padding: 0;
}
.page-type {
  display:none;
  float: none;
  height: 0;
  margin: 0;
  padding: 0;
}
.gray-callout {
  background-color: #E2E1E0;
  display: flex;
  flex-wrap: wrap;
}
.gray-callout p {
  margin-bottom: 0;
}
.hero-section {
  background-image: url('docs/images/checkbox-placeholder.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 100% 100%;
  max-width: 1200px;
  width: 100%;
}
.hero-section .left-col {
  padding: 90px 0 0 60px;
  max-height: 420px;
}
.hero-section button {
  margin: 30px 0 45px;
}
.hero-logo {
  fill: #327ABB;
  width: 300px;
}
.single-col-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 60px 90px;
  max-width: 1200px;
}
.single-col-wrapper button {
  margin-top: 45px;
}
.three-col-wrapper {
  display: flex;
  margin: 30px 60px 60px;
  max-width: 1200px;
}
.three-col-wrapper .col-container {
  display: flex;
  flex-direction: column;
  margin-right: 5%;
}
.three-col-wrapper .col-container:last-of-type {
  margin-right: 0%;
}
.social {
  display: flex;
  flex-direction: column;
  padding: 45px 60px 30px;
}
.social h2 {
  margin-bottom: 15px;
}
.social .social-two-col {
  display: flex;
  align-items: center;
  flex-direction: row;
  max-width: 1200px;
}
.social-two-col .left-col {
  display: flex;
  width: 65%;
  margin-right: 60px;
}
.social-two-col .right-col {
  display: flex;
}
.social-two-col .right-col img {
  margin-right: 30px;
  max-width: 50%;
}
.social-two-col .right-col img:last-of-type {
  margin-right: 0;
}
.code-overview {
  display: flex;
  flex-direction: column;
  margin: 90px 90px 60px;
  max-width: 1200px;
}
.code-overview h3 {
  font-weight: 600;
  line-height: 1.25;
}
.code-proof {
  display: flex;
}
.code-proof .left-col {
  margin-right: 60px;
  width: 50%;
}
.code-proof .right-col img {
  max-width: 100%;
  margin-bottom: 60px;
}
.code-proof .right-col.last-item img {
  margin-bottom: 0;
}
.clients {
  display: flex;
  flex-direction: column;
  padding: 45px 60px;
}
.clients-single-col {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
}
.clients h2 {
  text-align: center;
  margin-bottom: 15px;
}
.client-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.client-logos img {
  max-height: 32px;
  margin: 15px 30px;
}
.two-col-wrapper {
  display: flex;
  margin: 90px;
}
.two-col-wrapper div {
  width: 50%;
  margin-right: 60px;
}
.two-col-wrapper img {
  max-width: 100%;
}
.two-col-wrapper div:last-of-type {
  margin-right: 0;
}
.footer button {
  margin: 60px auto 45px;
}
.footer-single-col {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
}
@@media (max-width: 1229px) {
  .hero-section {
    background-position: 110%;
  }
  .hero-section .left-col {
    width: 40%;
    padding-top: 60px;
  }
  .single-col-wrapper, .three-col-wrapper, .code-overview, .two-col-wrapper {
    margin-right: 30px;
    margin-left: 30px;
  }
  .code-proof .left-col {
    width: 40%;
  }
}
@@media (max-width: 999px) {
  .three-col-wrapper {
    flex-wrap: wrap;
  }
  .hero-section {
    background-position: 50vw 100%;
  }
  .hero-section .left-col {
    width: 50%;
    padding-top: 60px;
  }
}
@@media (max-width: 899px) {
  .hero-section .left-col {
      padding: 45px 0 0 45px;
  }
  .social .social-two-col {
    flex-wrap: wrap;
  }
  .social .social-two-col .left-col {
    flex-wrap: wrap;
    width: 100%;
    margin-right: 0;
  }
  .social .social-two-col .right-col {
    justify-content: space-between;
    width: 100%;
    max-height: 70px;
  }
  .code-proof {
    flex-wrap: wrap;
  }
  .code-proof .left-col {
      width: 100%;
      margin-right: 0;
  }
  .two-col-wrapper {
    flex-wrap: wrap;
  }
  .two-col-wrapper div {
    width: 100%;
    margin-right: 0;
  }
}
@@media (max-width: 759px) {
  .hero-section {
    background-image: none;
  }
  .hero-section .left-col {
    width: 100%;
    height: unset;
  }
}
</style>
<div class="gray-callout max-container">
  <div class="hero-section">
    <div class="left-col">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365.7 144.4" class="hero-logo"><path d="M265.5 142.6l-7-13.8-1-2 2-1 5.8-3.6c1.6-1 3-2.2 4-3.2s2-2 2.6-3.2c.6-1 1.2-2.3 1.5-3.5l.3-1c0-.6.2-1 .3-1.3.5-2.2.7-4.8.7-7.8V37H298.6v68.2c0 3-.4 5.8-.8 8.6l-.3 1.6c0 .5-.2 1-.4 1.7-.6 3-1.7 5.6-3.2 8.2-1 2-2.4 3.7-4 5.4-1.4 1.6-3.2 3.2-5.3 4.7-.6.5-1.2 1-1.8 1.3l-2 1.2c-3.5 2-7.6 3.8-12.5 5.4l-2 .6-.7-1.6zm64.7-19.8c-2.3 0-4.4 0-6.3-.2-2 0-3.8-.3-5.6-.6l-4.8-1-4.3-1-3.7-1.6c-1.2-.5-2.3-1-3.3-1.6l-1.8-1 .7-2 5.4-13.7.8-2 2 .8c.4 0 .7.2 1 .3l1 .4c1.5.5 3 1 4.5 1.3l3 .7 3.2.4 3.6.3c1.3.2 2.6.2 4 .2 2.2 0 4.2-.2 5.8-.5.4 0 .6 0 .7-.2l3-1c0-.2.3-.4.5-.5.2 0 .3-.3.5-.5.7-.7 1-1.7 1-2.8 0-.7 0-1.3-.4-2l-1.6-1.6-2.8-1.7c-1-.6-2.3-1.2-3.6-1.7l-4.5-1.8c-1.2-.5-2.8-1-4.7-2l-5-2.3-4.5-2.8c-1.6-1-3-2.3-4.3-3.6-1.3-1.3-2.4-2.8-3.4-4.4l-.8-1.5-.7-1.5c-1-2.7-1.5-6-1.6-9.3 0-2.2.3-4 .7-6 .6-2 1.3-3.6 2.2-5.2 1-1.5 2-3 3.2-4.2 1.2-1.3 2.6-2.4 4-3.4 1.6-1 3.2-1.8 4.8-2.5 1.7-.8 3.4-1.4 5.2-1.8 1.8-.5 3.6-.8 5.4-1 1.8-.2 3.7-.3 5.6-.3h6l1 .2c1.3 0 2.7.3 4 .6l1.4.2 1.2.3c2 .4 4 1 5.7 1.6 1.2.3 2.4.8 3.4 1.2 1.2.4 2.3 1 3.3 1.4l2 1-.8 2L356 58l-.8 1.8-2-.6-5.6-1.6-2.8-.7-3-.6-3-.3H335c-1.7 0-3.2.2-4.4.5-1 .2-1.8.6-2.3 1-.2 0-.3.2-.4.3-.2 0-.3.2-.4.4-.4.6-.6 1.2-.6 2v.7c.3.6 1 1.3 2 2 .8.6 1.8 1.2 3 1.8 1 .6 2.3 1.2 3.7 1.8l1.2.5 1.2.6 6.8 3 5 2.5 4.7 3c1.5 1.2 3 2.5 4.3 3.8 1.3 1.4 2.5 3 3.4 4.5 1 1.7 2 3.5 2.4 5.5.5 2 .8 4 .8 6.4v2l-.3 2c-.4 3-1.4 6-3 8.4-1 1.7-2 3.3-3.5 4.7-1.4 1.4-3 2.6-4.7 3.7-1.6 1-3.4 2-5.3 2.7-2 .7-3.8 1.3-6 1.8-2 .5-4 .8-6.2 1-2 .2-4.2.3-6.3.3zM77.7 114c-14.2 3.8-30.2 6.4-45 3.5-5.8-1-11-3.5-16-7-5-3.7-8.8-9-12-16.2-3-7.2-4.7-17-4.7-29 0-12.3 2-22 5.6-29.5 3.4-7.4 7.7-13 13-16.7 5.4-3.6 10.8-6 16.6-7.3C41 10.5 46 10 50.7 10c7 0 22 2 29.2 6.7v23.8c-7.5-3.8-18-5.7-26-6-2.6 0-5 .4-7.4 1-2.4.6-4.6 2-6.6 4-1.8 2.2-3.3 5.4-4.4 9.4-1.4 4-2 9.4-2 16.2 0 6 .5 10.8 1.6 14.5.8 3.8 1.8 7 3.6 9 6.5 7.6 20.8 5 30.5 2.4.8 8 2.8 16.4 8.4 23z"/><path d="M132.3 67.3l-6 .2c-6.4 0-11 1-13.8 3.4-3 2.2-4.3 6.3-4.2 12.4 0 5 1 8.4 2.8 10.3 2 2 4.4 2.7 7.2 2.6 3.5 0 6-1 8.7-2.3v10.3c0 3.4.5 6 1.6 8-4 1.7-6.3 3-10.5 4.2-5 1.5-10 2.5-13.6 2.6-23.8.8-29.8-17-29.8-33.8 0-7.2 1.4-13 4.2-17.7 2.6-4.6 5.8-8 9.7-10.3 4.2-2.5 8.4-4.2 13-5.2 4.4-.7 8.5-1 12.4-1H132v-6.2c0-4-1-6.8-3.2-8-2-1.3-5.6-2-10.3-2-5.8.2-28.2 2.5-33.3 5.8V16c11.6-4.4 31.8-6 38.7-6 12-.2 21.8 2 29.7 6.3 4 2.6 6.8 6.2 9 10.7 2 4.8 3 10.8 3 18l.2 72h-.2v.5h-9.6c-11 0-24 1.2-24-14.3V67.3zM171.6 12h28.6l4.4 10.7c0-.3 3.4-2.5 10-6.4 3-1.8 6.8-3 11-4.4 4-1.3 8.2-2 12.8-2 9-.2 16.2 2 21.7 6.5 5.7 4.7 8.6 13 8.6 24.8v61.5c0 15.5-13 14.3-24 14.3H235V45.4c0-3.5-.5-6-1.8-7-1.2-1.3-3.8-1.8-7.3-1.8-5.2 0-9.7 1-14 3l-7 3.5v74.2H172L171.6 12zM286 0c8.6 0 15.7 7 15.7 15.7 0 8.6-7 15.7-15.7 15.7-8.6 0-15.7-7-15.7-15.7S277.3 0 286 0z"/></svg>
      <h2>Build CRUD apps in fewer lines of code</h2>
      <button name="btn" onclick="/guides/todomvc.html">Learn how to build a CRUD app</button>
    </div>
  </div>
</div>
<div class="three-col-wrapper">
  <div class="col-container">
    <h3>Model layer</h3>
    <p>Your components shouldn’t be concerned with how your data is fetched, cached, or sent to the server for updates.</p>
    <p>CanJS provides the right abstractions for your model code to be cleanly separated from your UI code.</p>

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
```
  </div>
  <div class="col-container">
    <h3>Promises in templates</h3>
    <p>CanJS’s [can-stache stache templating language] can directly read the state and values from Promises.</p>
    <p>No extra code to determine whether the Promise is still pending, has been resolved, or resulted in an error.</p>

```handlebars
{{#if(promise.isPending)}}
	Loading…
{{/if}}

{{#if(promise.isRejected)}}
	Error:
	{{promise.reason.message}}
{{/if}}

{{#if(promise.isResolved)}}
	Value:
	{{promise.value}}
{{/if}}
```
  </div>
  <div class="col-container">
    <h3>Real-time list updating</h3>
    <p>After data is created, updated, or destroyed, CanJS automatically updates your lists for you.</p>
    <p>Filtering and sorting are preserved, so you don’t have to manually update your lists
or fetch the same data again.</p>

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Todo.getList({filter: {completed: true}}).then(todos => {// Get completed todos

  const newTodo = new Todo({completed: false});// Create a not-completed todo

  newTodo.completed = true;// Set it to completed

  // todos now contains newTodo because
  // it matches {filter: {completed: true}}
});
```
  </div>
</div>
<div class="gray-callout social">
  <h2>Our community has your back</h2>
  <div class="social-two-col">
    <div class="left-col">
      <p>CanJS is backed by Bitovi, a company built on using and publishing open source software. Our community is here to help you get started and answer your questions. Join us on Slack or our Discourse forums.</p>
    </div>
    <div class="right-col">
      <img alt="Slack" src="../docs/images/logos/Slack RGB.svg" />
      <img alt="Discourse" src="../docs/images/logos/Discourse_icon.svg" />
    </div>
  </div>
</div>
<div class="single-col-wrapper">
  <h2>Get started with just a few lines of code</h2>
  <p>If you’re like us, you build interactive web apps where users need to <strong>C</strong>reate, <strong>R</strong>ead, <strong>U</strong>pdate, and <strong>D</strong>elete data.</p>
  <p>CanJS provides all the tools you need to fetch your data, render your user interface, and make it interactive, in fewer lines of code than other JavaScript frameworks.</p>
  <p class="codepen" data-height="512" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="omqyMw" style="height: 512px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — Basic Todo App">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/omqyMw/">
  CanJS 5 — Basic Todo App</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span></p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
  <span class="caption">Define your custom types, connect to a backend API, create a custom element, render a list of data, and make the list editable.
  Write CRUD apps like this in just a few lines of code.</span>
  <button name="btn" onclick="/guides/todomvc.html">Learn how to build a CRUD app</button>
</div>
<div class="code-overview">
  <div class="code-proof">
    <div class="left-col">
      <h3>One-way and two-way binding</h3>
      <p>Your app’s model data is stored in your custom data types. CanJS’s one-way and two-way binding syntax let you bind directly to your model data. Read directly from it and write directly to it without additional helper functions.</p>
      <p>Additionally, the binding syntax makes it easy to pass data down to child components, extract data from child components, and two-way bind to form elements. Listening to any DOM (or custom) event is easy too. The syntax is clear and succinct, which means it’s easy to read and write.</p>
    </div>
    <div class="right-col">
      <img src="https://via.placeholder.com/880x350" />
    </div>
  </div>
  <div class="code-proof">
    <div class="left-col">
      <h3>CanJS has all the tools you need to build your app</h3>
      <p>Don’t waste your time hacking together a bunch of libraries that might not work together. CanJS has libraries for working with APIs, creating object-oriented observables, binding to form elements, building reusable custom elements, routing, and more.</p>
    </div>
    <div class="right-col">
      <img src="https://via.placeholder.com/880x350" />
    </div>
  </div>
  <div class="code-proof">
    <div class="left-col">
      <h3>No build tool or CLI required</h3>
      <p>Start a CanJS app with just a single import statement. No compiler, no build step, no configuration, no special tools required.</p>
    </div>
    <div class="right-col">
      <img src="https://via.placeholder.com/880x350" />
    </div>
  </div>
  <div class="code-proof">
    <div class="left-col">
      <h3>Become an expert quickly with our extensive guides & documentation</h3>
      <p>Our guides will teach you the best way to architect your application so you spend less time maintaining it and more time building features that make you money.</p>
    </div>
    <div class="right-col last-item">
      <img src="https://via.placeholder.com/880x350" />
    </div>
  </div>
</div>
<div class="gray-callout clients">
  <div class="clients-single-col">
    <h2>Trusted by Enterprise Companies</h2>
    <div class="client-logos">
      <img alt="Apple" src="../docs/images/logos/apple.svg" />
      <img alt="Bitovi" src="../docs/images/logos/bitovi.svg" />
      <img alt="Chase" src="../docs/images/logos/chase.svg" />
      <img alt="Delta" src="../docs/images/logos/delta.svg" />
      <img alt="FedEx" src="../docs/images/logos/fedex.svg" />
      <img alt="HP" src="../docs/images/logos/hp.svg" />
      <img alt="Tucows" src="../docs/images/logos/tucows.svg" />
    </div>
  </div>
</div>
<div class="two-col-wrapper">
  <div class="">
    <h3>Use DevTools to debug your app</h3>
    <p>Use the CanJS DevTools to edit your app’s state at runtime, visualize the dependency graphs between elements and state, and debug changes to observables.</p>
    <h3>Small bundle size</h3>
    <p>At 72 KB gzipped, CanJS provides all the tools you need at a small size.</p>
  </div>
  <div class="">
    <h3>Browser support</h3>
    <p>CanJS supports Internet Explorer 11, Chrome, Edge, Firefox, and Safari.</p>
    <img src="https://saucelabs.com/browser-matrix/canjs.svg" alt="Sauce Test Status" />
  </div>
</div>
<div class="gray-callout footer">
  <div class="footer-single-col">
    <button name="btn" onclick="/guides/todomvc.html">Take the CRUD Tutorial</button>
  </div>
</div>
