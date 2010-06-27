
module("jquery/model/list")

test("hookup with list", function(){
	$.Model.extend("Person")
	
	$.Model.List.extend("Person.List",{
		destroy : function(){
			equals(this.length, 20,  "Got 20 people")
		}
	});
	
	
	var div = $("<div>")
	
	for(var i =0; i < 20 ; i ++){
		var child = $("<div>");
		var p = new Person({foo: "bar"+i, id: i});
		p.hookup( child[0] );
		div.append(child)
	}
	var models = div.children().models();
	ok(models.Class === Person.List, "correct type");
	models.destroy();

})