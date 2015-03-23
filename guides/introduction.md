@page Tutorial Up & Running with CanJS
@parent guides 1

@body

*Better Apps, Faster*

CanJS is a lightweight, modern JavaScript [MVVM](https://en.wikipedia.org/wiki/Model_View_ViewModel)
framework that's fast and easy to use, while remaining robust and extensible
enough to power some of the most trafficked websites in the world. To see just
how simple it is to get an application up and running using CanJS, we'll
develop one together. This guide will walk you through the steps of building
a small e-commerce app with CanJS.

## The Basics
Every CanJS application contains:

- Models,
- Views,
- Components,
- Application State, and
- Routing

### Models
Models manage the data of an application. A model notifies the elements
associated with it when its state has changed. In CanJS this is the can.Model
object. can.Model handles all of your CRUD operations (Create, Read, Update,
and Delete). They can also provide validation for your data, as well---serving
as a single source for handling your data acquisition, and managing its
integrity.

### Views
Views request information from the model, and use the data it provides to
generate visual output that's meaningful to a user---in our case HTML. In
CanJS, views are created using:

1. View Templates,
2. The can.view object

The view template can be plain HTML, or it can utilize a template library
to provide it with more functionality. Most of the time, your views will work
with a template library. CanJs supports several JS template libraries,
including:

- Stache
- Mustache
- EJS

While you can use any of the above template types, the preferred type
is "Stache". It provides the most clarity to your code, and is the easiest
of the three options to use. At this time, Stache is supplied as a supporting
library. This means you must explicitly add it to your application. We'll see
how to do that when we set up our application in the next chapter. In future
releases of CanJS, Stache will be available as a part of the core CanJS lib.

Template libraries require a rendering engine, and CanJS provides that to
you with the can.view object. To quote the CanJS docs: A can.view contains
utilities "for loading, processing, rendering, and live-updating of
templates". In addition, can.view is used to bind views to observable
objects.

> The secret to building large applications is to never build large applications.

### Components
A can.Component is kind of like a mini web application. A can.Component
contains the CSS, JavaScript, and HTML it needs---all wrapped up in a single,
functional unit. This makes can.Components portable, reusable, and
encapsulated. can.Components are easy to test, and easy to use. Building an
application with them is kind of like building with Legos&trade;. As we say
at Bitovi, "The secret to building large applications is to never build large
applications". Rather, you build the components you need, and link them
together using the Application State and Routing to compose your application.

### Application State
One of the things that sets CanJS apart from other frameworks is its use
of an Application State. An Application State is an observable object that,
as its name implies, contains the state of your application. Where other
application frameworks model their applications with routes, controllers, &c.,
CanJS takes a more unified, semantic approach. It encapsulates the state
of your application in an object. This is a pretty powerful approach to
writing applications---freeing developers from many of the constraints of a
DOM-centric paradigm to think more directly about the application itself.

### Routing
For many JS MV* frameworks, routing divides an application into logical views
and binds those view to Controllers. *This is not how things work in
CanJS*. Routing in CanJS has nothing to do with binding views to Controllers.
Rather, it has to do with [Application State](#app-state). In brief,
CanJS maintains a reciprocal relationship between an application's route,
and its state. In other words, if you change the state of an application,
your route will change. If you change your route, your application's state
will change.

If you think about this, it's pretty powerful. For example, you can recreate
a specific state in your application from any point, just by accessing a
specific route.

If this doesn't make sense right now, don't worry. As we develop our
application together, you'll see, more and more, how this works, and just
how powerful this aspect of CanJS is.
