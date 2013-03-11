(function() {
module("can/model/queue", {
	setup: function() {

	}
})

test("queued requests will not overwrite attrs", function(){
	var delay = can.fixture.delay;
	can.fixture.delay = 1000;
	can.Model("Person",{
		create : function(id, attrs, success, error){
			return can.ajax({
				url : "/people/"+id,
				data : attrs,
				type : 'post',
				dataType : "json",
				fixture: function(){
					return {name: "Justin"}
				},
				success : success
			})
		}
	},{});
	
	var person  = new Person({name: "Justin"}),
		personD = person.save();
	
	person.attr('name', 'Brian')

	stop();
	personD.then(function(person){
		start()
		equals(person.name, "Brian", "attrs were not overwritten");
		can.fixture.delay = delay;
		
	});
})

})();