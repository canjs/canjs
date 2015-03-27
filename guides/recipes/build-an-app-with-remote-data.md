@page BuildAnApplicationWithData Build an App with Remote Data
@parent Recipes 6

@body

In CanJS, `can.Model` adds functionality to `can.Map` to
work with data on a server.  It enables you to:

 - Get and modify data from a server
 - Listen to changes made to the data on the server
 - Unify service data with other objects in your application

`can.Model` allows you to access data from a server
easily:

```
var Todo = can.Model.extend({
  findAll: 'GET /todos',
  findOne: 'GET /todos/{id}',
  create:  'POST /todos',
  update:  'PUT /todos/{id}',
  destroy: 'DELETE /todos/{id}'
},{});
```

Using *any* server with a [*REST* interface](http://blog.mashape.com/post/60820526317/list-of-40-tutorials-on-how-to-create-an-api),
 `can.Model` enables create, read, update, and destroy functionality.

## Create a Chat Application

To put together a chat application, we'll use two methods
from `can.Model` to fetch the messages and create new ones:

```
var Message = can.Model({
	findAll : 'GET ' + myServerUrl + '/messages',
	create : 'POST ' + myServerUrl + '/messages'
},{});
```

In a chat component's scope, we will use the `Message` model to
save new messages and observe changes to the Model.
[`new Message.List({})`](http://canjs.com/docs/can.Model.List.html#sig_newcan_Model_List__models__) is a shortcut to perform
the [`findAll`](http://canjs.com/docs/can.Model.findAll.html) operation on a `can.Model` and
return a `can.List`.

```
...
	scope: {
			messages: new Message.List({}),
			newMessage: ""
...
```

The tabs Component used `can-click` to listen for click events.
Since this chat application uses a `<form>` for sending messages, we'll use
`can-submit` to specify an event handler.

There's one more helper used in the template: [`can-value`](http://canjs.com/docs/can.view.bindings.can-value.html).
This automatically two-way binds the value of an input field to an observable
property on the `scope` of the component (in this case, `newMessage`).

```
can.Component.extend({
  tag: 'chat',
  template: '<ul id="messages">' +
			  '{{#each messages}}' +
			  '<li>{{body}}</li>' +
			  '{{/each}}' +
			'</ul>' +
			'<form id="create-message" action="" can-submit="submitMessage">' +
				'<input type="text" id="body" placeholder="type message here..."' +
				'can-value="newMessage" />' +
			'</form>',
...
```

When `submitMessage` is called, a new `Message` is created
with `new Message()`. Since `can-value` was declared on the `input` element, `newMessage` will
always be the current text in the `input` field.
The body of the message is fetched from
the Component's `newMessage` attribute when a user submits the form.

To save the new message to the server, call `save()`.

```
submitMessage: function(scope, el, ev){
	ev.preventDefault();
	new Message({body: this.attr("newMessage")}).save();
	this.attr("newMessage", "");
}
```

Finally, when a new `Message` is created, the `messages` list
must be updated.

```
events: {
	'{Message} created': function(construct, ev, message){
		this.scope.attr('messages').push(message);
	}
}
```

There are two ways that messages are added: from the current user,
or from another user. In the next section, we demonstrate how to use
[socket.io](http://socket.io/) to update the `Message` model with messages
from other users in real time. Binding to the `created` event for **all**
messages allows us to create a single entry point that pushes new messages
to the `scope`, [regardless of where those messages are from.](http://canjs.com/docs/can.Model.html#section_Listentochangesindata)

When the chat Component is loaded, messages are loaded from the server
using `can.Model` and `new Message.List({})`.  When a new message is
submitted:

1. `submitMessage` is called via the event handler bound by the `can-submit` attribute
2. a new `Message` is created and saved to the server
3. `'{Message} created'` detects this change and adds the new message to `messages`
4. The template is automatically updated since `messages` is an observable `can.List`

## Add real-time functionality

This example uses [socket.io](http://socket.io/)
to enable real-time functionality. This guide won't go
into detail on how to use `socket.io`, but for real-time
chat the application needs two more things.

When a message is created on another chat client, `socket.io`
will notify this client by triggering the `message-created` event,
wich will render the new message in the page by adding it to the
`Message` model.

```
var socket = io.connect(myServerUrl);
socket.on('message-created', function(message){
	new Message(message).created();
});
```

To keep the `created` event from firing
twice, we modify the `create` function in the model.
If there was simply a `return` statement, `Model` would
create and fire a `create` event, which `socket` is already
doing. By returning a `Deferred`, we prevent firing of
one of these events.

```
var Message = can.Model({
	findAll : 'GET ' + myServerUrl + '/messages',
	create : function(attrs) {
		$.post(myServerUrl + '/messages', attrs);
		//keep '{Message} created' from firing twice
		return $.Deferred();
	}
},{});
```

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/afC94/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>