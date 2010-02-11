module("Class");

test("CRUD", function(){
    var ids = 0;
    $.Model.extend("Person",{
		init : function(){
			
		},
		findAll : function(params, success, error){
			success("findAll");
		},
		findOne : function(params, success, error){
			success("findOne");
		},
		create : function(params, success, error){
			success({zoo: "zed", id: (++ids)},"create");
		},
		destroy : function(id, success, error){
			success("destroy");
		},
		update : function(id, attrs, success, error){
			success({zoo: "monkeys"},"update");
		}
	},{
		
	})
	
	
	
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
	
	
	//equals(person.update)
	
})
