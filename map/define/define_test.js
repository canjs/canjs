
steal("can/map/define", "can/test", function () {
	
	module('can/map/define');
	
	// remove, type, default
	test('basics set', function () {
		var Defined = can.Map.extend({
			define: {
				prop: {
					set: function(newVal){
						return "foo"+newVal;
					}
				}
			}
		});
		
		var def = new Defined();
		def.attr("prop","bar");
		
		equal( def.attr("prop"), "foobar", "setter works" );
		
		Defined = can.Map.extend({
			define: {
				prop: {
					set: function(newVal, setter){
						setter("foo"+newVal);
					}
				}
			}
		});
		
		def = new Defined();
		def.attr("prop","bar");
		
		equal( def.attr("prop"), "foobar", "setter callback works" );
		
	});
	
	test("basics remove", function(){
		var ViewModel = can.Map.extend({
			define:{
				makeId: {
					remove: function(){
						this.removeAttr("models");
					}
				},
				models: {
					remove: function(){
						this.removeAttr("modelId");
					}
				},
				modelId: {
					remove: function(){
						this.removeAttr("years");
					}
				},
				years: {
					remove: function(){
						this.removeAttr("year");
					}
				}
			}
		});
		
		var mmy = new ViewModel({
			makes: [{id: 1}],
			makeId: 1,
			models: [{id: 2}],
			modelId: 2,
			years: [2010],
			year: 2010
		});
		
		var events = ["year","years","modelId","models","makeId"],
			eventCount = 0,
			batchNum;
			
		mmy.bind("change", function(ev, attr){
			if(batchNum === undefined) {
				batchNum = ev.batchNum;
			}
			equal(attr, events[eventCount++], "got correct attribute");
			ok(ev.batchNum && ev.batchNum === batchNum, "batched");
		});
		
		mmy.removeAttr("makeId");
		
	});
	
	test("basics get", function(){
		
		var Person = can.Map.extend({
			define: {
				fullName: {
					get: function(){
						return this.attr("first")+" "+this.attr("last");
					}
				}
			}
		});
		
		var p = new Person({first: "Justin", last: "Meyer"});
		
		equal(p.attr("fullName"),"Justin Meyer", "sync getter works");

		var Adder = can.Map.extend({
			define: {
				more: {
					get: function(curVal, setVal){
						var num = this.attr("num");
						setTimeout(function(){
							setVal(num+1);
						},10);
					}
				}
			}
		});
		
		var a = new Adder({num: 1}),
			callbackVals = [
				[2, undefined, function(){ a.attr("num",2); }],
				[3, 2, function(){ start(); }]
			],
			callbackCount = 0;
		
		a.bind("more", function(ev, newVal, oldVal){
			var vals = callbackVals[callbackCount++];
			equal(newVal, vals[0], "newVal is correct");
			equal(a.attr("more"), vals[0], "attr value is correct");
			
			equal(oldVal, vals[1], "oldVal is correct");
			
			setTimeout(vals[2], 10);
		});
		
		stop();
	});
	
	test("basic type", function(){
		
		expect(6);
		
		var Typer = can.Map.extend({
			define: {
				arrayWithAddedItem: {
					type: function(value){
						if(value && value.push) {
							value.push("item");
						}
						return value;
					}
				},
				listWithAddedItem: {
					type: function(value){
						if(value && value.push) {
							value.push("item");
						}
						return value;
					},
					Type: can.List
				}
			}
		});
		
		
		var t = new Typer();
		deepEqual( can.Map.keys(t), [], "no keys" );
		
		var array = [];
		t.attr("arrayWithAddedItem", array);
		
		deepEqual(array, ["item"], "updated array");
		equal(t.attr("arrayWithAddedItem"), array, "leave value as array");
		
		t.attr("listWithAddedItem",[]);
		
		ok( t.attr("listWithAddedItem") instanceof can.List, "convert to can.List" );
		equal( t.attr("listWithAddedItem").attr(0), "item", "has item in it");
		
		t.bind("change", function(ev, attr, how, newVal, oldVal){
			equal(attr, "listWithAddedItem.1", "got a bubbling event");
		});
		
		t.attr("listWithAddedItem").push("another item");
		
	});
	
	test("type converters", function(){
		
		var Typer = can.Map.extend({
			define : {
				date : {  type: 'date' },
				string: {type: 'string'},
				number : {  type: 'number' },
				'boolean' : {  type: 'boolean' },
				leaveAlone : {  type: '*' }
			}
		});
		var obj = {};
		
		var t = new Typer({
			date: 1395896701516,
			string: 5,
			number: '5',
			'boolean': 'false',
			leaveAlone: obj
		});
		
		ok( t.attr("date") instanceof Date, "converted to date");
		
		equal( t.attr("string"), '5', "converted to string");
		
		equal( t.attr("number"), 5, "converted to number");
		
		equal( t.attr("boolean"), false, "converted to boolean");
		
		equal( t.attr("leaveAlone"), obj, "left as object");
		
	});
});