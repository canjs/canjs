@page can.Observe.setter
@parent can.Observe

Setter extends the Observe object to provide convenient helper methods for setting attributes on a observable.

The _attrs_ and _attr_ function look for a _setATTRNAME_ function to handle setting the date property.

By providing a function that takes the raw data and returns a form useful for JavaScript, 
we can make our observes (which use _attrs_ and _attr_) automatically convert data.

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
	
*Note: Its important to include this plugin before you include other plugins that 
extend Observe so that prototype chain is extended correctly.