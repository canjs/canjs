@page can.Observe.attributes
@parent can.Observe
@plugin can/observe/attributes
@test can/observe/attributes/qunit.html
@download http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/attributes/attributes.js

Attributes contains a map of attribute names/types. You can use this in conjunction with 
[can.Observe.convert] to provide automatic type conversion.
	
*Note: Its important to include this plugin before you include other plugins that 
extend Observe so that prototype chain is extended correctly.

## Type Conversion

You often want to convert from what the observe sends you to a form more useful to JavaScript. 
For example, contacts might be returned from the server with dates that look like: "1982-10-20". 
We can observe to convert it to something closer to new Date(1982,10,20).

Convert comes with the following types:

- __date__ Converts to a JS date. Accepts integers or strings that work with Date.parse
- __number__ An integer or number that can be passed to parseFloat
- __boolean__ Converts "false" to false, and puts everything else through Boolean()

### Convert

You can set the type of an attribute and provide a function to convert that type. 
The following sets the birthday attribute to "date" and provides a date conversion function:

	var Contact = can.Observe({
		attributes : {
			birthday : 'date'
		},
		convert : {
			date : function(raw){
				if(typeof raw == 'string'){
					var matches = raw.match(/(\d+)-(\d+)-(\d+)/);
					
					return new Date(matches[1], 
							        (+matches[2])-1, 
								    matches[3]);
								
				}else if(raw instanceof Date){
					return raw;
				}
			}
		}
	},{});

	//- calls convert on attribute set
	Contact.attr('birthday', '4-26-2012') 
	
	//- returns newly converted date object
	Contact.attr('birthday') 

## Serialization

Serialization occurs before the observe is saved. This allows you to prepare your observe's
attributes before they're sent to the server.

By default every attribute will be passed through the 'default' serialization method 
that will return the value if the property holds a primitive value (string, number, ...), 
or it will call the "serialize" method if the property holds an object with the "serialize" method set.

You can set the serialization methods similar to the convert methods:

	var Contact = can.Observe({
		attributes : { 
			birthday : 'date'
		},
		serialize : {
			date : function( val, type ){
				return val.getYear() + 
					"-" + (val.getMonth() + 1) + 
					"-" + val.getDate(); 
			}
		}
	},{})
	
	Contact.serialize()
		//- Returns the 'birthday' attribute in format 'YYYY-MM-DD'
		//- {
		//- 	birthday: 'YYYY-MM-DD'
		//- }