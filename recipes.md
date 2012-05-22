---
layout: default
---

# CanJS recipes

The following is a list of __CanJS__ recipes to help you learn CanJS.  To
add your own, simply [edit this file](https://github.com/jupiterjs/canjs/edit/gh-pages/recipes.md). To
help create a JSFiddle, we've created the following fiddles you can fork:

 - [jQuery and CanJS](http://jsfiddle.net/donejs/qYdwR/)
 - [Zepto and CanJS](http://jsfiddle.net/donejs/7Yaxk/)
 - [Dojo and CanJS](http://jsfiddle.net/donejs/9x96n/)
 - [YUI and CanJS](http://jsfiddle.net/donejs/w6m73/)
 - [Mootools and CanJS](http://jsfiddle.net/donejs/mnNJX/)


## Controls

The following recipes explore making UI widgets with `can.control`.

### Tabs

The following recipes builds a simple tabs widget.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/z2N5k/1/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

It creates a `Tabs` constructor function that shows and hides tabs
when it's `<li>`'s are clicked.

When `new Tabs()` is called, it adds `active` to the first `<li>`'s 
className. Then, using the `tab` helper function, it hides the content for 
all the other tab buttons.

The `tab` helper function takes a `<li>` element like:

{% highlight html %}
<li><a href="#model">Model</a></li>
{% endhighlight %}

Then gets it's `<a>` element, and then uses it's href (`#model`) to get the
content div for that button.

When a button is clicked, `Tabs` listens to it with:

{% highlight javascript %}
"li click" : function( el, ev ) { ... }
{% endhighlight %}

This function, using the `tab` helper deactivates the active tab button and hides its content, 
then it activates and shows the new tab button and tab content.

### Tooltip

The following recipe builds a simple tooltip.  It shows templated event binding and we will
explain how it keeps memory leaks from happening. Click on one of the items
to see a tooltip, click somewhere else to remove it.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/d3T9c/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

This creates a `Tooltip` control that when created shows a tooltip.  When a `Tooltip` control
is created, it positions the `Tooltip` element relative to the `relativeTo` option and 
sets its inner html to the `html` option.

The tooltip also listens to clicks on the window.  If the user clicked on something other than the
`relativeTo` element and the tooltip element, it will remove the tooltip from the document.

When an element is removed from the DOM with any controls on it, the control's event handlers
are automatically removed.  Templated event binding lets us listen to events outside 
the element.  `"{window} click"` is a templated event binding.

Events outside an element would normally not be removed, but they are with `can.Control`.

## Routing

The following recipes explore using `can.route`.

### Basic Routing

Here's a demo on basic routing ....

### Observe Backed Routes

This recipe shows how to have multiple widgets listening on 
overlapping parts of the route. The app lets the user select a type of issue, show issues for that type,
and select a issue and see details about that issue.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/YRXHV/7/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

This functionality is broken down 
into __Nav__, __Issues__, and __Details__ can.controls.  Here's how
each part works:

`Nav` creates links using `can.route.link` that update the hash like:

{% highlight javascript %}
<%== can.route.link("Critical",{filter: "critical"}) %>
{% endhighlight %}

When these are clicked on, they update the route's filter data.  

`Issues` listens to filter changes like:

{% highlight javascript %}
"{can.route} filter" : function(route, ev, filter){ ... }
{% endhighlight %}

It then retrieve's issue with `Issue.findAll` and renders 
them into the `#issues` element.

When an issue is clicked, `Issues` updates the route's issue data like:

{% highlight javascript %}
can.route.attr("issue", issue.id)
{% endhighlight %}

It listens to changes in `issue` data and highlights the corresponding
issue in the list like:

{% highlight javascript %}
"{can.route} issue" : function(route, ev, issue){ ... }
{% endhighlight %}

`Details` listens to issue chagnes like:

{% highlight javascript %}
"{can.route} issue" : function(route, ev, issue){ ... }
{% endhighlight %}

And updates the details panel.



## Live Binding

The following recipes show how to use `can.EJS`'s live binding.

### Updating timestamps

The following shows how to create an automatically updating `prettyDate`
helper for EJS that can be used like:

{% highlight javascript %}
<%= prettyDate( new Date() ) %>
{% endhighlight %}

Notice how the _created_ value changes every couple min or 
so. 

The `prettyDate` method works with or without live-binding.  It doesn't need to take
an observe, just a date.  Code with EJS becomes live naturally ... amazing.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/qYdwR/36/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

