steal("can/model/queue", 'funcunit/qunit', 'can/util/fixture', function(){
	 
module("jquery/model/queue", {
	setup: function() {
		can.Model.extend("Person")
	
		can.Model.List("Person.List",{
			destroy : "DELETE /person/destroyAll",
			update : "PUT /person/updateAll"
		},{});
		var people = []
		for(var i =0; i < 20; i++){
			people.push( new Person({id: "a"+i}) )
		}
		this.people = new can.Model.List(people);
	}
})
