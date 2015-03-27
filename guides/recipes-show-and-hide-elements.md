@page ShowAndHideElements Show and Hide Elements
@parent Recipes 3

@body

Instead of showing and hiding elements by changing the DOM
directly like:

```
$("h1").show()
$("h1").hide()
```

Make the template show or hide those elements when a value
changes.

```
{{#if visible}}
  <h1>{{message}}</h1>
{{/if}}
```

When the button is clicked, change the observable value.

```
data.attr("visible", !data.attr("visible"))
```

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/eFss4/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

### Application State

Typically, it's not a good idea to mix view state and application data.
In the previous example, the `message` is application data, while the
`visible` property represents view state. In CanJS, state and data
should be separated using different observables.

```
var data = new can.Map({message: "Hello World!"}),
	state = new can.Map({visible: true});

var frag = can.view("app-template", {
  data: data,
  state: state
});
```

As an application gets more complex, separating state from data
makes things more maintainable.