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
- [ViewModels](#view-models)
- [Views](#views),
- [Custom Elements](#custom_elements), and
- [Routing with an AppViewModel](#routing)

<a name="observables"></a>
### Observables
Observable objects provide a way for you to make changes to data and listen to
those changes. Observables such as [can.List](../docs/can.List.html), [can.Map](../docs/can.Map.html), and
[can.compute](../docs/can.compute.html) provide the
foundation for models, view-models, view bindings, and even routing in your app. [can.compute](../docs/can.compute.html)
is able to combine observable values into new observable values. 

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/koqaxe/edit?js,console">JS Bin on jsbin.com</a>

The 
[define plugin](../docs/can.Map.prototype.define.html) allows you to define rich property behaviors on
custom Map types. 

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

<a name="view-models"></a>
### ViewModels

ViewModels contain the state and model data used by the views to create HTML.  They also
contain methods that the views can call. Custom [can.Map](../docs/can.Map.html) types
are used as easily unit-testable view-models.  

<a name="views"></a>
### Views 

Views are passed a view-model and generate visual output that’s meaningful to a user - in our case that
output is HTML.  Views are able to listen to changes in view-models and models and update their
output. They are also able to listen to HTML events, like clicks, and call methods on the view-models
and models.

In CanJS, the preferred method for creating views is using [can.stache](../docs/can.stache.html) 
templates.

At this time, Stache is supplied as a supporting
library, which means you must explicitly add it to your application. We’ll see
how to do that when we set up our application in the next chapter. In future
releases of CanJS, Stache will be available as a part of the core CanJS lib.

<a name="custom_elements"></a>
### Custom Elements

Custom HTML Elements like `<order-list>` are how CanJS encapsulates and orchestrates different pieces of 
functionality within an application.  

By __encapsulate__, we mean that instead of adding a slider
to your page like:

```
$("#rating").slider({start: 1, end: 10, value: 5});
```

You add a slider to the view like:

```
<my-slider start="0" end="10" value="5"/>
```

Custom elements are built with 
[can.Component](../docs/can.Component.html).  These combine a
view-model and view.

```
var SliderViewModel = can.Map.extend({
  position: function(){
    ...
  }
});

can.Component.extend({
  tag: "my-slider",
  viewModel: SliderViewModel,
  view: can.stache("<div style='left: {{position.left}}px; right: {{position.right}}px'/>")
});
```


By __orchastrate__, we mean that custom element communication is also setup in the 
view with [view bindings](../docs/can.view.bindings.html). The following:

- updates `<rating-box>`'s `rating` when `order.rating` changes.
- updates `<my-slider>`'s  `value` when `order.rating` changes and
  updates `order.rating` when `<my-slider>`'s `value` changes.

```
<order-page>
  <rating-box {rating}="order.rating"/>
  <my-slider start="0" end="10" {(value)}="order.rating"/>
</order-page>
```


<a name="routing"></a>
### Routing with an AppViewModel

CanJS maintains a reciprocal relationship between an application’s url
and a [can.Map](../docs/can.Map.html) view-model. This view-model instance
represents the state of the application as a whole and so is
called the `appViewModel`.  When the url changes,
CanJS will update the properties of the `appViewModel`.  When
the `appViewModel` changes, CanJS will update the url.

```
var AppViewModel = can.Map.extend({
  define: {
    
  }
});

var appViewModel = new AppViewModel();
can.route.map(appViewModel);
can.route.ready();
```


The `appViewModel` is used to render your application's 
main template.

```
var mainTemplate = can.stache("....");
$("body").append(mainTemplate(appViewModel));
```

By encapulating the state of your application, Application ViewModels free developers 
from worrying about what the url looks like.  Instead, you can focus on
updating the state of the application.


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
