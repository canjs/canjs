module("jquery/tie");

test("tie testing works", function(){
	$.Model("Person",{
		setAge : function(age, success, error){
			age =  +(age);
			if(isNaN(age) || !isFinite(age) || age < 1 || age > 10){
				error()
			}else{
				return age;
			}
		}
	});
});