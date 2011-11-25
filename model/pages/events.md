@page jquery.model.events Events
@parent jQuery.Model

Models produce events that you can listen to.  This is
useful when there are multiple representations of the same instance on the page.
If one representation is updated, the other representation 
should be updated.
   
Events also provide a more traditional MVC approach.  View-Controllers
bind to a specific property.  If that property changes, the
View-Controller updates itself.

Model provides two ways to listen for events on model instances:

## Way 1: Bind

You can [jQuery.Model.prototype.bind bind] to attribute changes in a model instance
just like you would with events in jQuery.

The following listens for contact birthday changes.

@codestart
contact.bind("birthday", function(ev, birthday){
  // do something
})
@codeend

The 'birthday' event is triggered whenever an attribute is
successfully changed:

@codestart
contact.attr('birthday', "10-20-1982");
@codeend

Bind is the prefered approach if you're favoring a more
traditional MVC architecture.  However, this can sometimes
be more complex than the subscribe method because of
maintaining additional event handlers.

## Way 2: Subscribe

Models will publish events when an instance is created, updated, or destroyed.

You can subscribe to these events with Model Events like:

@codestart
Task.bind('created', function(ev, task){
	var el = $("li").html(todo.name);
	el.appendTo($('#todos'));
	
	task.bind('updated', function(){
		el.html(this.name);
	}).bind('destroyed', function(){
		el.remove();
	});
})
@codeend

Typically, you'll subscribe with templated events like:

@codestart
$.Controller("Todo",{
  
  ...
  
  "{Task} created" : function(Task, event, task){
    
    //find the task in this widget:
    var el = task.elements(this.element)
	
    //remove element
    el.remove();
  },
  
  ...
})
@codeend