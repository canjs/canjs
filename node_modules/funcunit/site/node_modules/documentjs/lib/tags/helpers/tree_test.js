var tree = require("./tree"),
	assert = require("assert");
	
describe("documentjs/tags/helpers/tree", function(){
	
	it("basics", function(){
		
		assert.deepEqual( tree("foo"), [{token: "foo",start: 0, end: 3}] );
		assert.deepEqual( tree("(foo)"), [{
			token: "(", 
			children: [{token: "foo",start: 1, end: 4}], 
			start: 0, 
			end: 5 }]);
		
	
		assert.deepEqual( tree("bar(foo)"), [
			{token: "bar", start: 0, end:3},
			{ token: "(", start: 3, end: 8, children: [{token: "foo",start: 4, end: 7}] }]);
		
		assert.deepEqual( tree("(<foo>, {bar})abc",["([,])"]), 
			[{token: "(",
			  start: 0,
			  end: 14,
			  children: [
			  	{token: "<", start: 1, end: 6, children: [{token: "foo",start: 2, end: 5}] },
			  	{token: ",", start: 6, end: 7},
			  	{token: " ", start: 7, end: 8},
			    {token: "{", start: 8, end: 13, children: [{token: "bar",start: 9, end: 12}]}
			  ]},
			  {token: "abc",start: 14, end: 17}]);
		
		assert.deepEqual( tree("foo",null, " "), [{token: "foo",start: 0, end: 3}] );
		

		
	});

	it("escaping",function(){
		assert.deepEqual( tree("fo\\(\\)o"), [{token: "fo()o", start: 0, end: 7}] );
		
		assert.deepEqual( tree("\\(args...\\)"), [{token:"(args...)", start: 0, end: 11}]);
		
		
	});
	
	it("handles closes without openings", function(){
		assert.deepEqual( tree("> } )"), [
			{"start":0,"end":1,"token":">"},
			{"start":1,"end":2,"token":" "},
			{"start":2,"end":3,"token":"}"},
			{"start":3,"end":4,"token":" "},
			{"start":4,end: 5, token: ")"}] );
		
	});
});
