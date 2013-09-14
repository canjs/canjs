@page can.Observe.validations validations
@parent can.Observe.plugins
@plugin can/observe/validations
@test can/observe/validations/test.html

The `can/observe/validations` plugin provides validations on observes. Validations
are set on [can.Observe]'s __static__ `init` function.

The following validates the `birthday` attribute in Contacts:

    Contact = can.Observe.extend({
    	init : function(){
    		// validates that birthday is in the future
    		this.validate("birthday",function(birthday){
    			if(birthday > new Date){
    				return "your birthday needs to be in the past"
    			}
    		})
    	}
    },{});
    
    var contact = new Contact({birthday: new Date(2012,0) })

Use [can.Observe.validations.prototype.errors errors] `( [attrs...], newVal )` to read errors
or to test if setting a value would create an error:

    // Check if there are errors on the instance
    contact.errors() //-> null - there are no errors
    
    // Test if setting birthday to new Date(3013,0) would error
    contact.errors("birthday", 
                   new Date(3013,0) ) 
                   //-> ["your birthday needs to be in the past"] 
    
    // Set birthday anyway
    contact.attr("birthday", new Date(3013,0) )
    
    // Get all errors
    contact.errors() 
        //-> {
        //     birthday: ["your birthday needs to be in the past"]
        //   }
        
    // Get errors for birthday
    contact.errors("birthday") 
        //-> ["your birthday needs to be in the past"]

## Validation Methods

The most basic validate method is [can.Observe.validations.static.validate validate]<code>()</code>.  

There are several built-in validation methods so you don't have to define your own in all cases like in the birthday example above.

- [can.Observe.validations.static.validate can.Observe.validate]<code>(attrNames, options, proc)</code> Attributes validated with function.
- [can.Observe.validations.static.validateFormatOf can.Observe.validateFormatOf]<code>(attrNames, regexp, options)</code> Attributes match the regular expression.	
- [can.Observe.validations.static.validateInclusionOf can.Observe.validateInclusionOf]<code>( attrNames, inArray, [options] )</code> Attributes are available in a particular array.	
- [can.Observe.validations.static.validateLengthOf can.Observe.validateLengthOf]<code>(attrNames, min, max, [options])</code> Attributes' lengths are in the given range.	
- [can.Observe.validations.static.validatePresenceOf can.Observe.validatePrese]<code>( attrNames, [options] )</code> Attributes are not blank.	
- [can.Observe.validations.static.validateRangeOf can.Observe.validateRangeOf]<code>(attrNames, low, hi, [options])</code> Attributes are in the given numeric range.

## Error Method

[can.Observe.validations.prototype.errors can.Observe.errors]<code>()</code> runs the validations on this model. You can also pass it an array 
of attributes to run only those attributes. It returns 
nothing if there are no errors, or an object of errors by attribute.

To use validations, it's required you use the _observe/validations_ plugin.

	Task = can.Observe.extend({
		init : function(){
			this.validatePresenceOf("dueDate")
		}
	},{});

	var task = new Task(),
    	errors = task.errors()

	errors.dueDate[0] //-> "can't be empty"

## Listening to events

Use [can.Observe::bind bind] to listen to error messages:

	contact.bind("error", function(ev, attr, errors){
		// attr = "birthday"
		// errors = { birthday: 
		//		["your birthday needs to be in the past"] }
	})

## Demo

Click a person's name to update their birthday.  If you put the date
in the future, say the year 2525, it will report back an error.

@demo can/observe/validations/validations.html
