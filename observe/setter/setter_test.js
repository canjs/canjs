steal('funcunit/qunit', 
	  'can/observe/validations', 
	  'can/observe/setter', 
	  function(){

module("can/observe/setter");

test("setter testing works", function(){
	
	var Contact = can.Observe({
		setBirthday : function(raw){
			if(typeof raw == 'number'){
				return new Date( raw )
			}else if(raw instanceof Date){
				return raw;
			}
		}
	});
	
	var date = new Date(),
		contact = new Contact({birthday: date.getTime()});
	
	equals(contact.birthday.getTime(), date.getTime(), "set as birthday")
});

test("error binding", 1, function(){

	can.Observe("School",{
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


});