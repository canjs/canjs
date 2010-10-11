module("jquery/model", { 
	setup: function() {
        var ids = 0;
	    $.Model.extend("Person",{
			findAll: function( params, success, error ) {
				success("findAll");
			},
			findOne: function( params, success, error ) {
				success("findOne");
			},
			create: function( params, success, error ) {
				success({zoo: "zed", id: (++ids)},"create");
			},
			destroy: function( id, success, error ) {
				success("destroy");
			},
			update: function( id, attrs, success, error ) {
				success({zoo: "monkeys"},"update");
			}
		},{
			prettyName: function() {
				return "Mr. "+this.name;
			}
		})
	}
})


test("CRUD", function(){
   
	Person.findAll({}, function(response){
		equals("findAll", response)
	})
	Person.findOne({}, function(response){
		equals("findOne", response)
	})
    var person;
	new Person({foo: "bar"}).save(function(inst, attrs, create){
		equals(create, "create")
		equals("bar", inst.foo)
		equals("zed", inst.zoo)
		ok(inst.save, "has save function");
		person = inst;
	});
    person.update({zoo: "monkey"},function(inst, attrs, update){
		equals(inst, person, "we get back the same instance");
		equals(person.zoo, "monkeys", "updated to monkeys zoo!  This tests that you callback with the attrs")
	})
})
test("hookup and model", function(){
	var div = $("<div/>")
	var p = new Person({foo: "bar2", id: 5});
	p.hookup( div[0] );
	ok(div.hasClass("person"), "has person");
	ok(div.hasClass("person_5"), "has person_5");
	equals(p, div.model(),"gets model" )
})
test("guess type", function(){
   equals("array", $.Model.guessType( [] )  );
   equals("date", $.Model.guessType( new Date() )  );
   equals("boolean", $.Model.guessType( true )  );
   equals("number", $.Model.guessType( "1" )  );
   equals("string", $.Model.guessType( "a" )  );
   
   equals("string", $.Model.guessType( "1e234234324234" ) );
   equals("string", $.Model.guessType( "-1e234234324234" ) );
})

test("wrapMany", function(){
	var people = Person.wrapMany([
		{id: 1, name: "Justin"}
	])
	equals(people[0].prettyName(),"Mr. Justin","wraps wrapping works")
});

test("binding", 2,function(){
	var inst = new Person({foo: "bar"});
	
	inst.bind("foo", function(ev, val){
		ok(true,"updated")	
		equals(val, "baz", "values match")
	});
	
	inst.attr("foo","baz");
	
});

test("error binding", 1, function(){
	$.Model.extend("School",{
	   setName : function(name, success, error){
	     if(!name){
	        error("no name");
	     }
	     return error;
	   }
	})
	var school = new School();
	school.bind("error.name", function(ev, error){
		equals(error, "no name", "error message provided")
	})
	school.attr("name","");
	
	
})


