steal('funcunit/qunit','./setter',function(){

module("Observe setter");

test("setter testing works", function(){
	
	var Contact = $.Observe({
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


});