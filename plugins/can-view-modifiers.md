@page can-view-modifiers
@parent canjs.plugins

@link http://www.npmjs.com/package/can-view-modifiers npm
@link http://canjs.github.io/can-view-modifiers/docs docs
@link http://github.com/canjs/can-view-modifiers github

- [Usage Guide](http://canjs.github.io/can-view-modifiers/docs/can-view-modifiers.modifiers.html)
- [GitHub](http://github.com/canjs/can-view-modifiers)

This plugin extends the `jQuery` view modifiers to render a [can.view]. When rendering a view you call the view modifier the same way as can.view with the view name or id as the first, the data as the second and the optional success callback (to load the view asynchronously) as the third parameter. For example, you can render a template from todo/todos.ejs looking like this:

```
<% for(var i = 0; i < this.length; i++ ){ %>
  <li><%= this[i].name %></li>
<% } %>
```

By calling the [can.prototype.jQuery.fn.html html] modifier on the `#todos` element like this:

```
can.$('#todos').html('todo/todos.ejs', [
    { name : 'First Todo' },
    { name : 'Second Todo' }
]);
```
