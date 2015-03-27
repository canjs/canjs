@page Recipes Recipes
@parent guides 4

@body

## Get Started

There are a variety of ways to get CanJS.  Read the [using CanJS guide](http://canjs.com/guides/Using.html)
for comprehensive list.  For the following recipes, we will load CanJS
with a `<script>` tag pointed to CanJS's CDN.

Create a file called `myapp.html` and put the following in it to get started:

```
<script src="//code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="//canjs.com/release/2.0.4/can.jquery.js"></script>
<script type="text/mustache" id="app-template">
//Template will go here
</script>
<script>
//Application code will go here
</script>

<!-- CanJS needs a place to put your application -->
<div id="my-app"></div>
```

To follow along with the other recipes, you can also use
[this JSFiddle](http://jsfiddle.net/donejs/GE3yf/) as a template.

You can also [Download CanJS](http://canjs.com/download.html)
or follow [other tutorials](http://canjs.com/guides/Tutorial.html) to get
started, but for the rest of the examples, we'll be using this
setup.

## Request a Recipe

To request a new recipe or vote on an upcoming one, [submit an issue](https://github.com/bitovi/canjs.com/issues)
to the `canjs.com` respository on GitHub.