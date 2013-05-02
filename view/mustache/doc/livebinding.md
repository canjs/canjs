@page can.Mustache.Binding Live Binding
@parent can.Mustache.pages 5

Live binding is templates that update themselves as the data 
used in the magic tags change.

It's very common as the page is interacted with that the underlying 
data represented in the page changes.  Typically, you have callbacks 
in your AJAX methods or events and then update the content of your 
controls manually.

In this example, we have a simple user welcome screen.

	<h1>Welcome {{user}}!</h1>
	<p>
		{{#if messages}}
			You have {{messages}} new messages.
		{{else}}
			You no messages.
		{{/messages}}
	</p>

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data);

The template evaluates the `messages` and adds the hooks for living-binding automatically.  
Since we have no message it will render:

	<h1>Welcome Tina Fey!</h1>
	<p>You no messages.</p>

Now say we have a request that updates
the `messages` attribute to have `5` messages.  We 
call the [attr](can.Observe.prototype.attr) method on the [can.Observe](can.Observe) to update
the attribute to the new value.

	data.attr('message', 5)

After [can.Observe](can.Observe) recieves this update, it will automatically
update the paragraph tag to reflect the new value.

	<p>You have 5 new message.</p>

For more information visit the [can.Observe](can.Observe).