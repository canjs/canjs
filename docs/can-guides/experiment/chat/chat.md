@page guides/chat Chat Guide
@parent guides/experiment 2

This guide walks through building real time chat application with CanJS's
[can-core Core libraries].  It takes about 30 minutes to complete.

@body

## Setup

The easiest way to get started is to clone the following JSBin by clicking the __JS Bin__ button on the top left:

<a class="jsbin-embed" href="http://jsbin.com/fezewi/3/edit?html,output">JS Bin on jsbin.com</a>

The JSBin loads [http://getbootstrap.com/ Bootstrap] for its styles. And [http://socket.io/ socket.io] for a socket
library.  It will be connecting to a restful and real-time service layer at [http://chat.donejs.com/api/messages].

The JSBin also loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.11/dist/global/can.js), which is a script that includes all of CanJS core under a
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

<video controls>
   <source src="../../docs/can-guides/experiment/chat/1-hello-world/completed.webm" type="video/webm">
   <source src="../../docs/can-guides/experiment/chat/1-hello-world/completed.ogg" type="video/ogg">
</video>

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

in JSBin's console tab after clicking a new page, you will be able to see the hash change between `!#` and `#!chat`.


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

In this section, we will:

- Define and use a custom `<chat-message>` element that contains the behavior of the __chat messages page__.

Update the `HTML` tab to:

- Use the `<chat-messages/>` element.
- Create a template for the `<chat-messages/>` element that contains the content of the
  __chat messages page__.

@sourceref ./3-chat-messages/html.html
@highlight 25,32-37,only

Update the `JavaScript` tab to:

- Define a view model for the custom element (`ChatMessagesVM`).
- Using [can-component] define a custom element that will render its `view` template with
  an instance of its `ViewModel`.

@sourceref ./3-chat-messages/js.js
@highlight 1-9,only

When complete, you should see the same behavior as the previous step. You should
be able to click back and forth between the two different pages.


This step creates the `<chat-messages>` custom element.  Custom elements are used
to represent some grouping of related (and typically visual) functionality such as:

 - Widgets like `<my-slider>`, or `<acme-navigation>`.
 - Pages like `<chat-login>` or `<chat-messages>`.

Custom elements are the macroscopic building blocks of an application.  They
are the [orchestration pieces](https://en.wikipedia.org/wiki/Orchestration_(computing))
used to assemble the application into a whole.  

For example, an application's template might assemble many custom elements
to work together like:

```
{{#if session}}
  <app-toolbar {(selected-files)}="selectedFiles"/>
  <app-directory {(selected-files)}="selectedFiles"/>
  <app-files {(selected-files)}="selectedFiles"/>
  <app-file-details {(selected-files)}="selectedFiles"/>
{{else}}
  <app-login/>
{{/if}}
```

Breaking down an application into many isolated, and potentially reusable components
is a critical piece of CanJS software architecture.

Custom elements are defined with [can-component].  Components render their `view` within
the element with an instance of their `ViewModel`.  By default their `view` only
has access to that data in the `ViewModel`.  You can use [can-stache-bindings event and data bindings] like [can-stache-bindings.toChild] and [can-stache-bindings.twoWay] to pass data
between custom elements.

> __Key take away:__  [can-component] makes custom elements. Break down your application
into many bit-sized custom elements.

## List Messages

In this section, we will:

 - Display messages from [http://chat.donejs.com/api/messages](http://chat.donejs.com/api/messages)
 - Show a "Loading..." message while the messages are loading.
 - Show an error if those messages fail to load.

Update the `HTML` tab to:

 - Check if the messages are in the process of loading and show a loading indicator.
 - Check if the messages failed to load and display the reason for the failure.
 - If messages successfully loaded, list each message's name and body.  If there
   are no messages, write out "No messages".

@sourceref ./4-list-messages/html.html
@highlight 38-60,only

Update the `JavaScript` tab to:

 - Define a `Message` type with [can-define/map/map].
 - Define a `Message.List` type that contains `Message` items.
 - Connect the `Message` and `Message.List` type to
   the restful messages service at `http://chat.donejs.com/api/messages`
   using [can-connect/can/super-map/super-map].
 - Create a `messagesPromise` property on `ChatMessagesVM` that's
   [can-define.types.value] is initialized to a [ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise]
   that represents the loading of all messages using [can-connect/can/map/map.getList].

@sourceref ./4-list-messages/js.js
@highlight 1-20,23-27,only

When complete, you should see a list of messages in the __chat messages page__.

This step creates a `Message` model, by first creating the `Message` type
and then connecting it to a messages service at `http://chat.donejs.com/api/messages`. This
adds [can-connect/can/map/map methods] to the `Message` type that let you:

 - Get a list of messages:
   ```js
   Message.getList({}).then(function(messages){})
   ```

 - Get a single message:
   ```js
   Message.get({id: 5}).then(function(message){})
   ```
 - Create a message on the server:
   ```js
   message = new Message({name: "You", body: "Hello World"})
   message.save()
   ```
 - Update a message on the server:
   ```js
   message.body = "Welcome Earth!";
   message.save();
   ```
 - Delete message on the server:
   ```js
   message.destroy();
   ```

There are also methods to let you know when a message
[can-connect/can/map/map.prototype.isNew],
[can-connect/can/map/map.prototype.isSaving], and
[can-connect/can/map/map.prototype.isDestroying].

With the message model created, it's used to load and list messages on the server.


> __Key take away:__ Create a model to connect to backend data.

## Create Messages

In this section, we will:

- Add the ability to create messages on the server and have them added to the list of messages.


Update the `HTML` tab to:

 - Create a form to enter a message's `name` and `body`.
 - When the form is submitted, call `send` on the `ChatMessagesVM` with [can-stache-bindings.event].
 - Connect the first `<input>`'s `value` to the `ChatMessagesVM`'s `name` property with [can-stache-bindings.twoWay].
 - Connect the second `<input>`'s `value` to the `ChatMessagesVM`'s `body` property with [can-stache-bindings.twoWay].

@sourceref ./5-create-messages/html.html
@highlight 62-74,only

Update the `JS` tab to:

- Define a `name` and `body` property on `ChatMessagesVM`.
- Define a `send` method on `ChatMessagesVM` that creates a new `Message` and saves it to the server.

@sourceref ./5-create-messages/js.js
@highlight 28-39,only

When complete, you will be able to create messages and have them appear in the list.

This step sets up a form to create a `Message` on the server.
Notice that the new `Message` automatically appears in the list of messages. This
is because [can-connect/can/super-map/super-map] ads the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically will inserted newly created messages into
lists that they belong within.  This is one of CanJS's best features - automatic list management.

> __Key take away:__ CanJS will add, remove, and update lists for you automatically.

## Real Time

In this section, we will:

 - Listen to messages created by other users and add them to the list of messages.

Update the `JavaScript` tab to:

- Create a [http://socket.io/] connection (`socket`).
- Listen to when messages are created, updated, and destroyed and and call the
  corresponding [can-connect/real-time/real-time] methods.

@sourceref ./6-real-time/js.js
@highlight 22-32,only

When complete, you can open up the same JSBin in another window, create a
message, and it will appear in the first JSBin's messages list.

This step connects to a [https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API WebSocket API]
that pushes messages when `Message`s are created, updated or destroyed. By calling the
[can-connect/real-time/real-time] methods when these events happen, CanJS will automatically
update the messages list.

> __Key take away:__ CanJS will add, remove, and update lists for you automatically.  It's
awesome!

## Result

When finished, you should see something like the following JSBin:

<a class="jsbin-embed" href="http://jsbin.com/mopiyu/2/embed?html,js,output">JS Bin on jsbin.com</a>



<script src="http://static.jsbin.com/js/embed.min.js?3.39.18"></script>
