@page can.Observe.setter
@parent can.Observe
@plugin can/observe/setter
@download http://donejs.com/can/dist/can.observe.setter.js
@test can/observe/setter/qunit.html

`can.Observe.setter` extends the Observe object to provide convenient helper methods for 
setting attributes on a observable.

The `attr` function looks for a `setATTRNAME` function to handle setting the date property.

By providing a function that takes the raw data and returns a form useful for JavaScript, 
we can make our observes automatically convert data.

	var Contact = can.Observe({
		setBirthday : function(raw){
			if(typeof raw == 'number'){
				return new Date( raw )
			}else if(raw instanceof Date){
				return raw;
			}
		}
	});

	// set on init
	var contact = new Contact({ birthday: 1332777411799 });
	
	// set via 'attr' method
	contact.attr('birthday', new Date().getTime())
	
	// set via 'attr' method passing object
	contact.attr({
		'birthday': new Date().getTime()
	});
	
If the returned value is `undefined`, this means the setter is either in an async 
event or the attribute(s) were not set.  If it was in fact in an async event, we 
do not want to call the `update` property and therefore return `undefined` right away.

## Error Handling

Setters can trigger errors if values passed didn't meet your defined validation(s).

Below is an example of a _School_ observable that accepts a name property and errors
when no value or a empty string is passed.

	var School = can.Observe({
		setName : function(name, success, error){
			if(!name){
				error("no name");
			}
			return error;
		}
	});

	var school = new School();
	
	// bind to error handler
	school.bind("error", function(ev, attr, error){
		alert("no name")
	})
	
	// set to empty string
	school.attr("name","");