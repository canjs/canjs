@page can.Observe.setter
@parent can.Observe
@plugin can/observe/setter
@download http://donejs.com/can/dist/can.observe.setter.js
@test can/observe/setter/qunit.html

Setter extends the Observe object to provide convenient helper methods for setting attributes on a observable.

The `attrs` and `attr` function look for a `setATTRNAME` function to handle setting the date property.

By providing a function that takes the raw data and returns a form useful for JavaScript, 
we can make our observes ( which use `attrs` and `attr` ) automatically convert data.

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
	
	// set via 'attrs' method
	contact.attrs({
		'birthday': new Date().getTime()
	});