(function() {

module("can/observe/attributes");

test("literal converters and serializes", function(){
	can.Observe("Task1",{
		attributes: {
			createdAt: "date"
		},
		convert: {
			date: function(d){
				var months = ["jan", "feb", "mar"]
				return months[d.getMonth()]
			}
		},
		serialize: {
			date: function(d){
				var months = {"jan":0, "feb":1, "mar":2}
				return months[d]
			}
		}
	},{});
	can.Observe("Task2",{
		attributes: {
			createdAt: "date"
		},
		convert: {
			date: function(d){
				var months = ["apr", "may", "jun"]
				return months[d.getMonth()]
			}
		},
		serialize: {
			date: function(d){
				var months = {"apr":0, "may":1, "jun":2}
				return months[d]
			}
		}
	},{});
	var d = new Date();
	d.setMonth(1, 1)
	var task1=new Task1({
		createdAt: d,
		name:"Task1"
	});
	d.setMonth(2, 1)
	var task2=new Task2({
		createdAt: d,
		name:"Task2"
	});
	equal(task1.createdAt, "feb", "Task1 model convert");
	equal(task2.createdAt, "jun", "Task2 model convert");
	equal(task1.serialize().createdAt, 1, "Task1 model serialize");
	equal(task2.serialize().createdAt, 2, "Task2 model serialize");
	equal(task1.serialize().name, "Task1", "Task1 model default serialized");
	equal(task2.serialize().name, "Task2", "Task2 model default serialized");
});

var makeClasses= function(){
	can.Observe("AttrTest.Person", {
		serialize: function() {
			return "My name is " + this.name;
		}
	});
	can.Observe("AttrTest.Loan");
	can.Observe("AttrTest.Issue");
	
	AttrTest.Person.model = function(data){
		return new this(data);
	}
	AttrTest.Loan.models = function(data){
		return can.map(data, function(l){
			return new AttrTest.Loan(l)
		});
	}
	AttrTest.Issue.models = function(data){
		return can.map(data, function(l){
			return new AttrTest.Issue(l)
		});
	}
	can.Observe("AttrTest.Customer",
	{
		attributes : {
			person : "AttrTest.Person.model",
			loans : "AttrTest.Loan.models",
			issues : "AttrTest.Issue.models"
		}			
	},
	{});
}


test("default converters", function(){
	var num = 1318541064012;
	equal( can.Observe.convert.date(num).getTime(), num, "converted to a date with a number" );

	var str = "Dec 25, 1995";
	ok( can.Observe.convert.date(str) instanceof Date, "converted to a date with a string" );
})

test("basic observe associations", function(){
	makeClasses();
	
	var c = new AttrTest.Customer({
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
	});
	
	equal(c.person.name, "Justin", "association present");
	
	equal(c.person.constructor, AttrTest.Person, "belongs to association typed");
	
	equal(c.issues.length, 0);
	
	equal(c.loans.length, 2);
	
	equal(c.loans[0].constructor, AttrTest.Loan);
	
	
});

test("single seralize w/ attr name", function(){
	var Breakfast = can.Observe({
		attributes: {
			time: "date",
			name: 'default'
		},
		serialize: {
			date: function(d){
				return d.getTime();
			}
		}
	},{});
	
	var time = new Date();
	var b = new Breakfast({
		time: time,
		name: 'eggs'
	});
	
	equal(b.serialize('time'), time.getTime());
	ok(b.serialize())
});

test("defaults", function(){
	var Zelda = can.Observe({
		defaults: {
			sword: 'Wooden Sword',
			shield: false,
			hearts: 3,
			rupees: 0
		}
	},{});
	
	var link = new Zelda({
		rupees: 255
	});
	
	equal(link.attr('sword'), 'Wooden Sword');
	equal(link.attr('rupees'), 255);
});

test("nested model attr", function(){
	can.Model('NestedAttrTest.User', {}, {});

	can.Model('NestedAttrTest.Task', {
			attributes : {
				owner : "NestedAttrTest.User.model"
			}
		}, {});


	can.Model('NestedAttrTest.Project',{
			attributes : {
				creator : "NestedAttrTest.User.model"
			}
		}, {});

		var michael = NestedAttrTest.User.model({ id : 17, name : 'Michael'});
		var amy = NestedAttrTest.User.model({ id : 29, name : 'Amy'});

		// add bindings so the objects get stored in the User.store
		michael.bind('foo', function(){});
		amy.bind('foo', function(){});

		var task = NestedAttrTest.Task.model({
			id : 1,
			name : "Do it!",
			owner : {id : 17}
		});

		var project = NestedAttrTest.Project.model({
			id : 1,
			name : "Get Things Done",
			creator : {id : 17}
		});

		task.bind('foo', function(){});
		project.bind('foo', function(){});

		equal(task.attr('owner.name'), 'Michael', 'owner hash correctly modeled');
		equal(project.attr('creator.name'), 'Michael', 'creator hash correctly modeled');

		task.attr({ owner : { id : 29, name : 'Amy'}});
		equal(task.attr('owner.name'), 'Amy', 'Task correctly updated to Amy user model');
		equal(task.attr('owner.id'), 29, 'Task correctly updated to Amy user model');

		equal(project.attr('creator.name'), 'Michael', 'Project creator should still be Michael');
		equal(project.attr('creator.id'), 17, 'Project creator should still be Michael');
		equal(NestedAttrTest.User.store[17].id, 17, "The model store should still have Michael associated by his id");
});

test("attr() should respect convert functions for lists when updating", function(){
	can.Model('ListTest.User', {}, {});
	can.Model.List('ListTest.User.List', {}, {});

	can.Model('ListTest.Task', {
		attributes : {
			project : "ListTest.Project.model"
		}
	}, {});

	can.Model('ListTest.Project',{
			attributes : {
				members : "ListTest.User.models"
			}
		}, {});

		var task = ListTest.Task.model({
			id : 1,
			name : "Do it!",
			project : {
				id : 789,
				name : "Get stuff done",
				members : []
			}
		});

		equal(task.project.members instanceof ListTest.User.List, true, "the list is a User List");

		task.attr({
			id : 1,
			project : {
				id : 789,
				members: [{ id : 72, name : "Andy"}, { id : 74, name : "Michael"}]
			}
		});

		equal(task.project.members instanceof ListTest.User.List, true, "the list is a User List");
		equal(task.project.members.length, 2, "The members were added");
		equal(task.project.members[0] instanceof ListTest.User, true, "The members was converted to a model object");
		equal(task.project.members[1] instanceof ListTest.User, true, "The user was converted to a model object");
});

test("plugin passes old value to converter", 2, function() {
	var Ob = can.Observe('AttrOldVal', {
		oldVal : function(val, oldVal) {
			if(val === 'first') {
				ok(!oldVal, 'First time does not have an old value');
			}
			if(val === 'second') {
				equal(oldVal, 'first', 'Old value is correct');
			}
			return val;
		},
		attributes : {
			test : 'AttrOldVal.oldVal'
		}
	}, {});

	var o = new Ob({
		test : 'first'
	});

	o.attr('test', 'second');
});

test("attr does not blow away old observable when going from empty to having items (#160)", function(){
	can.Model('EmptyListTest.User', {}, {});
	can.Model.List('EmptyListTest.User.List', {}, {});

	can.Model('EmptyListTest.Project',{
		attributes : {
			members : "EmptyListTest.User.models"
		}
	}, {});

	var project = EmptyListTest.Project.model({
		id : 789,
		members : []
	});

	var oldCid = project.attr("members")._cid;
	project.attr({members:[{id: 1, name: "bob"}]});
	deepEqual(project.attr("members")._cid, oldCid, "should be the same observe, so that views bound to the old one get updates")
	equal(project.attr("members").length, 1, "list should have bob in it");
});

test("Default converters and boolean fix (#247)", function() {
	var MyObserve = can.Observe({
			attributes: {
				enabled: 'boolean',
				time: 'date',
				age: 'number'
			}
		}, {}),
		obs = new MyObserve({
			enabled: 'false',
			time: 1358980553275,
			age: '26'
		});

	deepEqual(obs.attr('enabled'), false, "Attribute got converted to boolean false");
	obs.attr('enabled', 'true');
	deepEqual(obs.attr('enabled'), true, "Attribute got converted to boolean true");

	obs.attr('enabled', '0');
	deepEqual(obs.attr('enabled'), false, "Attribute got converted to boolean false");
	obs.attr('enabled', '1');
	deepEqual(obs.attr('enabled'), true, "Attribute got converted to boolean true");

	deepEqual(obs.attr('age'), 26, "Age converted from string to number");
	// It's ok to just check if it got converted to a date
	ok(obs.attr('time') instanceof Date, "Attribute is a date");
});

test("Nested converters called twice (#174)", function(){
		OtherThing = can.Model({
				attributes: {
						score: 'capacity'
				},
				convert: {
						capacity: function(val) {
								return val * 10;
						}
				}
		}, {});
		
		Thing = can.Model({
				attributes: {
						otherThing: 'OtherThing.model'
				},
				
				findOne : 'GET /things/{id}'
		}, {});
	var t = new Thing({
			"name": "My Thing",
			"otherThing": {
					"score": 1
			},
			"id": "ALLCACHES"
	})
	t.attr({
			"otherThing": {
					"score": 2
			},
			"id": "ALLCACHES"
	})

	equal(t.attr("otherThing.score"), 20, "converter called correctly")

})

// tests that the workaround listed in #208 works with the correct call signature and data
test("Nested converters called with merged data", function(){
	var MyObserve = can.Observe({
			attributes: {
					nested: "nested"
			},
			convert: {
			nested: function(data, oldVal) {
				if(oldVal instanceof MyObserve) {
					return oldVal.attr(data);
				}
				return new MyObserve(data);
			}
			}
	},{});

	var obs = new MyObserve({
			nested: {
					name: "foo",
					count: 1
			}
	});
	var nested = obs.attr("nested");
	obs.attr({
			nested: {
					count: 2
			}
	});
	ok(nested === obs.attr("nested"), "same object");
})

test("Recursive attributes", function() {
		
		var Player = can.Model({
				attributes: {
						team: 'Team.model'
				},
				findAll: "GET /players",
				destroy: "DELETE /players/{id}"
		}, {
		});
		
		var Team = can.Model({
				attributes: {
						players: 'Player.models'
				},
				findAll: "GET /teams",
				destroy: "DELETE /teams/{id}"
		}, {
		});
		
		var PLAYERS = [
		{
			"id": 1,
			"name": "Ryan Braun",
			"number": 8,
			"team": {
				"id": 25,
				"name": "Brewers",
				"players": [
					{
						"id": 1,
						"name": "Ryan Braun",
						"number": 8
					},
					{
						"id": 2,
						"name": "Yovani Gallardo",
						"number": 55
					},
					{
						"id": 3,
						"name": "Jean Segura",
						"number": 12
					}
				]
			}
		},
		{
			"id": 2,
			"name": "Yovani Gallardo",
			"number": 55,
			"team": {
				"id": 25,
				"name": "Brewers",
				"players": [
					{
						"id": 1,
						"name": "Ryan Braun",
						"number": 8
					},
					{
						"id": 2,
						"name": "Yovani Gallardo",
						"number": 55
					},
					{
						"id": 3,
						"name": "Jean Segura",
						"number": 12
					}
				]
			}
		},
		{
			"id": 3,
			"name": "Jean Segura",
			"number": 12,
			"team": {
				"id": 25,
				"name": "Brewers",
				"players": [
					{
						"id": 1,
						"name": "Ryan Braun",
						"number": 8
					},
					{
						"id": 2,
						"name": "Yovani Gallardo",
						"number": 55
					},
					{
						"id": 3,
						"name": "Jean Segura",
						"number": 12
					}
				]
			}
		}
	]
		
	can.fixture('GET /players', function() { 
		return PLAYERS;
	});
	can.fixture('DELETE /players/{id}', function(req) {
		var id = req && req.data && req.data.id;
		if (id !== undefined) {
			for (var i = 0, player; player = PLAYERS[i]; i++) {
				if (player.id == id) {
					PLAYERS.splice(i, 1);
					return id;
				}
			}
		}
		return false;
	});
	
	stop();
	can.when(Player.findAll()).then(function(players) {
		equal(players.length, 3, 'Players loaded');
		can.when(players[2].destroy()).then(function(g) {
			can.when(Player.findAll()).then(function(players) {
				equal(players.length, 2, 'One player destroyed');
				start();
			});
		});
	});

})

})();
