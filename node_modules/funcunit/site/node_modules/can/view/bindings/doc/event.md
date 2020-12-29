@function can.view.bindings.event \(event\)
@parent can.view.bindings 0

@description Listen to events on elements or component view models.

@signature `($DOM_EVENT)='CALL_EXPRESSION'`

Specify a callback function to be called on a particular DOM event.

```
<div ($click)="doSomething()"/>
```

@param {String} DOM_EVENT A DOM event name like "click". jQuery custom events can also
be given. 

@param {can.stache.expressions} CALL_EXPRESSION A call expression like `method(key)` that is called when the `DOM_EVENT` 
is fired. The following key values are also supported:

 - `%element` - The element the event happened upon.
 - `$element` - The [can.$] wrapped element the event happened upon.
 - `%event` - The event object.
 - `%viewModel` - If the element is a [can.Component], the component's [can.Component::viewModel viewModel].
 - `%context` - The current context.
 - `%scope` - The current [can.view.Scope].

@signature `(VIEW_MODEL_EVENT)='CALL_EXPRESSION'`

Specify a callback function to be called on a particular [can.Component::viewModel viewModel] event.

```
<my-component (show)="doSomething()"/>
```

@param {String} DOM_EVENT A DOM event name like "click". jQuery custom events can also
be given. 

@param {can.stache.expressions} CALL_EXPRESSION A call expression like `method(key)` that is called when the `DOM_EVENT` 
is fired. The following key values are also supported:

 - `%element` - The element the event happened upon.
 - `$element` - The [can.$] wrapped element the event happened upon.
 - `%event` - The event object.
 - `%viewModel` - If the element is a [can.Component], the component's [can.Component::viewModel viewModel].
 - `%context` - The current context.
 - `%scope` - The current [can.view.Scope].


@body

## Use

The use of `(event)` bindings changes between listening on __DOM events__ and __viewModel events__.

## DOM events

To listen on a DOM event, wrap the event name with `($event)` like:

```
<div ($click)="doSomething()"/>
```

By adding `($EVENT)='methodKey()'` to an element, the function pointed to
by `methodKey` is bound to the element's `EVENT` event. The function can be
passed any number of arguments from the surrounding scope, or `name=value`
attributes for named arguments. Direct arguments will be provided to the
handler in the order they were given.

The following uses `($click)="items.splice(%index,1)"` to remove a
item from `items` when that item is clicked on.

@demo can/view/bindings/doc/event-args.html

### Special Event Types

can.view.bindings supports creating special event types 
(events that aren't natively triggered by the DOM), which are 
bound by adding attributes like `($SPECIAL)='KEY'`. This is 
similar to [$.special](http://benalman.com/news/2010/03/jquery-special-events/).

### ($enter)

`($enter)` is a special event that calls its handler whenever the enter 
key is pressed while focused on the current element. For example: 

	<input type='text' ($enter)='save()' />

The above template snippet would call the save method 
(in the [can.view.Scope scope]) whenever 
the user hits the enter key on this input.

## viewModel events

To listen on a can.Component's [can.Component::viewModel viewModel], wrap the event name with `(event)` like:

```
<player-edit 
  	(close)="removeEdit()" 
  	{player}="editingPlayer"/>
```

ViewModels can publish events on themselves. The following `<player-edit>` component
 dispatches a `"close"` event on itself when its `close` method is called:

```
can.Component.extend({
  tag: "player-edit",
  template: can.view('player-edit-stache'),
  viewModel: {
    close: function(){
      this.dispatch("close");
    }
  }
});
```

The following demo uses this ability to create a close button that 
hides the player editor:

@demo can/component/examples/paginate_next_event.html
