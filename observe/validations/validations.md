@page can.Observe.validations
@plugin can/observe/validations
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/validations/validations.js
@test can/observe/validations/qunit.html
@parent can.Observe

In many apps, it's important to validate data before sending it to the server. 
The can/observe/validations plugin provides validations on observes.

## Example

To use validations, you need to call a validate method on the Model class.
The best place to do this is in a Class's init function.


    can.Observe("Contact",{
    	init : function(){
    		// validates that birthday is in the future
    		this.validate("birthday",function(){
    			if(this.birthday > new Date){
    				return "your birthday needs to be in the past"
    			}
    		})
    	}
    },{});


## Demo

Click a person's name to update their birthday.  If you put the date
in the future, say the year 2525, it will report back an error.

@demo can/observe/validations/validations.html
