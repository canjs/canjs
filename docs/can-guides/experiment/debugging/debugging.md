@page guides/debugging Debugging Guide
@parent guides/experiment 3

@description Learn how to debug CanJS applications.

@body

CanJS has many utilities that help you understand how your application behaves and
discover common problems. This guide is a central list for those utilities. It introduces
those utilities and highlights when they are useful.

## Setup Debugging

CanJS does not have a global export; instead, every module must be imported. While this
improves longevity, it makes access to debugging utilities difficult.  The [can-debug]
project adds a `can` object to the global window, making all of CanJS's packages
available.

For example, `can-queue`'s [can-queues.logStack] method can be called like:

```js
import queues from "can-queues";
queues.logStack();
```

However, if any part of your application imports [can-debug], you can log the stack like:

```js
can.queues.logStack()
```

> NOTE: When first accessing properties on the global `can`, a warning will be logged. This is to discourage
> relying on the global `can` object.

Therefore, it's useful to import [can-debug] __only__ in development.  The following shows how to set this up
for Webpack and StealJS:


### StealJS setup

StealJS supports two ways of loading `can-debug` only in production:

- `//!steal-remove-start` comments
- conditional modules

#### Using steal-remove-start comments

Add the following to your main module:

```js
//!steal-remove-start
require('can-debug');
//!steal-remove-end
```

#### Conditional loading

Conditional loading makes it possible to load a module only when other modules export true. To start, we'll create a `is-dev` module:

```js
// is-dev.js
export default !steal.isEnv("production");
```

Then we can conditionally load modules like:

```js
import import 'can-debug#?~is-dev'
```

### WebPack Setup


## Debugging what caused a observable event or update to happen.

Your browser's developer tools provide a stack trace that is invaluable for
discovering the what caused the current function to run.

However, what caused a function to
run isn't always obvious by looking at the stack because CanJS runs
functions within [can-queues].

Use [can-queues.logStack] to see the enqueued tasks that resulted in the
current function being run:

```js
can.queues.logStack();
```

## viewModel



## Queues

- use function names

## can-debug


can.debug.logWhatChangesMe(obs, [key])

can.debug.logWhatIChange(obs, [key])




NOTES

- How to work with can-debug
