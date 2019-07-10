@page guides/server-side-rendering Server-Side Rendering
@parent guides/topics 10
@outline 2

@description Learn how to set up SSR for CanJS.

@body

CanJS applications can be rendered on the server by running the same code that’s used in the browser. This is known as [Isomorphic JavaScript](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) or [Universal JavaScript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9).

## DoneJS

CanJS is part of the [DoneJS framework](https://donejs.com/), which includes SSR out of the box.

For information on using SSR without setting anything up yourself, check out the DoneJS [quick start](https://donejs.com/Guide.html) and [in-depth](https://donejs.com/place-my-order.html) guides.

## On your own

Using [can-vdom] and [can-zone](https://v4.canjs.com/doc/can-zone.html), you can set up your own SSR system based on the [APIs DoneJS uses for SSR](https://donejs.com/Apis.html#server-side-rendering-apis). This is not for the faint of heart, so we encourage you to try DoneJS first before writing your own SSR system.
