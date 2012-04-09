module("can/model", { 
	setup: function() {

	}
})

var isDojo = (typeof dojo !== "undefined");

test("CRUD", function(){
    
	
	return;
	new Person({foo: "bar"}).save(function(inst, attrs, create){
		equals(create, "create")
		equals("bar", inst.foo)
		equals("zed", inst.zoo)
		ok(inst.save, "has save function");
		person = inst;
	});
    person.update({zoo: "monkey"},function(inst, attrs, update){
		equals(inst, person, "we get back the same instance");
		equals(person.zoo, "monkeys", "updated to monkeys zoo!  This tests that you callback with the attrs")
	})
});

test("findAll deferred", function(){
	can.Model("Person",{
		findAll : function(params, success, error){
			var self= this;
			return can.ajax({
				url : "/people",
				data : params,
				fixture: "//can/model/test/people.json",
				dataType : "json"
			}).pipe(function(data){
				return self.models(data);
			});
		}
	},{});
	stop();
	var people = Person.findAll({});
	people.then(function(people){
		equals(people.length, 1, "we got a person back");
		equals(people[0].name, "Justin", "Got a name back");
		equals(people[0].constructor.shortName, "Person", "got a class back");
		start();
	})
});

test("findOne deferred", function(){
	if(window.jQuery){
		can.Model("Person",{
			findOne : function(params, success, error){
				var self = this;
				return can.ajax({
					url : "/people/5",
					data : params,
					fixture: "//can/model/test/person.json",
					dataType : "json"
				}).pipe(function(data){
					return self.model(data);
				});
			}
		},{});
	} else {
		can.Model("Person",{
			findOne : steal.root.join("can/model/test/person.json")+''
		},{});
	}
	stop();
	var person = Person.findOne({});
	person.then(function(person){
		equals(person.name, "Justin", "Got a name back");
		equals(person.constructor.shortName, "Person", "got a class back");
		start();
	})
});

test("save deferred", function(){
	
	can.Model("Person",{
		create : function(attrs, success, error){
			return can.ajax({
				url : "/people",
				data : attrs,
				type : 'post',
				dataType : "json",
				fixture: function(){
					return [{id: 5}]
				},
				success : success
			})
		}
	},{});
	
	var person = new Person({name: "Justin"}),
		personD = person.save();
	
	stop();
	personD.then(function(person){
		start()
		equals(person.id, 5, "we got an id")
		
	});
	
});

test("update deferred", function(){
	
	can.Model("Person",{
		update : function(id, attrs, success, error){
			return can.ajax({
				url : "/people/"+id,
				data : attrs,
				type : 'post',
				dataType : "json",
				fixture: function(){
					return [{thing: "er"}]
				},
				success : success
			})
		}
	},{});
	
	var person = new Person({name: "Justin", id:5}),
		personD = person.save();
	
	stop();
	personD.then(function(person){
		start()
		equals(person.thing, "er", "we got updated")
		
	});
	
});

test("destroy deferred", function(){
	
	can.Model("Person",{
		destroy : function(id, success, error){
			return can.ajax({
				url : "/people/"+id,
				type : 'post',
				dataType : "json",
				fixture: function(){
					return [{thing: "er"}]
				},
				success : success
			})
		}
	},{});
	
	var person = new Person({name: "Justin", id:5}),
		personD = person.destroy();
	
	stop();
	personD.then(function(person){
		start()
		equals(person.thing, "er", "we got destroyed")
		
	});
});




test("models", function(){
	can.Model("Person",{
		prettyName : function(){
			return "Mr. "+this.name;
		}
	})
	var people = Person.models([
		{id: 1, name: "Justin"}
	])
	equals(people[0].prettyName(),"Mr. Justin","wraps wrapping works")
});

test(".models with custom id", function() {
	can.Model("CustomId", {
		findAll : steal.root.join("can/model/test") + "/customids.json",
		id : '_id'
	}, {
		getName : function() {
			return this.name;
		}
	});
	stop();
	CustomId.findAll().done(function(results) {
		equals(results.length, 2, 'Got two items back');
		equals(results[0].name, 'Justin', 'First name right');
		equals(results[1].name, 'Brian', 'Second name right');
		start();
	});
});


/*
test("async setters", function(){
	
	
	can.Model("Test.AsyncModel",{
		setName : function(newVal, success, error){
			
			
			setTimeout(function(){
				success(newVal)
			}, 100)
		}
	});
	
	var model = new Test.AsyncModel({
		name : "justin"
	});
	equals(model.name, "justin","property set right away")
	
	//makes model think it is no longer new
	model.id = 1;
	
	var count = 0;
	
	model.bind('name', function(ev, newName){
		equals(newName, "Brian",'new name');
		equals(++count, 1, "called once");
		ok(new Date() - now > 0, "time passed")
		start();
	})
	var now = new Date();
	model.attr('name',"Brian");
	stop();
})*/

test("binding", 2,function(){
	can.Model('Person')
	var inst = new Person({foo: "bar"});
	
	inst.bind("foo", function(ev, val){
		ok(true,"updated")	
		equals(val, "baz", "values match")
	});
	
	inst.attr("foo","baz");
	
});



test("auto methods",function(){
	//turn off fixtures
	can.fixture.on = false;
	var School = can.Model.extend("Jquery.Model.Models.School",{
	   findAll : steal.root.join("can/model/test")+"/{type}.json",
	   findOne : steal.root.join("can/model/test")+"/{id}.json",
	   create : steal.root.join("can/model/test")+"/create.json",
	   update : "POST "+steal.root.join("can/model/test")+"/update{id}.json"
	},{})
	stop();
	School.findAll({type:"schools"}, function(schools){
		ok(schools,"findAll Got some data back");
		equals(schools[0].constructor.shortName,"School","there are schools")
		
		School.findOne({id : "4"}, function(school){
			ok(school,"findOne Got some data back");
			equals(school.constructor.shortName,"School","a single school");
			
			
			new School({name: "Highland"}).save(function(school){
				
				equals(school.name,"Highland","create gets the right name")
				
				school.attr({name: "LHS"}).save( function(){
					start();
					equals(school.name,"LHS","create gets the right name")
					
					can.fixture.on = true;
				})
			})
			
		})
		
	})
})

test("isNew", function(){
	var p = new Person();
	ok(p.isNew(), "nothing provided is new");
	var p2 = new Person({id: null})
	ok(p2.isNew(), "null id is new");
	var p3 = new Person({id: 0})
	ok(!p3.isNew(), "0 is not new");
});
test("findAll string", function(){
	can.fixture.on = false;
	can.Model("Test.Thing",{
		findAll : steal.root.join("can/model/test/findAll.json")+''
	},{});
	stop();
	Test.Thing.findAll({},function(things){
		equals(things.length, 1, "got an array");
		equals(things[0].id, 1, "an array of things");
		start();
		can.fixture.on = true;
	})
})
/*
test("Empty uses fixtures", function(){
	ok(false, "Figure out")
	return;
	can.Model("Test.Things");
	$.fixture.make("thing", 10, function(i){
		return {
			id: i
		}
	});
	stop();
	Test.Thing.findAll({}, function(things){
		start();
		equals(things.length, 10,"got 10 things")
	})
});*/

test("Model events" , function(){

	var order = 0;
	can.Model("Test.Event",{
		create : function(attrs){
			var def = isDojo ? new dojo.Deferred() : new can.Deferred();
			def.resolve({id: 1})
			return def;
		},
		update : function(id, attrs, success){
			var def = isDojo ? new dojo.Deferred() : new can.Deferred();
			def.resolve(attrs)
			return def;
		},
		destroy : function(id, success){
			var def = isDojo ? new dojo.Deferred() : new can.Deferred();
			def.resolve({})
			return def;
		}
	},{});
	
	stop();
	Test.Event.bind('created',function(ev, passedItem){
		
		ok(this === Test.Event, "got model")
		ok(passedItem === item, "got instance")
		equals(++order, 1, "order");
		passedItem.save();
		
	}).bind('updated', function(ev, passedItem){
		equals(++order, 2, "order");
		ok(this === Test.Event, "got model")
		ok(passedItem === item, "got instance")
		
		passedItem.destroy();
		
	}).bind('destroyed', function(ev, passedItem){
		equals(++order, 3, "order");
		ok(this === Test.Event, "got model")
		ok(passedItem === item, "got instance")
		
		start();
		
	})
	
	var item = new Test.Event();
	item.save();
	
});





test("removeAttr test", function(){
	can.Model("Person");
	var person = new Person({foo: "bar"})
	equals(person.foo, "bar", "property set");
	person.removeAttr('foo')
	
	equals(person.foo, undefined, "property removed");
	var attrs = person.attr()
	equals(attrs.foo, undefined, "attrs removed");
});



test("save error args", function(){
	var Foo = can.Model('Testin.Models.Foo',{
		create : "/testinmodelsfoos.json"
	},{
		
	})
	var st = '{type: "unauthorized"}';
	
	can.fixture("/testinmodelsfoos.json", function(){
		return [401,st]
	});
	stop();
	var inst = new Foo({}).save(function(){
		ok(false, "success should not be called")
		start()
	}, function(jQXHR){
		ok(true, "error called")
		ok(jQXHR.getResponseHeader,"jQXHR object")
		start()
	})
	
	
	
});

test("object definitions", function(){
	
	can.Model('ObjectDef',{
		findAll : {
			url : "/test/place"
		},
		findOne : {
			url : "/objectdef/{id}",
			timeout : 1000
		},
		create : {
			
		},
		update : {
			
		},
		destroy : {
			
		}
	},{})
	
	can.fixture("GET /objectdef/{id}", function(original){
		equals(original.timeout,1000,"timeout set");
		return {yes: true}
	});
	stop();
	ObjectDef.findOne({id: 5}, function(){
		start();
	})
})



test('aborting create update and destroy', function(){
	stop();
	var delay = can.fixture.delay;
	can.fixture.delay = 1000;
	
	can.fixture("POST /abort", function(){
		ok(false, "we should not be calling the fixture");
		return {};
	})
	
	can.Model('Abortion',{
		create : "POST /abort",
		update : "POST /abort",
		destroy: "POST /abort"
	},{});
	
	var deferred = new Abortion({name: "foo"}).save(function(){
		ok(false, "success create")
	}, function(){
		ok(true, "create error called");
		
		
		deferred = new Abortion({name: "foo",id: 5})
			.save(function(){},function(){
				ok(true, "error called in update")
				
				deferred = new Abortion({name: "foo",id: 5}).destroy(function(){},
					function(){
						ok(true,"destroy error called")
						can.fixture.delay = delay;
						start();
					})
				
				setTimeout(function(){
					deferred.abort();
				},10)
				
			})
		
		setTimeout(function(){
		deferred.abort();
	},10)
	});
	setTimeout(function(){
		deferred.abort();
	},10)
	
	
});

test("store binding", function(){
	
	can.Model("Storage");
	
	var s = new Storage({
		id: 1,
		thing : {foo: "bar"}
	});
	ok(!Storage.store[1],"not stored");
	var func = function(){};
	s.bind("foo",func)	;
	
	ok(Storage.store[1], "stored");
	
	s.unbind("foo", func);
	
	ok(!Storage.store[1],"not stored");
	
	var s2 = new Storage({});
	
	s2.bind("foo",func)	;
	
	s2.attr('id',5)
	
	ok(Storage.store[5], "stored");
	
	s2.unbind("foo", func);
	ok(!Storage.store[5],"not stored");
	
})

test("store ajax binding", function(){
	var Guy = can.Model({
		findAll : "/guys",
		findOne : "/guy/{id}"
	},{});
	
	can.fixture("GET /guys", function(){
		return [[{id: 1}]]
	})
	can.fixture("GET /guy/{id}", function(){
		return {id: 1}
	});
	stop();
	can.when( Guy.findOne({id: 1}),
		Guy.findAll()).then(function(guyRes, guysRes){
		
		equals(guyRes[0].id,1, "got a guy id 1 back");
		equals(guysRes[0][0].id, 1, "got guys w/ id 1 back")
		ok(guyRes[0] === guysRes[0][0], "guys are the same");
		// check the store is empty
		setTimeout(function(){
			start();
			for(var id in Guy.store){
				ok(false, "there should be nothing in the store")
			}
		},1)  	
		
	});
	
})
