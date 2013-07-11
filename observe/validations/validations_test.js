(function() {

module("can/observe/validations",{
	setup : function(){
		can.Observe.extend("Person",{
		},{});
	}
})

test("observe can validate, events, callbacks", 7,function(){
	Person.validate("age", {message : "it's a date type"},function(val){
					return ! ( this.date instanceof Date )
				})
	
	
	var task = new Person({age: "bad"}),
		errors = task.errors()
		
	
	ok(errors, "There are errors");
	equal(errors.age.length, 1, "there is one error");
	equal(errors.age[0], "it's a date type", "error message is right");
	
	task.bind("error.age", function(ev, attr, errs){
		ok(this === task, "we get task back by binding");
		
		ok(errs, "There are errors");
		equal(errs.age.length, 1, "there is one error");
		equal(errs.age[0], "it's a date type", "error message is right");
	})
	
	task.attr("age","blah");

	task.unbind("error.age");
	
	task.attr("age", "blaher");
	
})

test("observe can validate, events, callbacks with nested props", 7,function(){
	Person.validate("info.age", {message : "it's a date type"},function(val){
					return ! ( this.date instanceof Date )
				})

	var task = new Person({info : {age: "bad"}}),
		errors = task.errors()
		
	
	ok(errors, "There are errors");
	equal(errors['info.age'].length, 1, "there is one error");
	equal(errors['info.age'][0], "it's a date type", "error message is right");
	
	task.bind("error.info.age", function(ev, attr, errs){
		ok(this === task, "we get task back by binding");
		
		ok(errs, "There are errors");
		equal(errs['info.age'].length, 1, "there is one error");
		equal(errs['info.age'][0], "it's a date type", "error message is right");
	})
	
	task.attr("info.age","blah");

	task.unbind("error.info.age");
	
	task.attr("info.age", "blaher");
	
})

test('observe can validate nested properties', function(){
	Person.validate('company.name', function(){
		return 'company name validated from parent'
	})

	var Company = can.Observe({})

	Company.validate('name', function(){
		return 'name is wrong'
	})

	var company = new Company;

	var person = new Person;

	person.attr('company', company)

	person.attr('company.name', 'foo')

	deepEqual(person.errors(), {
		'company.name' : [
			'company name validated from parent',
			'name is wrong'
		]
	}, 'Parent objects correctly validate children');

	deepEqual(company.errors(), {
		name : ['name is wrong']
	}, 'Parent validations are not run when errors is called on the child')
})

test('observe can validate arrays of nested properties', function(){
	Person.validate('phoneNumbers.*', function(val, attr){
		return val > 2 ? 'number too big' : null;
	})

	var person = new Person({phoneNumbers : [1,2,3]})

	person.attr('phoneNumbers').push(4);

	deepEqual(person.errors(), {
		"phoneNumbers.2" : ['number too big'],
		"phoneNumbers.3" : ['number too big'],
	})
})

test('complex nested validation scenarios', function(){
	Person.validate('company.phoneNumbers.*.countryCode', function(val, attr){
		if(val !== 1 && val !== 385){
			return 'wrong country code'
		}
	})
	var person = new Person;

	person.attr('company', {
		phoneNumbers : [{
			number : 12345,
			countryCode : 1
		},{
			number : 12345,
			countryCode : 385
		},{
			number : 12345,
			countryCode : 41
		},{
			number : 12345,
			countryCode : 1
		}]
	});

	deepEqual(person.errors(), {
		'company.phoneNumbers.2.countryCode' : ['wrong country code']
	}, 'Error is set on the correct path')
})

test('complex deeply nested validation scenarios', function(){
	Person.validate('company.phoneNumbers.*.countryCode.*', function(val, attr){
		if(val !== 1 && val !== 385){
			return 'wrong country code'
		}
	})
	Person.validate('company.phoneNumbers.*.address.*.street', function(val, attr){
		if(val === ''){
			return 'street is mandatory'
		}
	})
	var person = new Person;

	person.attr('company', {
		phoneNumbers : [{
			number : 12345,
			countryCode : [1, 2],
			address : [{
				street : 'foo'
			}]
		},{
			number : 12345,
			countryCode : [385, 32],
			address : [{
				street : 'foo'
			}]
		},{
			number : 12345,
			countryCode : [41, 23],
			address : [{
				street : 'foo'
			}]
		},{
			number : 12345,
			countryCode : [1],
			address : [{
				street : 'foo'
			}, {
				street : ''
			}]
		}]
	});

	deepEqual(person.errors(), {
		'company.phoneNumbers.0.countryCode.1' : ['wrong country code'],
		'company.phoneNumbers.1.countryCode.1' : ['wrong country code'],
		'company.phoneNumbers.2.countryCode.0' : ['wrong country code'],
		'company.phoneNumbers.2.countryCode.1' : ['wrong country code'],
		"company.phoneNumbers.3.address.1.street" : ["street is mandatory"]
	}, 'Error is set on the correct path')
	
})

test('correct attr is sent to the validation function', function(){
	Person.validate('company.phoneNumbers.*.countryCode.*', function(val, attr){
		equal(attr, 'company.phoneNumbers.0.countryCode.0', 'Correct attr is sent')
	})

	var person = new Person({
		company : {
			phoneNumbers : [{
				countryCode : [1]
			}]
		}
	})

	person.errors();
})

test('validations of the list objects', function(){
	var ContractNumbers = can.Observe.List({});

	ContractNumbers.validate('*', function(val){
		return val === '' ? 'contract number is mandatory' : null;
	})

	var contractNumbers = new ContractNumbers(['foo', 'bar', 123, '']);

	deepEqual(contractNumbers.errors(), {
		3 : ['contract number is mandatory']
	})
})

test('validations on the list objects work when called from the parent', function(){
	window.ContractNumbers = can.Observe.List({
		items : function(items){
			return new this(items)
		}
	}, {});

	ContractNumbers.validate('*', function(val){
		return val === '' ? 'contract number is mandatory' : null;
	})

	var Customer = can.Observe({
		attributes : {
			contractNumbers : 'ContractNumbers.items'
		}
	}, {})

	var customer = new Customer({contractNumbers : ['foo', 'bar', 123, '']});

	deepEqual(customer.errors(), {
		'contractNumbers.3' : ['contract number is mandatory']
	})

	delete window.ContractNumbers;
})

test("validatesFormatOf", function(){
	Person.validateFormatOf("thing",/\d-\d/)
	
	ok(!new Person({thing: "1-2"}).errors(),"no errors");
	
	var errors = new Person({thing: "foobar"}).errors();
	
	ok(errors, "there are errors")
	equal(errors.thing.length,1,"one error on thing");
	
	equal(errors.thing[0],"is invalid","basic message");
	
	Person.validateFormatOf("otherThing",/\d/,{message: "not a digit"})
	
	var errors2 = new Person({thing: "1-2", otherThing: "a"}).errors();
	
	equal(errors2.otherThing[0],"not a digit", "can supply a custom message")
	
	ok(!new Person({thing: "1-2", otherThing: null}).errors(),"can handle null")
	ok(!new Person({thing: "1-2"}).errors(),"can handle undefiend")
});

test("validatesInclusionOf", function(){
	Person.validateInclusionOf("thing", ["yes", "no", "maybe"]);

	ok(!new Person({thing: "yes"}).errors(),"no errors");

	var errors = new Person({thing: "foobar"}).errors();

	ok(errors, "there are errors");
	equal(errors.thing.length,1,"one error on thing");

	equal(errors.thing[0],"is not a valid option (perhaps out of range)","basic message");

	Person.validateInclusionOf("otherThing", ["yes", "no", "maybe"],{message: "not a valid option"});
	
	var errors2 = new Person({thing: "yes", otherThing: "maybe not"}).errors();
	
	equal(errors2.otherThing[0],"not a valid option", "can supply a custom message");
});

test("validatesLengthOf", function(){
	Person.validateLengthOf("undefinedValue", 0, 5);
	Person.validateLengthOf("nullValue", 0, 5);
	Person.validateLengthOf("thing", 2, 5);

	ok(!new Person({thing: "yes",nullValue: null}).errors(),"no errors");
	
	var errors = new Person({thing: "foobar"}).errors();

	ok(errors, "there are errors");
	equal(errors.thing.length,1,"one error on thing");

	equal(errors.thing[0],"is too long (max=5)","basic message");

	Person.validateLengthOf("otherThing", 2, 5, {message: "invalid length"});

	var errors2 = new Person({thing: "yes", otherThing: "too long"}).errors();

	equal(errors2.otherThing[0],"invalid length", "can supply a custom message");
	Person.validateLengthOf("undefinedValue2", 1, 5);
	Person.validateLengthOf("nullValue2", 1, 5);
	var errors3 = new Person({thing: "yes",nullValue2:null}).errors();

	equal(errors3.undefinedValue2.length,1, "can handle undefined");
	equal(errors3.nullValue2.length,1, "can handle null");
});

test("validatesPresenceOf", function(){
	can.Observe.extend("Task",{
		init : function(){
			this.validatePresenceOf("dueDate")
		}
	},{});
	
    //test for undefined
	var task = new Task(),
		errors = task.errors();
	
	ok(errors)
	ok(errors.dueDate)
	equal(errors.dueDate[0], "can't be empty" , "right message");
	
    //test for null
	task = new Task({dueDate: null});
    errors = task.errors();
	
	ok(errors)
	ok(errors.dueDate)
	equal(errors.dueDate[0], "can't be empty" , "right message");

    //test for ""
	task = new Task({dueDate: ""});
    errors = task.errors();
	
	ok(errors)
	ok(errors.dueDate)
	equal(errors.dueDate[0], "can't be empty" , "right message");

	//Affirmative test
	task = new Task({dueDate : "yes"});
	errors = task.errors();;
	
	ok(!errors, "no errors "+typeof errors);
	
	can.Observe.extend("Task",{
		init : function(){
			this.validatePresenceOf("dueDate",{message : "You must have a dueDate"})
		}
	},{});
	
	task = new Task({dueDate : "yes"});
	errors = task.errors();;
	
	ok(!errors, "no errors "+typeof errors);
})

test("validatesPresenceOf with numbers and a 0 value", function() {
  can.Observe.extend("Person", { attributes: {age: "number"}});

  Person.validatePresenceOf("age");

  var person = new Person();
  var errors = person.errors();

  ok(errors)
  ok(errors.age)
  equal(errors.age[0], "can't be empty", "A new Person with no age generates errors.");

  //test for null
  person = new Person({age: null});
  errors = person.errors();

  ok(errors)
  ok(errors.age)
  equal(errors.age[0], "can't be empty" , "A new Person with null age generates errors.");

  //test for ""
  person = new Person({age: ""});
  errors = person.errors();

  ok(errors)
  ok(errors.age)
  equal(errors.age[0], "can't be empty" , "A new Person with an empty string age generates errors.");

  //Affirmative test
  person = new Person({age: 12});
  errors = person.errors();

  ok(!errors, "A new Person with a valid >0 age doesn't generate errors.");

  //Affirmative test with 0
  person = new Person({age: 0});
  errors = person.errors();

  ok(!errors, "A new Person with a valid 0 age doesn't generate errors");
});

test("validatesRangeOf", function(){
	Person.validateRangeOf("thing", 2, 5);
	Person.validateRangeOf("nullValue", 0, 5);
	Person.validateRangeOf("undefinedValue", 0, 5);
	ok(!new Person({thing: 4,nullValue:null}).errors(),"no errors");

	var errors = new Person({thing: 6}).errors();

	ok(errors, "there are errors")
	equal(errors.thing.length,1,"one error on thing");

	equal(errors.thing[0],"is out of range [2,5]","basic message");

	Person.validateRangeOf("otherThing", 2, 5, {message: "value out of range"});

	var errors2 = new Person({thing: 4, otherThing: 6}).errors();

	equal(errors2.otherThing[0],"value out of range", "can supply a custom message");
	Person.validateRangeOf("nullValue2", 1, 5);
	Person.validateRangeOf("undefinedValue2", 1, 5);
	var errors3 = new Person({thing: 2,nullValue2:null}).errors();
	equal(errors3.nullValue2.length,1,"one error on nullValue2");
	equal(errors3.undefinedValue2.length,1,"one error on undefinedValue2");
});

test("validatesNumericalityOf", function(){
	Person.validatesNumericalityOf(["foo"]);
	
	var errors = new Person({foo: 0}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: 1}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: 1.5}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: -1.5}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: "1"}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: "1.5"}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: ".5"}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: "-1.5"}).errors();
	ok(!errors, "no errors");
	
	var errors = new Person({foo: " "}).errors();
	equal(errors.foo.length,1,"one error on foo");
	
	var errors = new Person({foo: "1f"}).errors();
	equal(errors.foo.length,1,"one error on foo");
	
	var errors = new Person({foo: "f1"}).errors();
	equal(errors.foo.length,1,"one error on foo");
	
	var errors = new Person({foo: "1.5.5"}).errors();
	equal(errors.foo.length,1,"one error on foo");
	
	var errors = new Person({foo: "\t\t"}).errors();
	equal(errors.foo.length,1,"one error on foo");
	
	var errors = new Person({foo: "\n\r"}).errors();
	equal(errors.foo.length,1,"one error on foo");
});

})();