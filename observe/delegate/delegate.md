@page can.Observe.delegate
@parent can.Observe

Listens for changes in a child attribute(s) from the parent. The child attribute
does not have to exist.

	// create an observable
	var observe = can.Observe({
		foo : {
			bar : "Hello World"
		}
	})
  
     //listen to changes on a property
     observe.delegate("foo.bar","change", function(ev, prop, how, newVal, oldVal){
       // foo.bar has been added, set, or removed
       this //-> 
     });
 
     // change the property
     observe.attr('foo.bar',"Goodbye Cruel World")

Delegate will listen on the object until you call _undelegate_ to remove the event handler.

	observe.undelegate("name","set", function(){ ... })

*Note: Its important to include this plugin before you include other plugins that 
extend Observe so that prototype chain is extended correctly.
 
## Types of events
 
Delegate lets you listen to add, set, remove, and change events on property.

### Add

An add event is fired when a new property has been added.
 
     var o = new can.Control({});
     o.delegate("name","add", function(ev, value){
       // called once
       can.$('#name').show()
     })
     o.attr('name',"Justin")
     o.attr('name',"Brian");
    
Listening to add events is useful for 'setup' functionality (in this case
showing the <code>#name</code> element.
 
### Set
 
Set events are fired when a property takes on a new value.  set events are
always fired after an add.

	o.delegate("name","set", function(ev, value){
		// called twice
		can.$('#name').text(value)
	})
	
	o.attr('name',"Justin")
	o.attr('name',"Brian");

### Remove

Remove events are fired after a property is removed.

	o.delegate("name","remove", function(ev){
		// called once
		can.$('#name').text(value)
	})
	
	o.attr('name',"Justin");
	o.removeAttr('name');


## Wildcards - matching multiple properties

Sometimes, you want to know when any property within some part 
of an observe has changed. Delegate lets you use wildcards to 
match any property name.  The following listens for any change
on an attribute of the params attribute:

	var o = can.Control({
		options : {
			limit : 100,
			offset: 0,
			params : {
				parentId: 5
			}
		}
	})
	
	o.delegate('options.*','change', function(){
		alert('1');
	})
	
	o.delegate('options.**','change', function(){
		alert('2');
	})
	
	// alerts 1
	// alerts 2
	o.attr('options.offset',100)
	
	// alerts 2
	o.attr('options.params.parentId',6);

Using a single wildcard (<code>*</code>) matches single level
properties.  Using a double wildcard (<code>**</code>) matches
any deep property.

## Listening on multiple properties and values

Delegate lets you listen on multiple values at once.