@parent can.view
@page Modifiers

jQuery uses the modifiers [.after()](http://api.jquery.com/after/), [.append()](http://api.jquery.com/append/),
[.before()](http://api.jquery.com/before/), [.html()](http://api.jquery.com/html/),
[.prepend()](http://api.jquery.com/prepend/), [.replaceWith()](http://api.jquery.com/replaceWith/)
and [.text()](http://api.jquery.com/text/) to alter the content of an element.

The __modifiers__ plugin allows you to render a can.View using these modifiers. For example, you can render a template
from *todo/todos.ejs* looking like this:

	<% for(var i = 0; i < this.length; i++ ){ %>
	  <li><%= this[i].name %></li>
	<% } %>

By calling the html modifier on an element like this:

    $('#todos').html('todo/todos.ejs', [
        { name : 'First Todo' },
        { name : 'Second Todo' }
	]);

__Note:__ You always have to provide the data (second) argument to render a view. If you have no data to render pass
an empty object:

	$('#todos').html('todo/todos.ejs', {});
	// Render todo/todos.ejs wit no data