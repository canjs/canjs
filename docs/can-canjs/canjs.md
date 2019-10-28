@page canjs CanJS — Build CRUD apps in fewer lines of code.
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description CanJS is a JavaScript framework for building CRUD apps in fewer lines of code.

@body

<style>
.on-this-page-table {
  display: none;
}
abbr[title] {
  text-decoration: underline #c4c4c3;
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
  line-height: 1;
  margin-bottom: 15px;
}
h3 {
  font-size: 28px;
  line-height: 1;
  color: #282C33;
  margin-bottom: 10px;
}
code[class*=language-]:before {
  content: "";
  background-color: #f5f5f5;
  height: 25px;
  width:100%;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: solid 1px #dfdfdf;
}
p + ul {
  margin-top: 0;
}
.title .description {
  display: none;
}
.btn {
  display: inline-flex;
  border-radius: 5px;
  background-color: #3e7abe;
  margin: 0 auto;
  padding: 13px 23px;
  font-size: 24px;
  color: #fff;
  letter-spacing: 0;
  text-align: center;
}
.body {margin: 0}
.caption {
  display: flex;
  margin: 15px 30px;
  font-style: italic;
  line-height: 1.5;
}
.title {
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
  display: flex;
  align-items: center;
  max-height: 400px;
  overflow: hidden;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
.hero-secton h2 {
  margin-bottom: 0;
}
.hero-section .left-col {
  padding: 30px 0 0 60px;
}
.hero-section .right-col {
  flex: 1;
}
.hero-section .right-col img {
  margin-top: 40px;
  max-height: 370px;
}
.hero-section .btn {
  margin: 30px 0;
}
.hero-logo {
  fill: #3e7abe;
  width: 300px;
  height: 118px;
}
.single-col-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 1440px;
  margin: 40px auto;
  width: 100%;
}
.single-col-wrapper .content-wrapper {
  margin-left: 30px;
  margin-right: 30px;
}
.single-col-wrapper .btn-wrapper {
  margin: 45px auto 30px auto;
  text-align: center;
  width: 100%;
}
.three-col-wrapper {
  display: flex;
  max-width: 1440px;
  text-align: center;
  margin: auto;
}
.three-col-wrapper .col-container {
  margin: 40px 30px;
  text-align: left;
  width: 33.33%;
}
.three-col-wrapper .col-container h3 {
  transition: all .3s ease-in-out;
}
.three-col-wrapper .col-container .content {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}
.three-col-wrapper .col-container .content-details {
  min-height: 225px;
}
.three-col-wrapper .col-container .content-image {
  text-align: center;
  margin: auto;
}
.three-col-wrapper .col-container .modal-layer {
  margin-top: -10px;
}
.three-col-wrapper .col-container .real-time-list {
  margin-top: -19px;
}
.three-col-wrapper .col-container .content object {
  margin: auto;
  min-width: 280px;
}
.three-col-wrapper a.col-container {
  border: 3px solid transparent;
  transition: all .3s ease-in-out;
}
.three-col-wrapper a.col-container:hover {
  text-decoration: none;
  border: 3px solid #0288C9;
}
.three-col-wrapper a.col-container:hover h3 {
  border-bottom: 1px solid #0288C9;
}
.social {
  display: flex;
  flex-direction: column;
  padding: 40px 30px;
}
.social h2 {
  margin-bottom: 15px;
}
.social .social-two-col {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: auto;
  max-width: 1375px;
}
.social-two-col .left-col {
  display: flex;
  flex-direction: column;
  margin-right: 60px;
}
.social-two-col .right-col {
  display: flex;
}
.social-two-col p {
  padding-bottom: 0;
}
.social-two-col .right-col a {
  margin-right: 45px;
}
.social-two-col .right-col a:last-of-type {
  margin-right: 5px;
}
.social-two-col img {
  height: 40px;
}
.social-two-col .github {
  height: 35px;
}
.code-overview {
  display: flex;
  flex-direction: column;
  max-width: 1440px;
  margin: auto;
}
.code-overview h3 {
  font-weight: 500;
}
.code-proof {
  display: flex;
  flex-wrap: wrap;
  margin: 40px 30px 20px;
}
.code-proof:last-of-type {
  margin-bottom: 40px;
}
.code-proof .left-col {
  display: flex;
  flex-direction: column;
  flex: 2;
  margin-right: 60px;
}
.code-proof .right-col {
  align-items: center;
  display: flex;
  flex: 2;
}
.code-proof .code-toolbar {
  text-align: center;
  margin: auto;
  width: 560px;
}
.clients {
  display: flex;
  flex-direction: column;
  padding: 45px 30px;
}
.clients-single-col {
  display: flex;
  flex-direction: column;
  max-width: 1455px;
  margin: auto;
  text-align: center;
  width: 100%;
}
.clients h2 {
  text-align: center;
  margin-bottom: 15px;
}
.client-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.client-logos img {
  height: 32px;
  margin: 10px;
}
.two-col-wrapper {
  display: flex;
  max-width: 1440px;
  margin: 50px auto
}
.two-col-wrapper div {
  width: 50%;
  margin-left: 30px;
  margin-right: 30px;
}
.two-col-wrapper img {
  max-width: 100%;
}
.footer .btn {
  margin: 45px auto;
}
.footer-single-col {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.sm-bundle-svg {
    float: right;
    height: 60px;
    margin-top: -15px;
    margin-left: 15px;
}
.line-numbers-rows {
  display: none;
}
pre[class*=language-] {
  margin-top: 0;
}
pre[class*=language-].line-numbers.line-numbers code {
  padding: 40px 15px 15px;
}
.social-links {
  display: -webkit-box;
  display: -moz-box;
  display: -webkit-flex;
  display: flex;
  list-style: none;
  margin: 15px 0;
  padding: 0;
  flex-basis: 100%;
  align-self: flex-start;
}
.social-links li {
  margin-right: 15px;
}
@@media (min-width: 1699px) {
  .three-col-wrapper .col-container .content {
    flex-direction: column;
  }
}
@@media (max-width: 1699px) {
  .three-col-wrapper .col-container .content {
    flex-direction: column;
  }
  .three-col-wrapper .col-container .content object,
  .three-col-wrapper .col-container .content .code-toolbar {
    margin-bottom: 15px;
  }
}
@@media (max-width: 1229px) {
  .hero-section {
    background-position: 110%;
  }
  .hero-section .left-col {
    width: 50%;
    padding-top: 60px;
  }
  .social-two-col .right-col {
    flex-direction: column;
  }
  .social-two-col .right-col a {
    margin-right: 30px;
    margin-bottom: 30px;
  }
  .social-two-col .right-col a:last-of-type {
    margin-right: 0;
    margin-bottom: 0;
  }
}
@@media (max-width: 1159px) {
  .code-proof .left-col {
    width: 100%;
    flex: none;
  }
  .code-proof .right-col {
    width: 100%;
    flex: none;
  }
}
@@media (max-width: 1099px) {
  .three-col-wrapper {
    flex-wrap: wrap;
  }
  .three-col-wrapper .col-container {
    width: 100%;
    margin: 10px 30px;
  }
  .three-col-wrapper .col-container:first-of-type {
    margin-top: 40px;
  }
  .three-col-wrapper .col-container:last-of-type {
    margin-right: 10px;
    margin-bottom: 20px;
  }
  .three-col-wrapper .col-container .content {
    flex-direction: row;
  }
  .three-col-wrapper .col-container .content object,
  .three-col-wrapper .col-container .content .code-toolbar {
    margin: auto 0 auto 30px;
  }
  .three-col-wrapper .col-container .modal-layer {
    margin-top: 0;
  }
  .three-col-wrapper .col-container .real-time-list {
    margin-top: 0;
  }
}
@@media (max-width: 999px) {
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
    align-items: baseline;
    flex-direction: row;
    width: 100%;
    margin-top: 10px;
  }
  .social-two-col .right-col a {
    margin-right: 30px;
    margin-bottom: 30px;
  }
  .social-two-col .right-col a:last-of-type {
    margin-right: 0;
    margin-bottom: 0;
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
  }
  .three-col-wrapper .col-container .content {
    flex-direction: column;
  }
  .three-col-wrapper .col-container .content-details {
    min-height: 0;
  }
}
@@media (max-width: 759px) {
  .hero-section {
    background-image: none;
  }
  .hero-section .left-col {
    width: 100%;
    padding: 30px 30px 0 30px;
    height: unset;
  }
  .hero-section .right-col {
    display: none;
  }
  .social {
    padding-right: 30px;
    padding-left: 30px;
  }
  .social-two-col .right-col {
    flex-wrap: wrap;
  }
  .caption {
    margin-right: 15px;
    margin-left: 15px;
  }
  .code-proof .code-toolbar {
    width: 100%;
  }
}
@@media (max-width: 529px) {
  .hero-logo {
    width: 260px;
  }
  .three-col-wrapper .col-container:last-of-type {
    margin-right: 30px;
    margin-bottom: 20px;
  }
  .three-col-wrapper .col-container .content {
    flex-direction: column;
  }
  .three-col-wrapper .col-container .content object,
  .three-col-wrapper .col-container .content .code-toolbar {
    margin-bottom: 15px;
    margin-left: 0;
  }
  .three-col-wrapper .col-container .content .code-toolbar {
    margin-top: 10px;
  }
  .social-two-col img {
    height: 30px;
  }
  .social .social-two-col .right-col {
    margin-top: 0;
  }
  .social .social-two-col .right-col a {
    margin-bottom: 0;
  }
}
</style>

<div class="gray-callout max-container">
  <div class="hero-section">
    <div class="left-col">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365.7 144.4" class="hero-logo"><path d="M265.5 142.6l-7-13.8-1-2 2-1 5.8-3.6c1.6-1 3-2.2 4-3.2s2-2 2.6-3.2c.6-1 1.2-2.3 1.5-3.5l.3-1c0-.6.2-1 .3-1.3.5-2.2.7-4.8.7-7.8V37H298.6v68.2c0 3-.4 5.8-.8 8.6l-.3 1.6c0 .5-.2 1-.4 1.7-.6 3-1.7 5.6-3.2 8.2-1 2-2.4 3.7-4 5.4-1.4 1.6-3.2 3.2-5.3 4.7-.6.5-1.2 1-1.8 1.3l-2 1.2c-3.5 2-7.6 3.8-12.5 5.4l-2 .6-.7-1.6zm64.7-19.8c-2.3 0-4.4 0-6.3-.2-2 0-3.8-.3-5.6-.6l-4.8-1-4.3-1-3.7-1.6c-1.2-.5-2.3-1-3.3-1.6l-1.8-1 .7-2 5.4-13.7.8-2 2 .8c.4 0 .7.2 1 .3l1 .4c1.5.5 3 1 4.5 1.3l3 .7 3.2.4 3.6.3c1.3.2 2.6.2 4 .2 2.2 0 4.2-.2 5.8-.5.4 0 .6 0 .7-.2l3-1c0-.2.3-.4.5-.5.2 0 .3-.3.5-.5.7-.7 1-1.7 1-2.8 0-.7 0-1.3-.4-2l-1.6-1.6-2.8-1.7c-1-.6-2.3-1.2-3.6-1.7l-4.5-1.8c-1.2-.5-2.8-1-4.7-2l-5-2.3-4.5-2.8c-1.6-1-3-2.3-4.3-3.6-1.3-1.3-2.4-2.8-3.4-4.4l-.8-1.5-.7-1.5c-1-2.7-1.5-6-1.6-9.3 0-2.2.3-4 .7-6 .6-2 1.3-3.6 2.2-5.2 1-1.5 2-3 3.2-4.2 1.2-1.3 2.6-2.4 4-3.4 1.6-1 3.2-1.8 4.8-2.5 1.7-.8 3.4-1.4 5.2-1.8 1.8-.5 3.6-.8 5.4-1 1.8-.2 3.7-.3 5.6-.3h6l1 .2c1.3 0 2.7.3 4 .6l1.4.2 1.2.3c2 .4 4 1 5.7 1.6 1.2.3 2.4.8 3.4 1.2 1.2.4 2.3 1 3.3 1.4l2 1-.8 2L356 58l-.8 1.8-2-.6-5.6-1.6-2.8-.7-3-.6-3-.3H335c-1.7 0-3.2.2-4.4.5-1 .2-1.8.6-2.3 1-.2 0-.3.2-.4.3-.2 0-.3.2-.4.4-.4.6-.6 1.2-.6 2v.7c.3.6 1 1.3 2 2 .8.6 1.8 1.2 3 1.8 1 .6 2.3 1.2 3.7 1.8l1.2.5 1.2.6 6.8 3 5 2.5 4.7 3c1.5 1.2 3 2.5 4.3 3.8 1.3 1.4 2.5 3 3.4 4.5 1 1.7 2 3.5 2.4 5.5.5 2 .8 4 .8 6.4v2l-.3 2c-.4 3-1.4 6-3 8.4-1 1.7-2 3.3-3.5 4.7-1.4 1.4-3 2.6-4.7 3.7-1.6 1-3.4 2-5.3 2.7-2 .7-3.8 1.3-6 1.8-2 .5-4 .8-6.2 1-2 .2-4.2.3-6.3.3zM77.7 114c-14.2 3.8-30.2 6.4-45 3.5-5.8-1-11-3.5-16-7-5-3.7-8.8-9-12-16.2-3-7.2-4.7-17-4.7-29 0-12.3 2-22 5.6-29.5 3.4-7.4 7.7-13 13-16.7 5.4-3.6 10.8-6 16.6-7.3C41 10.5 46 10 50.7 10c7 0 22 2 29.2 6.7v23.8c-7.5-3.8-18-5.7-26-6-2.6 0-5 .4-7.4 1-2.4.6-4.6 2-6.6 4-1.8 2.2-3.3 5.4-4.4 9.4-1.4 4-2 9.4-2 16.2 0 6 .5 10.8 1.6 14.5.8 3.8 1.8 7 3.6 9 6.5 7.6 20.8 5 30.5 2.4.8 8 2.8 16.4 8.4 23z"/><path d="M132.3 67.3l-6 .2c-6.4 0-11 1-13.8 3.4-3 2.2-4.3 6.3-4.2 12.4 0 5 1 8.4 2.8 10.3 2 2 4.4 2.7 7.2 2.6 3.5 0 6-1 8.7-2.3v10.3c0 3.4.5 6 1.6 8-4 1.7-6.3 3-10.5 4.2-5 1.5-10 2.5-13.6 2.6-23.8.8-29.8-17-29.8-33.8 0-7.2 1.4-13 4.2-17.7 2.6-4.6 5.8-8 9.7-10.3 4.2-2.5 8.4-4.2 13-5.2 4.4-.7 8.5-1 12.4-1H132v-6.2c0-4-1-6.8-3.2-8-2-1.3-5.6-2-10.3-2-5.8.2-28.2 2.5-33.3 5.8V16c11.6-4.4 31.8-6 38.7-6 12-.2 21.8 2 29.7 6.3 4 2.6 6.8 6.2 9 10.7 2 4.8 3 10.8 3 18l.2 72h-.2v.5h-9.6c-11 0-24 1.2-24-14.3V67.3zM171.6 12h28.6l4.4 10.7c0-.3 3.4-2.5 10-6.4 3-1.8 6.8-3 11-4.4 4-1.3 8.2-2 12.8-2 9-.2 16.2 2 21.7 6.5 5.7 4.7 8.6 13 8.6 24.8v61.5c0 15.5-13 14.3-24 14.3H235V45.4c0-3.5-.5-6-1.8-7-1.2-1.3-3.8-1.8-7.3-1.8-5.2 0-9.7 1-14 3l-7 3.5v74.2H172L171.6 12zM286 0c8.6 0 15.7 7 15.7 15.7 0 8.6-7 15.7-15.7 15.7-8.6 0-15.7-7-15.7-15.7S277.3 0 286 0z"/></svg>
      <h2>Build <abbr title="Apps that Create, Read, Update, and Delete data">CRUD apps</abbr> in fewer lines of code</h2>
      <a href="./doc/guides/crud-beginner.html" class="btn">Learn how to build this CRUD app</a>
    </div>
    <div class="right-col">
      <img src="docs/images/hero-image.svg" width="642" height="370" />
    </div>
  </div>
</div>
<div class="three-col-wrapper">
  <div class="col-container">
    <div class="content">
      <div class="content-details">
        <h3>Model layer</h3>
        <p>Components shouldn’t be concerned with how data is fetched, updated, or cached.</p>
        <p>
          CanJS provides the right abstractions for your model code to be cleanly separated from your UI code.
          <a href="#model-layer">Learn&nbsp;more…</a>
        </p>
      </div>
      <div class="content-image modal-layer">
        <object type="image/svg+xml" data="docs/images/animations/model-layer-still.svg"></object>
      </div>
    </div>
  </div>
  <div class="col-container">
    <div class="content">
      <div class="content-details">
        <h3>Promises in templates</h3>
        <p>CanJS’s [can-stache stache templating language] can directly read the state and values from <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promises</a>.</p>
        <p>
          No need to write any extra code to determine whether a Promise is pending, resolved, or rejected.
          <a href="#promises-in-templates">Learn&nbsp;more…</a>
        </p>
      </div>
      <div class="content-image">

```html
{{# if(this.promise.isPending) }}
  Loading…
{{/ if }}
{{# if(this.promise.isRejected) }}
  Error: {{ this.promise.reason }}
{{/ if }}
{{# if(this.promise.isResolved) }}
  Result: {{ this.promise.value }}
{{/ if }}
```
</div>
</div>
  </div>
  <div class="col-container">
    <div class="content">
      <div class="content-details">
        <h3>Real-time list updating</h3>
        <p>After data is created, updated, or destroyed, CanJS automatically updates your lists for you.</p>
        <p>
          Filtering and sorting are preserved, so you don’t have to manually update your lists or fetch the same data again.
          <a href="#real-time-list-updating">Learn&nbsp;more…</a>
        </p>
      </div>
      <div class="content-image real-time-list">
        <object type="image/svg+xml" data="docs/images/animations/realtime-amin.svg"></object>
      </div>
    </div>
  </div>
</div>
<div class="gray-callout social">
  <div class="social-two-col">
    <div class="left-col">
      <h2>We have your back</h2>
      <p>CanJS is backed by <a href="https://www.bitovi.com/">Bitovi</a>, a company built on using and publishing open source software. We answer every question on <a href="https://bitovi.com/community/slack">our Slack</a> and <a href="https://forums.bitovi.com/">our Discourse forums</a>. We want to help you get started with CanJS!</p>
      <ul class="social-links">
        <li>
          <a class="github-button nav-social" href="https://github.com/canjs/canjs" data-count-href="/canjs/canjs/stargazers" data-show-count="true">Star</a>
        </li>
        <li>
          <a href="https://twitter.com/canjs" class="twitter-follow-button nav-social" data-show-count="true" data-show-screen-name="false">Follow @canjs</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
        </li>
      </ul>
    </div>
    <div class="right-col">
      <a href="https://bitovi.com/community/slack">
        <img alt="Slack" src="../docs/images/logos/slack.svg" />
      </a>
      <a href="https://forums.bitovi.com/">
        <img alt="Discourse" src="../docs/images/logos/discourse.svg" />
      </a>
    </div>
  </div>
</div>
<div class="code-overview">
  <div class="code-proof">
    <div class="left-col">
      <h3 id="model-layer">Model layer</h3>

With a single line of code, CanJS creates a model that represents the objects returned by a backend API.
See how `Todo` is created by passing a URL to [can-realtime-rest-model realtimeRestModel()].

The model layer is responsible for making GET, POST, PUT, and DELETE requests to your backend.
With your component UI code using the model’s standard interface to make requests, if the backend API changes,
you only have to configure the model and not change every component that uses that backend API.

By default, CanJS assumes your backend API is RESTful. If your backend API isn’t RESTful, that’s ok!
CanJS has configuration options for you to control how it makes requests, parses data, and more.

</div>
<div class="right-col">

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;

// Get todos sorted by name
const todosPromise = Todo.getList({sort: "name"});
todosPromise.then(todos => {
  // Your backend API might return something like:
  // todos = [ {name: "a"}, {name: "b"}, {name: "c"} ]
});
```

</div>
</div>
<div class="code-proof">
<div class="left-col">
<h3 id="promises-in-templates">Promises in templates</h3>

CanJS’s [can-stache stache templating language] is similar to Handlebars and Mustache.
Wherever you see `{{ }}` in a template, CanJS evaluates the expression inside to either
print a value or perform some basic logic, like [can-stache.helpers.if #if] and
[can-stache.helpers.for-of #for(of)].

Stache is able to read the state and value of Promises. See `isPending`, `isRejected`,
and `isResolved` being read on `this.todosPromise` in the example code? Those return
true depending on the current state of the Promise. `reason` is provided if the
Promise is rejected with an error, and `value` contains the resolved value if
the promise succeeds.

These helpers make it much easier to include loading and error states in your app.
We promise you’ll love writing your templates this way.

</div>
<div class="right-col">

```html
{{# if(this.todosPromise.isPending) }}
	Loading todos…
{{/ if }}
{{# if(this.todosPromise.isRejected) }}
	Error: {{ this.todosPromise.reason.message }}
{{/ if }}
{{# if(this.todosPromise.isResolved) }}
	<ul>
		{{# for(todo of this.todosPromise.value) }}
			<li>
				{{ todo.name }}
			</li>
		{{/ for }}
	</ul>
{{/ if }}
```

</div>
</div>
<div class="code-proof">
  <div class="left-col">
    <h3 id="real-time-list-updating">Real-time list updating</h3>

Here you can see CanJS’s model layer in action. When `Todo.getList({sort: "name"})` is called,
CanJS makes a GET request to `/api/todos?sort=name`

When the array of to-dos comes back, CanJS associates that array with the query `{sort: "name"}`.
When new to-dos are created, they’re added to the list that’s returned _automatically_, and
in the right spot! You don’t have to write any code to make sure the new to-do gets inserted
into the right spot in the list.

CanJS does this for filtering as well. If you make a query with a filter (e.g. `{filter: {complete: true}}`),
when items are added, edited, or deleted that match that filter, those lists will be updated automatically.

Save yourself time by not writing code that updates your app’s UI.

</div>
<div class="right-col">

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;

// Get completed todos
Todo.getList({sort: "name"}).then(todos => {
  // Let’s assume the API came back with
  // todos = [ {name: "a"}, {name: "c"} ]

  // Create a new todo client-side
  const newTodo = new Todo({name: "b"});

  // The todos list is immediately updated with the
  // new to-do in the right place, alphabetically:
  // todos = [ {name: "a"}, {name: "b"}, {name: "d"} ]
});
```

</div>
</div>
</div>

<div class="gray-callout footer">
  <div class="footer-single-col">
    <a href="./doc/guides/crud-beginner.html" class="btn">Take the CRUD Tutorial</a>
  </div>
</div>

<div class="single-col-wrapper">
<div class="content-wrapper">

## Get started with just a few lines of code

Below is an entire app that shows off some of the best features of CanJS:

- One line of code to create a model from the data returned by a backend API (with [can-realtime-rest-model realtimeRestModel]).
- `isPending`, `isRejected`, `isResolved`, and `value` helpers for directly reading the state of a Promise.
- When you add a to-do, it automatically gets inserted into the list in the right position.

<p class="codepen" data-height="560" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="dBKzBZ" style="height: 560px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — Basic Todo App">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/dBKzBZ/">
  CanJS 5 — Basic Todo App</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
  <span class="caption">Type in a new to-do and click “Add” to see it appear in the list. Notice that new to-dos are inserted in alphabetical order, without any code that explicitly inserts the new one in the right place!</span>
  <div class="btn-wrapper">
    <a href="./doc/guides/crud-beginner.html" class="btn">Learn how to build this CRUD app</a>
  </div>
</div>
</div>
<a class="gray-callout clients" href="./doc/guides/who-uses-canjs.html">
  <div class="clients-single-col">
    <h2>Who Uses CanJS?</h2>
    <div class="client-logos">
      <img alt="Chase" src="../docs/images/logos/chase.svg" />
      <img alt="Bitovi" src="../docs/images/logos/bitovi.svg" />
      <img alt="Apple" src="../docs/images/logos/apple.svg" />
      <img alt="Delta" src="../docs/images/logos/delta.svg" />
      <img alt="HP" src="../docs/images/logos/hp.svg" />
      <img alt="FedEx" src="../docs/images/logos/fedex.svg" />
      <img alt="Tucows" src="../docs/images/logos/tucows.svg" />
    </div>
  </div>
</a>
<div class="two-col-wrapper">
  <div class="">
    <h3>Use DevTools to debug your app</h3>
    <p>Use the CanJS DevTools to edit your app’s state at runtime, visualize the dependency graphs between elements and state, and debug changes to observables.</p>
    <h3>Small bundle size</h3>
    <object type="image/svg+xml" class="sm-bundle-svg" data="docs/images/3D-Isometric-Cardboard-Box-opt.svg"></object>
    <p>At 72 KB gzipped, CanJS provides all the tools you need at a small size.</p>
  </div>
  <div class="">
    <h3>Browser support</h3>
    <p>CanJS supports Internet Explorer 11, Chrome, Edge, Firefox, and Safari.</p>
    <img src="https://saucelabs.com/browser-matrix/canjs-not-master.svg" alt="Sauce Test Status" />
  </div>
</div>
<div class="gray-callout footer">
  <div class="footer-single-col">
    <a href="./doc/guides/crud-beginner.html" class="btn">Take the CRUD Tutorial</a>
  </div>
</div>
