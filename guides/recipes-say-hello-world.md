@page SayHelloWorld Say "Hello World"
@parent Recipes 1

@body

In CanJS, content is displayed using *templates*.  Instead of manually
changing elements in the DOM, you create a template and CanJS
automatically updates the page from the data in your application code.

## Template

In the template section of `myapp.html`, put the following:

```
<script type="text/mustache" id="app-template">
	<h1>{{message}}</h1>
</script>
```

This template displays the value of `message`.

## Pass message to the Template

Templates are rendered with [can.view](../docs/can.view.html), which takes two arguments: the first is the `id` of the template,
and the second is the data passed to the template (in this case,
an object with a `message` property).

Render the template with a `message` and insert it into the page with:

```
<script>
// Give message a value
var data = {message: "Hello World!"};

// Pass the id of the template and the data, containing our message to can.view
var frag = can.view("app-template", data);

//Load the DocumentFragment in the page
$("#my-app").html( frag )
</script>
```

> `frag` is a [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment). A DocumentFragment
> is a lightweight container of HTMLElements that can be inserted in the page quickly. They can be used
> anywhere a normal HTMLElement is used.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/GE3yf/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>