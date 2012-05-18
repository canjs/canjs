---
layout: default
---

# CanJS recipes

## Routing

### Observe Backed Routes

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/YRXHV/7/embedded/" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

## Live Binding

### Updating timestamps

The following shows how to create an automatically updating `prettyDate`
helper for EJS that can be used like:

{% highlight javascript %}
  <%= prettyDate( new Date() )
{% endhighlight %}

Notice how the _created_ value changes every couple min or 
so. 

The `prettyDate` method works with or without live-binding.  It doesn't need to take
an observe, just a date.  Code with EJS becomes live naturally ... amazing.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/qYdwR/36/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

