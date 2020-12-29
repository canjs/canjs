@page can-stache.Binding Live Binding
@parent can-stache.pages 5
@hide

Live binding refers to templates which update themselves when their state or data changes.
[can-stache] templates are able to listen to observables
(like [can-observable-object], [can-observable-array], and [can-observation]) changing and update the page to reflect those changes.

Live binding lets you focus on changing data and state without having to worry about also updating the
DOM to reflect those changes.

In this example, we have a simple user welcome screen.

```html
<!-- Template -->
<h1>Welcome {{user}}!</h1>
<p>
	{{#if(messages)}}
		You have {{messages}} new messages.
	{{else}}
		You no messages.
	{{/messages}}
</p>
```

```js
const data = new ObservableObject( {
	user: "Tina Fey",
	messages: 0
} );

const template = stache( document.getElementById( "template" ).innerHTML );
const frag = template( data );
document.body.appendChild( frag );
```

The template evaluates the `messages` and adds the hooks for live binding automatically.
Since we have no message it will render:

```html
<h1>Welcome Tina Fey!</h1>
<p>You no messages.</p>
```

Now say we have a request that updates
the `messages` attribute to have `5` messages.

```js
data.message = 5;
```

After the template receives this update, it will automatically
update the paragraph tag to reflect the new value.

```html
<p>You have 5 new message.</p>
```

For more information visit the [can-define/map/map] documentation.

### Binding between components

If you are looking for information on bindings between components like this:

```html
on:event="key()" for event binding.
prop:from="key" for one-way binding to a child.
prop:to="key" for one-way binding to a parent.
prop:bind="key" for two-way binding.
```

See [can-stache-bindings].
