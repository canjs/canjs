@page RecipesLiveBindings Live Bindings
@parent Recipes 1

@body
The following recipes show how to use `can.EJS`'s live binding.

### Updating timestamps

The following shows how to create an automatically updating `prettyDate`
helper for EJS that can be used like:

@codestart
&lt;%= prettyDate( new Date() ) %>
@codeend

Notice how the _created_ value changes every couple min or 
so. 

The `prettyDate` method works with or without live-binding.  It doesn't need to take
an observe, just a date.  Code with EJS becomes live naturally ... amazing.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/gvsZj/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>


### 2-way binding Mustache helpers

Learn how to make 2-way binding mustache helpers.  When you change the value of an input, it automatically
changes the value of an observe.  When you change the value of the observe, it changes the value of the 
input.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/dffJ7/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

[How it works](http://bitovi.com/blog/2013/01/weekly-widget-two-way-mustache-helpers.html)