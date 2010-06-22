module("jquery/model/list",{
	setup : function(){
		$.Model.extend("MyTest.Items");		
	}
})

test("list testing works with other array like items other than Array", function(){
	var items = MyTest.Items.wrapMany([
		{id: 1, value: 1, text: "Chicago"},
		{id: 2, value: 2, text: "Porto"},
		{id: 3, value: 3, text: "San Francisco"},
		{id: 4, value: 4, text: "New York"},
		{id: 5, value: 5, text: "Seattle"},
		{id: 6, value: 6, text: "Portland"},
		{id: 7, value: 7, text: "Detroit"} ])
		
	// wrapMany returns a $.Model.List - items not a pure Array
    var list = new $.Model.List( items );

	equals( list.length, 7, "list successfully created" );
	equals( list.match("value", 2)[0].attr("text"), "Porto", "list match was successfull" );
})