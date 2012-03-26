@parent can.view
@page Modifiers

jQuery uses the modifiers [http://api.jquery.com/after/ .after()], [http://api.jquery.com/append/ .append()],
[http://api.jquery.com/before/ .before()], [http://api.jquery.com/html/ .html()],
[http://api.jquery.com/prepend/ .prepend()], [http://api.jquery.com/replaceWith/ .replaceWith()]
and [http://api.jquery.com/text/ .text()] to alter the content of an element.

The __modifiers__ plugin allows you to render a can.View using these modifiers. For example, you can render a template
from the *todo/todos.ejs* url looking like this:

	<% for(var i = 0; i < this.length; i++ ){ %>
	  <li><%= this[i].name %></li>
	<% } %>

By calling the html modifier on an element like this:

    $('#todos').html('todo/todos.ejs', [
        { name : 'First Todo' },
        { name : 'Second Todo' }
	]);