steal('can/model').then(function(){
/**
@page jquery.model.validations Validations
@plugin jquery/model/validations
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/validations/validations.js
@test jquery/model/validations/qunit.html
@parent jQuery.Model

In many apps, it's important to validate data before sending it to the server. 
The jquery/model/validations plugin provides validations on models.

## Example

To use validations, you need to call a validate method on the Model class.
The best place to do this is in a Class's init function.

@codestart
$.Model("Contact",{
	init : function(){
		// validates that birthday is in the future
		this.validate("birthday",function(){
			if(this.birthday > new Date){
				return "your birthday needs to be in the past"
			}
		})
	}
},{});
@codeend

## Demo

Click a person's name to update their birthday.  If you put the date
in the future, say the year 2525, it will report back an error.

@demo jquery/model/validations/validations.html
 */

//validations object is by property.  You can have validations that
//span properties, but this way we know which ones to run.
//  proc should return true if there's an error or the error message
var validate = function(attrNames, options, proc) {
	if(!proc){
		proc = options;
		options = {};
	}
	options = options || {};
	attrNames = can.makeArray(attrNames)
	
	if(options.testIf && !options.testIf.call(this)){
		return;
	}
	
	var self = this;
	can.each(attrNames, function(i, attrName) {
		// Call the validate proc function in the instance context
		if(!self.validations[attrName]){
			self.validations[attrName] = [];
		}
		self.validations[attrName].push(function(){
			var res = proc.call(this, this[attrName]);
			return res === undefined ? undefined : (options.message || res);
		})
	});
   
};

can.extend(can.Model, {
	
	validations: {},
	
   /**
    * @function jQuery.Model.static.validate
    * @parent jquery.model.validations
    * Validates each of the specified attributes with the given function.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Function} validateProc Function used to validate each given attribute. Returns nothing if valid and an error message otherwise. Function is called in the instance context and takes the value to validate.
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    */
   validate: validate,
   
   /**
    * @attribute jQuery.Model.static.validationMessages
    * @parent jquery.model.validations
    * The default validation error messages that will be returned by the builtin
    * validation methods. These can be overwritten by assigning new messages
    * to $.Model.validationMessages.&lt;message> in your application setup.
    * 
    * The following messages (with defaults) are available:
    * 
    *  * format - "is invalid"
    *  * inclusion - "is not a valid option (perhaps out of range)"
    *  * lengthShort - "is too short"
    *  * lengthLong - "is too long"
    *  * presence - "can't be empty"
    *  * range - "is out of range"
    * 
    * It is important to steal jquery/model/validations before 
    * overwriting the messages, otherwise the changes will
    * be lost once steal loads it later.
    * 
    * ## Example
    * 
    *     $.Model.validationMessages.format = "is invalid dummy!"
    */
   validationMessages : {
       format      : "is invalid",
       inclusion   : "is not a valid option (perhaps out of range)",
       lengthShort : "is too short",
       lengthLong  : "is too long",
       presence    : "can't be empty",
       range       : "is out of range"
   },

   /**
    * @function jQuery.Model.static.validateFormatOf
    * @parent jquery.model.validations
    * Validates where the values of specified attributes are of the correct form by
    * matching it against the regular expression provided.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {RegExp} regexp Regular expression used to match for validation
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateFormatOf: function(attrNames, regexp, options) {
      validate.call(this, attrNames, options, function(value) {
         if(  (typeof value != 'undefined' && value != '')
         	&& String(value).match(regexp) == null )
         {
            return this.constructor.validationMessages.format;
         }
      });
   },

   /**
    * @function jQuery.Model.static.validateInclusionOf
    * @parent jquery.model.validations
    * Validates whether the values of the specified attributes are available in a particular
    * array.   See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Array} inArray Array of options to test for inclusion
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    * 
    */
   validateInclusionOf: function(attrNames, inArray, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value == 'undefined')
            return;

         if(can.grep(inArray, function(elm) { return (elm == value);}).length == 0)
            return this.constructor.validationMessages.inclusion;
      });
   },

   /**
    * @function jQuery.Model.static.validateLengthOf
    * @parent jquery.model.validations
    * Validates that the specified attributes' lengths are in the given range.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Number} min Minimum length (inclusive)
    * @param {Number} max Maximum length (inclusive)
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateLengthOf: function(attrNames, min, max, options) {
      validate.call(this, attrNames, options, function(value) {
         if((typeof value == 'undefined' && min > 0) || value.length < min)
            return this.constructor.validationMessages.lengthShort + " (min=" + min + ")";
         else if(typeof value != 'undefined' && value.length > max)
            return this.constructor.validationMessages.lengthLong + " (max=" + max + ")";
      });
   },

   /**
    * @function jQuery.Model.static.validatePresenceOf
    * @parent jquery.model.validations
    * Validates that the specified attributes are not blank.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validatePresenceOf: function(attrNames, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value == 'undefined' || value == "" || value === null)
            return this.constructor.validationMessages.presence;
      });
   },

   /**
    * @function jQuery.Model.static.validateRangeOf
    * @parent jquery.model.validations
    * Validates that the specified attributes are in the given numeric range.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Number} low Minimum value (inclusive)
    * @param {Number} hi Maximum value (inclusive)
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateRangeOf: function(attrNames, low, hi, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value != 'undefined' && value < low || value > hi)
            return this.constructor.validationMessages.range + " [" + low + "," + hi + "]";
      });
   }
});

can.extend(can.Model.prototype, {

	/**
	 * Runs the validations on this model.  You can
	 * also pass it an array of attributes to run only those attributes.
	 * It returns nothing if there are no errors, or an object
	 * of errors by attribute.
	 * 
	 * To use validations, it's suggested you use the 
	 * model/validations plugin.
	 * 
	 *     $.Model("Task",{
	 *       init : function(){
	 *         this.validatePresenceOf("dueDate")
	 *       }
	 *     },{});
	 * 
	 *     var task = new Task(),
	 *         errors = task.errors()
	 * 
	 *     errors.dueDate[0] //-> "can't be empty"
	 * 
	 * @param {Array} [attrs] an optional list of attributes to get errors for:
	 * 
	 *     task.errors(['dueDate']);
	 *     
	 * @return {Object} an object of attributeName : [errors] like:
	 * 
	 *     task.errors() // -> {dueDate: ["cant' be empty"]}
	 */
	errors: function( attrs ) {
		// convert attrs to an array
		if ( attrs ) {
			attrs = can.isArray(attrs) ? attrs : can.makeArray(arguments);
		}
		
		var errors = {},
			self = this,
			attr,
			// helper function that adds error messages to errors object
			// attr - the name of the attribute
			// funcs - the validation functions
			addErrors = function( attr, funcs ) {
				can.each(funcs, function( i, func ) {
					var res = func.call(self);
					if ( res ) {
						if (!errors[attr] ) {
							errors[attr] = [];
						}
						errors[attr].push(res);
					}

				});
			},
			validations = this.constructor.validations;

		// go through each attribute or validation and
		// add any errors
		can.each(attrs || validations || {}, function( attr, funcs ) {
			// if we are iterating through an array, use funcs
			// as the attr name
			if ( typeof attr == 'number' ) {
				attr = funcs;
				funcs = validations[attr];
			}
			// add errors to the 
			addErrors(attr, funcs || []);
		});
		
		// return errors as long as we have one
		return can.isEmptyObject(errors) ? null : errors;
	}
	
});

});
