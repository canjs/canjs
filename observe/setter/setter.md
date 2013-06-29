@page can.Observe.setter setter
@parent can.Observe.plugins
@plugin can/observe/setter
@test can/observe/setter/test.html

`can.Observe.setter(name, success(value), error(errors))` extends the Observe object 
to provide convenient helper methods for setting attributes on a observable.

@body
The `attr` function looks for a `setATTRNAME` function to handle setting 
the `ATTRNAME` property.

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
	
	// get the contact's birthday via 'attr' method
	contact.attr('birthday') 
		// -> Mon Mar 26 2012 08:56:51 GMT-0700 (MST)

	// set via 'attr' method
	contact.attr('birthday', new Date('11/11/11').getTime())
	
	contact.attr('birthday') 
		// -> Fri Nov 11 2011 00:00:00 GMT-0700 (MST)

	contact.attr({
		'birthday': new Date('03/31/12').getTime()
	});

	contact.attr('birthday') 
		// -> Sat Mar 31 2012 00:00:00 GMT-0700 (MST)
	
If the returned value is `undefined`, this means the setter is either in an async 
event or the attribute(s) were not set. 

## Differences From `attr`

The way that return values from setters affect the value of an Observe's property is
different from [can.Observe::attr attr]'s normal behavior. Specifically, when the 
property's current value is an Observe or List, and an Observe or List is returned
from a setter, the effect will not be to merge the values into the current value as
if the return value was fed straight into `attr`, but to replace the value with the
new Observe or List completely:

@codestart
var Contact = can.Observe({
	setInfo: function(raw) {
      return raw;
	}
});

var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
alice.info._cid; // '.observe1'

alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
alice.attr(); // {name: 'Allison Wonderland', 'phone': '888-888-8888'}
alice.info._cid; // '.observe2'
@codeend

If you would rather have the new Observe or List merged into the current value, call
`attr` inside the setter:

@codestart
var Contact = can.Observe({
	setInfo: function(raw) {
      this.info.attr(raw);
      return this.info;
	}
});

var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
alice.info._cid; // '.observe1'

alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
alice.attr(); // {name: 'Allison Wonderland', email: 'alice@liddell.com', 'phone': '888-888-8888'}
alice.info._cid; // '.observe1'
@codeend

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

	
## Demo

The example app is a pagination widget that updates
the offsets when the _Prev_ or _Next_ button is clicked.

@demo can/observe/setter/setter-paginate.html