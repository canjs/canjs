@page can.Observe.attributes
@parent can.Observe

Attributes contains a map of attribute names/types. You can use this in conjunction with 
can.Observe.convert to provide automatic type conversion.

	can.Observe("Contact",{
		attributes : {
			birthday : 'date'
		},
		convert : {
			date : function(raw){
				if(typeof raw == 'string'){
					var matches = raw.match(/(\d+)-(\d+)-(\d+)/);
					return new Date( matches[1], (+matches[2])-1, matches[3] );
				}else if(raw instanceof Date){
					return raw;
				}
			}
		}
	},{})
	
*Note: Its important to include this plugin before you include other plugins that 
extend Observe so that prototype chain is extended correctly.

## Type Conversion

You often want to convert from what the observe sends you to a form more useful to JavaScript. 
For example, contacts might be returned from the server with dates that look like: "1982-10-20". 
We can observe to convert it to something closer to new Date(1982,10,20). We can do this in two ways: Setters and Convert.

Convert comes with the following types:

	date - Converts to a JS date. Accepts integers or strings that work with Date.parse
	number - an integer or number that can be passed to parseFloat
	boolean - converts "false" to false, and puts everything else through Boolean()

### Setters

The _attrs_ and _attr_ function look for a _setATTRNAME_ function to handle setting the date property.

By providing a function that takes the raw data and returns a form useful for JavaScript, 
we can make our observes (which use _attrs_ and _attr_) automatically convert data.

### Convert

If you have a lot of dates, Setters won't scale well. Instead, you can set the type of an attribute 
and provide a function to convert that type.

The following sets the birthday attribute to "date" and provides a date conversion function:

	can.Observe("Contact",
	{
		attributes : { 
			birthday : 'date'
		},
		convert : {
			date : function(raw){
				if(typeof raw == 'string'){
					var matches = raw.match(/(\d+)-(\d+)-(\d+)/)
					return new Date( matches[1], (+matches[2])-1, matches[3] )
				}else if(raw instanceof Date){
					return raw;
				}
			}
		}
	}, { })

## Serialization

Serialization occurs before the observe is saved. This allows you to prepare your observe's
attributes before they're sent to the server.

By default every attribute will be passed through the 'default' serialization method 
that will return the value if the property holds a primitive value (string, number, ...), 
or it will call the "serialize" method if the property holds an object with the "serialize" method set.

You can set the serialization methods similar to the convert methods:

	can.Observe("Contact",
	{
		attributes : { 
			birthday : 'date'
		},
		serialize : {
			date : function( val, type ){
				return val.getYear() + "-" + (val.getMonth() + 1) + "-" + val.getDate(); 
			}
		}
	},{ })

This code will format the 'birthday' attribute as '2011-11-24' before it will be sent to the server.