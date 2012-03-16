@page can.Observe.validations
@plugin can/observe/validations
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/validations/validations.js
@test can/observe/validations/qunit.html
@parent can.Observe
 
The `can/observe/validations` plugin provides validations on observes. Validations
are setup on constructor functions that inherit from [can.Observe]. Call
validation functions in `init`.

THe following validates the `birthday` attribute in Contacts:

    can.Observe("Contact",{
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

Use [can.Observe::errors]`( [attrs...], newVal )` to read errors
or to test if setting a value would create an error:

    contact.errors() //-> null - there are no errors
    
    contact.errros("birthday", 
                   new Date(3013,0) ) 
                   //-> ["your birthday needs to be in the past"] 
    
    contact.attr("birthday", new Date(3013,0) )
    
    contact.errors() 
        //-> {
        //     birthday: ["your birthday needs to be in the past"]
        //   }

Use [can.Observe::bind] to listen to error messages:

    contact.bind("error", function(ev, attr, errors){
      attr //-> "birthday"
      errors //-> {birthday: ["your birthday needs to be in the past"]}
    })

## Validation Methods

## Error Method

## Listening to events

## Demo

Click a person's name to update their birthday.  If you put the date
in the future, say the year 2525, it will report back an error.

@demo can/observe/validations/validations.html
