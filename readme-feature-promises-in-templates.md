## Promises in templates

CanJS’s [stache templating language](https://canjs.com/doc/can-stache.html) is similar to Handlebars and Mustache. Wherever you see `{{ }}` in a template, CanJS evaluates the expression inside to either print a value or perform some basic logic, like [#if](https://canjs.com/doc/can-stache.helpers.if.html) and [#for(of)](https://canjs.com/doc/can-stache.helpers.for-of.html).

Stache is able to read the state and value of Promises. See `isPending`, `isRejected`, and `isResolved` being read on `this.todosPromise` in the example code? Those return true depending on the current state of the Promise. `reason` is provided if the Promise is rejected with an error, and `value` contains the resolved value if the promise succeeds.

These helpers make it much easier to include loading and error states in your app. We promise you’ll love writing your templates this way.

```handlebars
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