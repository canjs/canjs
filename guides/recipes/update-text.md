@page UpdateText Update Text in the Page
@parent Recipes 2

@body

CanJS will update the page automatically when [observable](http://sourcemaking.com/design_patterns/observer)
data changes. To make observable data, pass raw data to [can.Map](../docs/can.Map.html),
[can.List](../docs/can.List.html) or [can.compute](../docs/can.compute.html) like:

```
var data = new can.Map({message: "Hello World!"});
```

To change the message, use the [attr()](../docs/can.Map.prototype.attr.html) method of `can.Map`.

```
data.attr("message", "Goodbye World!")
```

When the button is clicked in the example below, the message is
changed with `data.attr()`.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/quTtE/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>