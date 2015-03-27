@page HandleUserInteraction Handle User Interaction
@parent Recipes 4

@body

When a user does something, such as clicking, an `event` occurs. Event handlers specify
how [JavaScript should respond to an event](http://bitovi.com/blog/2010/10/a-crash-course-in-how-dom-events-work.html).

This recipe will introduce handling a click event using a [`can.Control`](http://canjs.com/docs/can.Control).
Using a list of people like previous recipes, clicking any individual person's name
will remove that person from the list.

Previous examples have used jQuery's event handlers:

```
$("#push").click(function(){
  //handle the event
});
```

CanJS provides a few different ways to respond to events. As well as
making application code simpler, using CanJS to handle events can help to
automatically prevent [memory leaks](http://bitovi.com/blog/2012/04/zombie-apocolypse.html).

To handle events, extend `can.Control`.

```
var PeopleList = can.Control.extend({
	//behavior
});
```

You create a `can.Control` by [calling it as a constructor function](http://canjs.com/docs/can.Control.html#sig_newcan_Control_element_options_).
The first argument is the element the control will be created on.
The second argument is an object of options.

	new PeopleList('#my-app', {people: people});

A `can.Control` handles events with functions declared with two arguments: an
element or list of elements (using a jQuery-style selector) and a specific event.
Below, this is 'li click', meaning when any `li` elements that are `clicked` the
function will be called to handle the click event.

```
var PeopleList = can.Control.extend({
  init: function( element, options ){
  	this.people = new can.List(options.people);
  	this.element.html( can.view('app-template', {
  		//defines people in the template as the observable can.List
  		people: this.people
  	}));
  },
  'li click': function( li, event ){
  	//Handle the click event
  }
};
```

When the constructor function is called and the `can.Control`
is instantiated:

1. The `init` method is called
2. An observable `can.List` is created from `people`
3. The list is rendered using `can.view` so when the list changes, so will the view

```
var people = [
	{firstname: "John", lastname: "Doe"},
	{firstname: "Emily", lastname: "Dickinson"},
	{firstname: "William", lastname: "Adams"},
	{firstname: "Stevie", lastname: "Nicks"},
	{firstname: "Bob", lastname: "Barker"}
];
```

When the event handler for a `click` runs, it needs a way
to access the object associated with the `li` that was clicked.
With the [`data`](http://canjs.com/docs/can.mustache.helpers.data.html) helper,
the element will retain a reference
to the object it is associated with (in this case, a `person`).

```
<ul>
{{#each people}}
	<li {{data 'person'}}>
		{{lastname}}, {{firstname}}
	</li>
{{/each}}
</ul>
```

Finally, the event handler must be defined. In a `can.Control`,
an event handler function [can be defined with a string containing
a selector and an event](http://canjs.com/docs/can.Control.html#section_Listeningtoevents).
In this case, these are `li` and `click`, respectively,
since we want to handle click events on each list item.

```
var PeopleList = can.Control.extend({
  init: function(){
	...
  },
  'li click': function( li, event ) {
  	var people = this.options.people;
  	var person = li.data('person');
  	var index = people.indexOf(person);
  	people.splice(index, 1);
  }
});
```

When a user clicks a list item:

 1. The function bound to `li click` is called
 2. The object associated with that list item is accessed using the `data` helper
 3. That 'person's data is removed from the observable list of `people`
 4. The template updates automatically

As a reminder, though event handlers respond to actions on the page,
they should *change application state or data* (e.g. make a change to a `can.Map`)
rather than modifying the DOM directly (e.g. toggling a class).
This will update the page automatically, keeping code manageable.

This is *one* way to handle events. Others will be covered
in the following recipes while building widgets.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/F9kzt/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>