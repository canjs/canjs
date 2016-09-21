@page guides/chat Chat Guide
@parent guides/experiment 2


## Setup

This guide walks through building real time chat application with CanJS's
[can-core Core libraries].  It takes about 30 minutes to complete.

@body

## Setup

The easiest way to get started is to clone the following JSBin by clicking the __JS Bin__ button on the top left:


<a class="jsbin-embed" href="http://jsbin.com/fezewi/3/edit?html,output">JS Bin on jsbin.com</a>

The JSBin loads bootstrap for its styles. And [http://socket.io/ socket.io] for a socket
library.  It will be connecting to a restful and real-time service layer at [http://chat.donejs.com/api/messages].

The JSBin also loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.11/dist/global/can.js), which is a script that includes CanJS all of CanJS core under a
single global `can` namespace.

Generally speaking, you should not use the global can script and instead
should import things directly with a module loader like [StealJS](http://stealjs.com),
WebPack or Browserify.  In a real app your code will look like:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/map/map");

var Todo = DefineMap.extend({ ... });
Todo.List = DefineList.extend({ ... });
```

Not:

```js
var Todo = can.DefineMap.extend({ ... });
Todo.List = can.DefineList.extend({ ... });
```

Read [guides/setup] on how to setup CanJS in a real app.
Checkout [https://donejs.com/Guide.html the DoneJS version of this guide].



## Hello World

In this section, we will:

 - Show a big "Chat Home" within a bootstrap container.
 - Make it when "Chat Home" is clicked, a "!" is added to the end of the title.

Update the `HTML` tab to:

 - To create a `<script>` tag containing the content of the `chat-template` template.
 - Have the content insert a `message` value within a responsive Bootstrap container using [can-stache.tags.escaped].
 - Listen for `click` events and call `addExcitement` with [can-stache-bindings.event].

@sourceref ./1-hello-world/html.html
@highlight 12-22,only

Update the `JavaScript` tab to:

 - Define an application view-model (`AppVM`) type by extending [can-define/map/map]. Its definition includes:
   - A `message` property that is a [can-define.types string]
     value [can-define.types.value initialized] to `"Chat Home"`.
   - An `addExcitement` method that adds `"!"` to the end of the `message` property.
 - Create an instance of the `AppVM` type (`appVM`).
 - Compile a [can-stache] [can-stache.renderer template renderer] function from the contents of the `<script>` tag.
 - Render that template with `appVM` as a source of data into a [https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment document fragment].
 - Insert the document fragment into the `<body>` tag.

@sourceref ./1-hello-world/js.js
@highlight 1-15,only

When complete, you should see a large "Chat Home" in the `Output` panel.  Click on it and
things will get really exciting!

This step sets up the essential basics of a CanJS application - a
[can-stache] template rendered with an observable application view model instance.

The properties and methods the template uses are defined in the `AppVM`
type.  The `AppVM` type extends [can-define/map/map].  We
defined a `message` and an `addExcitement` method.

We then created an instance of the `appVM` with the `new` operator. This created
an object with a `message` property and `addExcitement` method.  For example, adding:

```
console.log(appVM.message)
appVM.addExcitement();
console.log(appVM.message)
```

Will print out `"Chat Home"` and then `"Chat Home!"`.

`DefineMap` instances are observable.  This is why when `message` changes,
the template updates automatically.

The templates are a dialect of [mustache] and [handlebars] syntax.  The
mustache syntax allows a very terse writing style for the most common
patterns within templates:

 - inserting data with [can-stache.tags.escaped]
 - looping with [can-stache.helpers.each]
 - branching with [can-stache.helpers.if] or [can-stache.helpers.is]



> __Key take away:__ You define types like `AppVM` with method and property behaviors.
> Instances of those types are observable by [can-stache] templates.


## Route between two pages

In this section we will:

 - Create a __home page__ and __chat messages page__ that the user can navigate between
   with links and the browser's back and forward button.

Update the `HTML` tab to:

 - Check if the `appVM`'s `page` property is 'home'.  If it is, render the __home
   page__'s content.  If it's not, it will render the __chat messages page__'s content (using [can-stache.helpers.else]).
 - Use [can-stache.helpers.routeUrl] to create the right link urls so that `page`
   will be set on `appVM` to either `"home"` or `"chat"`.

@sourceref ./2-routing/html.html
@highlight 16-29,only

Update the `JavaScript` tab to:

 - Add a `page` property that will be updated when the browser's URL changes.
 - Prevent the `message` property from becoming part of the URL changes.
 - Connect changes in the url to changes in the `appVM` with [can-route.data].
 - Create a pretty routing rule so if the url looks like `"#!chat"`, the `page` property of
   `appVM` will be set to `chat` with [can-route].  If there is nothing in the hash, `page`
   will be set to `"home"`.
 - Initialize the url's values on `appVM` and setup the two way connection with [can-route.ready].

@sourceref ./2-routing/js.js
@highlight 2-3,7,16-18,only

When complete, you should be able to toggle between the two pages.  If you type:

```
window.location.hash
```

In JSBin's console, you will be able to see the hash change.


This step sets up a basic routing between different "pages" in an application.  
CanJS's routing is based on the properties in the application view model.  When
those properties change, different content is shown.  

We connected the application view model to the routing system with [can-route.data can-route.data]
and initialized that connection with [can-route.ready can-route.ready].

This makes it so if the `page` property changes, the browser's url will change.  If the
browser's url changes, the `page` property changes.  

> __Key take away:__  [can-route] connects changes in the browser's url to
changes in the application view model and vice versa.  Use changes in
the application view model to control which content is shown.


## Chat Messages Component

@sourceref ./3-chat-messages/html.html
@highlight 25,32-37,only

@sourceref ./3-chat-messages/js.js
@highlight 1-9,only

## List Messages

@sourceref ./4-list-messages/html.html
@highlight 38-60,only

@sourceref ./4-list-messages/js.js
@highlight 1-20,24-26,only

## Create Messages

@sourceref ./5-create-messages/html.html
@highlight 62-74,only

@sourceref ./5-create-messages/js.js
@highlight 28-39,only

## Real Time

@sourceref ./6-real-time/js.js
@highlight 22-32,only


## Result

<a class="jsbin-embed" href="http://jsbin.com/sogati/2/embed?html,js,output">JS Bin on jsbin.com</a>



<script src="http://static.jsbin.com/js/embed.min.js?3.39.18"></script>
