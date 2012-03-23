@page can.Observe.attributes
@parent can.Observe

Attributes contains a map of attribute names/types. You can use this in conjunction with 
can.Observe.convert to provide automatic type conversion and serialization.

## Type Conversion

Data from the server often needs massaging to make it more useful 
for JavaScript.  A typical example is date data which is commonly passed as
a number representing the Julian date like:

	{ name: 'take out trash', 
	  id: 1,
	  dueDate: 1303173531164 }

But instead, you want a JavaScript date object:

	date.attr('dueDate') //-> new Date(1303173531164)

By defining property-type pairs in [can.Observe.attributes attributes],
you can have observe auto-convert values from the server into more useful types:

	can.Observe('Todo',{
		attributes : {
			dueDate: 'date'
		}
	},{})
	
## Serialization

Serialization occurs before the observe is saved. This allows you to prepare your observe's 
attributes before they're sent to the server.

By default every attribute will be passed through the 'default' serialization method that 
will return the value if the property holds a primitive value (string, number, ...), or 
it will call the "serialize" method if the property holds an object with the "serialize" method set.

You can set the serialization methods similar to the convert methods:

	$.Observe("Contact",
	{
  		attributes : { 
    		birthday : 'date'
  		},
  		serialize : {
    		date : function( val, type ){
      			return val.getYear() + "-" + (val.getMonth() + 1) + "-" + val.getDate(); 
    		}
  		}
	},
	{
  		// No prototype properties necessary
	})

This code will format the 'birthday' attribute as '2011-11-24' upon save.