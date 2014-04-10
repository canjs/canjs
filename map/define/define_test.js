
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
	
	test("basic Type", function(){
		var Foo = function(name) {
			this.name = name
		};
		Foo.prototype.getName = function(){
			return this.name;
		};
		
		var Typer = can.Map.extend({
			define : {
				foo : {
					Type: Foo
				}
			}
		});
		
		var t = new Typer({foo: "Justin"});
		equal( t.attr("foo").getName(), "Justin", "correctly created an instance");
		
		var brian = new Foo("brian");
		
		t.attr("foo",brian);
		
		equal(t.attr("foo"), brian, "same instances");
		
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
	
	
	test("basics value", function(){
		var Typer = can.Map.extend({
			define : {
				prop : { value: 'foo' }
			}
		});
		
		equal( new Typer().attr('prop'), "foo", "value is used as default value");
		
		
		Typer2 = can.Map.extend({
			define : {
				prop : { 
					value: function(){ 
						return []; 
					},
					type: "*"
				}
			}
		});
		
		var t1 = new Typer2,
			t2 = new Typer2;
		ok(t1.attr("prop") !== t2.attr("prop"), "different array instances");
		ok( can.isArray(t1.attr("prop")), "its an array" )
		
		
	});
	
	test("basics Value", function(){
		
		var Typer = can.Map.extend({
			define : {
				prop : { 
					Value: Array,
					type: "*"
				}
			}
		});
		
		var t1 = new Typer,
			t2 = new Typer;
		ok(t1.attr("prop") !== t2.attr("prop"), "different array instances");
		ok( can.isArray(t1.attr("prop")), "its an array" );
		
		
	});
	
	
	test("setter with no arguments and returns undefined does the default behavior, the setter is for side effects only", function(){
		
		var Typer = can.Map.extend({
			define: {
				prop: {
					set: function(){
						this.attr("foo","bar")
					}
				}
			}
		});
		
		var t = new Typer();
		
		t.attr("prop", false);
		
		deepEqual(t.attr(), {foo: "bar", prop: false})
		
		
	});
	
	test("type happens before the set", function(){
		var MyMap = can.Map.extend({
			define: {
				prop: {
					type: "number",
					set: function(newValue){
						equal(typeof newValue, "number", "got a number");
						return newValue+1;
					}
				}
			}
		});
		
		var map = new MyMap();
		map.attr("prop", "5");
		
		equal(map.attr("prop"), 6, "number");
	});
	
	test("getter and setter work", function(){
		expect(5);
		var Paginate = can.Map.extend({
			define: {
				page: {
					set: function(newVal){
						this.attr('offset', (parseInt(newVal) - 1) * this.attr('limit'));
					},
					get: function () {
						return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
					}
				}
			}
		});
		
		var p = new Paginate({limit: 10, offset: 20});
		
		equal( p.attr("page"), 3, "page get right" );
		
		p.bind("page", function(ev, newValue, oldValue){
			equal(newValue, 2, "got new value event");
			equal(oldValue, 3, "got old value event");
		});
		
		
		p.attr("page",2);
		
		equal( p.attr("page"), 2, "page set right" );
		
		equal( p.attr("offset"), 10, "page offset set");
		
		
	});
	
});