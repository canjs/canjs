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

[Example: Creating a derived value from source observables.](http://justinbmeyer.jsbin.com/koqaxe/edit?js,console)

```
var info = can.compute(function(){
  return person.attr("first")+" "+person.attr("last")+
    " likes "+ hobbies.join(", ")+".";
});
```

The [define plugin](../docs/can.Map.prototype.define.html) allows you to define rich property behaviors on
custom Map types. 

[Example: Creating a derived value as part of a custom type.](http://justinbmeyer.jsbin.com/wuwifaf/edit?js,console)
```
Person = can.Map.extend({
  define: {
    fullName: {
      get: function(){
        return this.attr("first")+" "+this.attr("last");
      }
    }
  }
});
```


<a name="models"></a>
### Models
Models let you get and modify data from the server. They also hydrate 
raw, serialized service data into more useful (and observable) typed 
data in the client. [can.Model](../docs/can.Model.html) makes it easy to connect to restful services
and perform Create, Retrieve, Update, and Delete (CRUD) operations. 

For applications requiring real-time, high performance, restful data connections you should check out [can-connect](http://connect.canjs.com/).

[Example: Simulate a restful service and create, update, and delete its data.](http://justinbmeyer.jsbin.com/codubev/edit?js,console)
```
// Create an order.
var order = new Order({
  price: 20
});

// Create it on the server.
order.save().then(function(order){
  // Change its values and
  // update it on the server.
  return order.attr("price",22)
       .save();
}).then(function(order){
  // Destroy it on the server.
  return order.destroy();
});
```

<a name="view-models"></a>
### ViewModels

ViewModels contain the state and model data used by views to create HTML. They also
contain methods that the views can call. Custom [can.Map](../docs/can.Map.html) types
are used as easily unit-testable view-models.  

[Example: Define and test a view-model that derives values from source state.](http://jsbin.com/sotero/edit?js,output)
```
var RestaurantListVM = can.Map.extend({
  define: {
    restaurants: {
      get: function() {
        var state = this.attr('state'),
            city = this.attr('city');

        if(state && city) {
          return Restaurant.findAll({
            'address.state': state,
            'address.city': city
          });
        }

        return null;
      }
    }
  }
});
```

<a name="views"></a>
### Views 

Views are passed a view-model and generate visual output that’s meaningful to a user - in our case that
output is HTML.  Views are able to:

- Listen to changes in view-models and models and update the HTML (__one-way bindings__). 
- Listen to HTML events, like clicks, and call methods on the view-models and models (__event bindings__).
- Listen to form elements changing and update view-model and model data (__two-way bindings__). 

In CanJS, the preferred method for creating views is using [can.stache](../docs/can.stache.html) 
templates. `can.stache` uses mustache/handlebars syntax. `can.stache`'s event and two-way binding
syntaxes can be found at [can.view.bindings](../docs/can.view.bindings.html).

At this time, `can.stache` is supplied as a supporting
library, which means you must explicitly add it to your application. We’ll see
how to do that when we set up our application in the next chapter. In 3.0, 
Stache will part of the core CanJS lib.

[Example: Generate HTML for the previous example's view-model.](http://justinbmeyer.jsbin.com/gewavi/edit?html,output)
```
<label>State</label>
{{#if states.isPending}}
  <select disabled><option>Loading...</option></select>
{{else}}
  <select {($value)}="state">
    {{^if state}}
      <option value="">Choose a state</option>
    {{/if}}
    {{#each states.value}}
      <option value="{{short}}">{{name}}</option>
    {{/each}}
  </select>
{{/if}}
```

<a name="custom_elements"></a>
### Custom Elements

Custom HTML Elements are how CanJS encapsulates and orchestrates different pieces of 
functionality within an application. Custom elements are built with 
[can.Component](../docs/can.Component.html) and combine a
view-model and view.

[Example: Encapsulate rich select behavior with a custom <select-loader> element.](http://justinbmeyer.jsbin.com/sonuwuc/edit?html,js,output)
```
<select-loader {promise}="states" {(value)}="state"
               choose-text="Choose a state">
  {{#each states.value}}
    <option value="{{short}}">{{name}}</option>
  {{/each}}
</select-loader>
```

<a name="routing"></a>
### Routing with an AppViewModel

CanJS maintains a reciprocal relationship between the browser's url
and a [can.Map](../docs/can.Map.html) view-model. This view-model instance
represents the state of the application as a whole and so is
called the `appViewModel`.  When the url changes,
CanJS will update the properties of the `appViewModel`.  When
the `appViewModel` changes, CanJS will update the url.  

[can.route](../docs/can.route.html) is used to setup the relationship between the 
`appViewModel` and the URL. It can be used with both [pushstate](../docs/can.route.pushstate.html) and
hashchange (the default) routing.  

[Example: Route between <home-page> and <restaurants-page> custom elements.](http://jsbin.com/surokag/edit?html,js,output)
```
{{#eq page 'home'}}
  <home-page/>
{{else}}
  <restaurants-page/>
{{/eq}}
```
```
var AppViewModel = can.Map.extend({
  define: {}
});
// Create an instance of that map
var appViewModel = new AppViewModel();

// Connect the map to the browser's URL
can.route.map(appViewModel);

// Define pretty routing rules
can.route(":page",{page: "home"});

// Start the two-way binding between the URL and the `appViewModel`.
can.route.ready();
```

Application ViewModels free developers 
from worrying about what the url looks like. Instead, you focus on
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
