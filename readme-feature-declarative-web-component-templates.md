## Write declarative templates for web components

Custom elements have an imperative syntax for defining templates. The [<template>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) element helps a little bit, but you still have to write your own imperative code for cloning and updating those templates.

CanJS’s [stache templating language](https://canjs.com/doc/can-stache.html) is similar to Handlebars and Mustache. Declaratively define your UI and and it will be automatically updated whenever one of your custom element’s properties changes.

Write less code and save yourself time by using CanJS’s declarative templating syntax for web components.

```handlebars
import { StacheElement } from "can/everything";

class Counter extends StacheElement {
    static view = `
        Count: <span>{{this.count}}</span>
        <button on:click="this.increment()">+1</button>
    `;
    static props = {
        count: 0
    };
    increment() {
        this.count++;
    }
}
customElements.define("count-er", Counter);
```