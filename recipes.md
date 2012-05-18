---
layout: default
---

# CanJS recipes

The following is a list of __CanJS__ recipes to help you learn CanJS.  To
add your own, simply [edit this file](https://github.com/jupiterjs/canjs/edit/gh-pages/recipes.md).

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

