@page can.Construct.super
@parent can.Construct

Super provides a easy way to call a function name defined higher on the prototype chain.

	var First = can.Construct({
		raise: function(num){
			return num;
		}
	},{});

	var Second = First({
		raise: function(num){
			return this._super(num)*num;
		}
	},{});
	
In the above example when we call 'this._super' in the second prototype, 
the super method allows us to invoke the 'raise' function in the first class. 