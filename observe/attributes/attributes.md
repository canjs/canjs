@page can.Observe.attributes
@parent can.Observe
@plugin can/observe/attributes
@test can/observe/attributes/qunit.html
@download http://donejs.com/can/dist/can.observe.attributes.js

Attributes when used in conjunction with convert can provide rich functionality for 
converting data attributes from raw types and serializing complex types for the server.

Below is an example code of an Observe providing serialization and conversion for dates and numbers.  

When the observe is initialized, we set the `weight` attribute, its then converted using the 
`number` converter for when we try to re-access the attribute it will be a integer.  Then we set
the `birthday` attribute using the `attr` method, it converts it using the `date` converter we 
provided.  Lastly, we can call `seralize` and it will convert our newly set attributes to our custom 
serializer methods.

	var Contact = new can.Observe({
		attributes: {
			birthday: 'date'
			weight: 'number'
		},
		serialize : {
			date : function( val, type ){
				return val.getYear() + 
						"-" + (val.getMonth() + 1) + 
						"-" + val.getDate(); 
			},
			number: (val){
				return val + '';
			}
		},
		convert: {
			// converts string to date
			date: function( date ) {
				if ( typeof date == 'string' ) {
					//- Extracts dates formated 'YYYY-DD-MM'
					var matches = raw.match( /(\d+)-(\d+)-(\d+)/ ); 
					
					//- Parses to date object and returns
					date = new Date( matches[ 1 ],
							( +matches[ 2 ] ) - 1, 
							matches[ 3 ] ); 
				}
				
				return date;
			},
		
			// converts string to number
			number: function(number){
				if(typeof number === 'string'){
					number = parseInt(number);
				}
				return number;
			}
		}
	}, {});

	var brian = new Contact({
		weight: '300'
	});
	
	//- returns the weight as a int
	var weight = brian.attr('weight');

	//- sets brian's birthday
	brian.attr('birthday', '11-29-1983');

	//- returns newly converted date object
	var date = brian.attr('birthday');

	//- returns { 'birthday': '11-29-1983, 'weight': '300' }
	var seralizedObj = brian.serialize();
	
### Demo

Below is a demo that showcases convert being used on an Observable.  

When a user enters a new date in the format of _YYYY-DD-MM_, the control 
listens for changes in the input box and updates the Observable using 
the `attr` method which then converts the string into a JavaScript date object.  

Additionally, the control also listens for changes on the Observable and 
updates the age in the page for the new birthdate of the contact.

@demo can/observe/attributes/attributes.html
	
## Associations

Attribute type values can also represent the name of a function. The most common case this is used is for associated data.

For example, a Deliverable might have many tasks and an owner (which is a Person). The attributes property might look like:

	var Deliverable = new can.Observe({
		attributes : {
			tasks : "App.Models.Task.models"
			owner: "App.Models.Person.model"
		}
	});

This points tasks and owner properties to use _Task_ and _Person_ to convert the raw data into an array of Tasks and a Person.

Its important to note that the full names of the models themselves are _App.Models.Task_ and _App.Models.Person_. The `.model` 
and `.models` parts are appended for the benefit of convert to identify the types as models.

### Demo

Below is a demo that showcases associations between 2 different models to show the tasks
for each contact and how much time they have left to complete the task(s) using converters.

@demo can/observe/attributes/attributes-assocations.html