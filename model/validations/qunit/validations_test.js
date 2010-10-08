steal.plugins('funcunit/qunit','jquery/model/validations').then(function(){

module("jquery/model/validations",{
	setup : function(){
		jQuery.Model.extend("Person",{
		},{});
	}
})

test("models can validate, events, callbacks", 11,function(){
	Person.validate("age", {message : "it's a date type"},function(val){
					return ! ( this.date instanceof Date )
				})
	
	
	var task = new Person({age: "bad"}),
		errors = task.errors()
		
	
	ok(errors, "There are errors");
	equals(errors.age.length, 1, "there is one error");
	equals(errors.age[0], "it's a date type", "error message is right");
	
	task.bind("error.age", function(ev, errs){
		ok(this === task, "we get task back");
		
		ok(errs, "There are errors");
		equals(errs.age.length, 1, "there is one error");
		equals(errs.age[0], "it's a date type", "error message is right");
	})
	
	task.attr("age","blah")
	
	task.unbind("error.age");
	task.attr("age", "blaher", function(){}, function(errs){
		ok(this === task, "we get task back");
		
		ok(errs, "There are errors");
		equals(errs.age.length, 1, "there is one error");
		equals(errs.age[0], "it's a date type", "error message is right");
	})
})

test("validatesFormatOf", function(){
	Person.validateFormatOf("thing",/\d-\d/)
	
	ok(!new Person({thing: "1-2"}).errors(),"no errors");
	
	var errors = new Person({thing: "foobar"}).errors();
	
	ok(errors, "there are errors")
	equals(errors.thing.length,1,"one error on thing");
	
	equals(errors.thing[0],"is invalid","basic message");
	
	Person.validateFormatOf("otherThing",/\d/,{message: "not a digit"})
	
	var errors2 = new Person({thing: "1-2", otherThing: "a"}).errors();
	
	equals(errors2.otherThing[0],"not a digit", "can supply a custom message")
});

test("validatesInclusionOf", function(){
	
	
})

test("validatesLengthOf", function(){
	
})

test("validatesPresenceOf", function(){
	$.Model.extend("Task",{
		init : function(){
			this.validatePresenceOf("dueDate")
		}
	},{});
	
	var task = new Task(),
		errors = task.errors();
	
	ok(errors)
	ok(errors.dueDate)
	equals(errors.dueDate[0], "can't be empty" , "right message")
})

test("validatesRangeOf", function(){
	
})

})
