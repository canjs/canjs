@page Tutorial Getting Started Tutorial
@parent guides 3
@disableTableOfContents

@body

<div class="getting-started">

*Better Apps, Faster*

CanJS is a lightweight, modern JavaScript <a href="https://en.wikipedia.org/wiki/Model_View_ViewModel" target="_blank">MVVM</a>
framework that’s fast and easy to use, while remaining robust and extensible
enough to power some of the most trafficked websites in the world. This guide 
will walk you through an analysis of a small e-commerce app built with CanJS called __Place My Order__. 
In each relevant section, we’ll give you some code to play with
so you will have hands on experience working with CanJS.

![place-my-order.com home page](../can/guides/images/application-design/Home.png)

For a version of this guide that walks through testing, documenting, building, and deploying the same
application, checkout [DoneJS's In Depth Guide](http://donejs.com/place-my-order.html).  This
guide focuses more on the CanJS parts. 

## The Basics

Every CanJS application contains:

- [Observables](#observables),
- [Models](#models),
- [Views](#views),
- [Custom Elements](#custom_elements),
- [Application ViewModel](#appviewmodel), and
- [Routing](#routing)

<a name="observables"></a>
### Observables
Observable objects provide a way for you to make changes to data and listen to
those changes. Observables such as [can.List](../docs/can.List.html) and [can.Map](../docs/can.Map.html) provide the
foundation for updating model objects, views, and even routes in your app. [can.compute](../docs/can.compute.html)
is able to combine observable values into new observable values.

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/koqaxe/edit?js,console">JS Bin on jsbin.com</a>

The [define plugin](../docs/can.Map.prototype.define.html) allows you to define rich property behavior
on custom Map types.

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/wuwifaf/edit?js,console">JS Bin on jsbin.com</a>

<a name="models"></a>
### Models
Models let you get and modify data from the server. They also hydrate 
raw, serialized service data into more useful (and observable) typed 
data in the client. [can.Model](../docs/can.Model.html) makes it easy to connect to restful services
and perform Create, Retrieve, Update, and Delete (CRUD) operations.

The following uses [can.fixture](../docs/can.fixture.html) to simulate a restful service and `can.Model`
to create an order, updated it, and delete it.

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/codubev/edit?js,console">JS Bin on jsbin.com</a>

<a name="views"></a>
### Views 
Views are given information from the model and use the data it provides to
generate visual output that’s meaningful to a user—in our case HTML. In
CanJS, the preferred method for creating views is using [can.stache](../docs/can.stache.html) 
templates.

At this time, Stache is supplied as a supporting
library, which means you must explicitly add it to your application. We’ll see
how to do that when we set up our application in the next chapter. In future
releases of CanJS, Stache will be available as a part of the core CanJS lib.

Template libraries require a rendering engine and CanJS provides that for
you with `can.stache`. `can.stache` contains
utilities “for the loading, processing, rendering, and live-updating of
templates”. In addition, `can.stache` is used to bind views to observable
objects.

<a name="custom_elements"></a>
### Custom Elements
A [can.Component](../docs/can.Component.html) is like a mini web application.
It contains the JavaScript, CSS, and HTML necessary to create a fully functional  
item. This makes `can.Component`’s portable, reusable, and
encapsulated. `can.Component`’s are easy to test and easy to use. Building an
application with them is kind of like building with Lego&trade;. As we say
at Bitovi, “The secret to building large applications is to never build large
applications.” Rather, you build the components you need and link them
together using the Application State and Routing to compose your application.

<a name="appviewmodel"></a>
### Application ViewModel
One of the things that sets CanJS apart from other frameworks is its use
of an Application State object. An Application State object, or AppState object for short,
is an observable object that, as its name implies, contains the state of 
your application. Where other application frameworks model their applications 
with routes, controllers, etc., CanJS takes a more unified, semantic approach. 
It encapsulates the state of your application. This is a 
very powerful approach to writing applications that frees developers from
many of the constraints of a DOM-centric paradigm, allowing them to think more directly 
about the application itself.

<a name="routing"></a>
### Routing
For many JavaScript MV* frameworks, routing divides an application into
logical views and binds those views to Controllers. *This is not how things work in
CanJS*. Routing in CanJS has nothing to do with binding views to Controllers.
Rather, it has to do with AppState. In brief,
CanJS maintains a reciprocal relationship between an application’s route
and its state. In other words, if you change the state of an application,
your route will change. If you change your route, your application’s state
will change.

This is a very powerful programming paradigm. For example, you can recreate
a specific state in your application from any point, just by accessing a
specific route.

If this doesn't make sense right now, don't worry. As we develop our
application together, you’ll see, more and more, how this works, and just 
how powerful this aspect of CanJS can be.

## Using the Getting Started Guide
Each chapter in the Getting Started Guide is prefaced with an overview of the
topics covered in that chapter. The overview section also contains a link where
you can download a zip file containing the code relevant to that chapter, as follows:

- - -
**In this Chapter**
 - Topic 1
 - Topic 2
 - Connecting `can.Model`’s with `can.Component`’s

Get the code for: [chapter 0](/guides/examples/PlaceMyOrder/ch-0_canjs-getting-started.zip)

- - -

- - -

<span class="pull-right">[Setup &rsaquo;](Setup.html)</span>

</div>
<script src="http://static.jsbin.com/js/embed.min.js?3.35.5"></script>
