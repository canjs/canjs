module("jquery/model/associations",{
	setup: function() {
		
		$.Model("MyTest.Person");
		$.Model("MyTest.Loan");
		$.Model("MyTest.Issue");
		
		$.Model.extend("MyTest.Customer",
		{
			attributes : {
				person : "MyTest.Person.model",
				loans : "MyTest.Loan.models",
				issues : "MyTest.Issue.models"
			}
		},
		{});
	}
})





test("associations work", function(){
	var c = new MyTest.Customer({
		id: 5,
		person : {
			id: 1,
			name: "Justin"
		},
		issues : [],
		loans : [
			{
				amount : 1000,
				id: 2
			},
			{
				amount : 19999,
				id: 3
			}
		]
	})
	equals(c.person.name, "Justin", "association present");
	equals(c.person.Class, MyTest.Person, "belongs to association typed");
	
	equals(c.issues.length, 0);
	
	equals(c.loans.length, 2);
	
	equals(c.loans[0].Class, MyTest.Loan);
})