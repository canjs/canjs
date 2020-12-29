require("./matches-test");
require("./store-test");

var QUnit = require('steal-qunit');
var fixture = require("can-fixture");
var set = require("can-set-legacy");
var $ = require("jquery");
var canDev = require('can-log/dev/dev');
var dataFromUrl = require("../data-from-url");
var canReflect = require("can-reflect");
var matches = require("../matches");
var QueryLogic = require("can-query-logic");
var testHelpers = require("can-test-helpers");
var DefineMap = require("can-define/map/map");


var errorCallback = function(xhr, status, error){
	assert.ok(false, error);
	done();
};

var parseHeaders = function(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = line.slice(index + 1).replace(/(^\s*|\s*$)/g, '');
    fields[field] = val;
  }

  return fields;
}

QUnit.module('can-fixture');

if (__dirname !== '/') {
	QUnit.test('static fixtures', function(assert) {
		var done = assert.async();
		fixture('GET something', __dirname+'/fixtures/test.json');
		fixture('POST something', __dirname+'/fixtures/test.json');
		fixture('PATCH something', __dirname+'/fixtures/test.json');

		$.ajax({
			url: 'something',
			dataType: 'json'
		})
			.then(function (data) {
				assert.equal(data.sweet, 'ness', 'can.get works');
				$.ajax({
					url: 'something',
					method: 'POST',
					dataType: 'json'
				})
					.then(function (data) {
						assert.equal(data.sweet, 'ness', 'can.post works');
							$.ajax({
						url: 'something',
						method: 'PATCH',
						dataType: 'json'
					})
						.then(function (data) {
							assert.equal(data.sweet, 'ness', 'can.patch works');
							done();
						},errorCallback);
					},errorCallback);
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	QUnit.test('static fixtures (using method signature)', function(assert) {
		var done = assert.async();
		fixture({method: 'get', url: 'method/{id}'}, __dirname+'/fixtures/method.{id}.json');
		$.ajax({
			url: 'method/4',
			dataType: 'json'
		})
			.then(function (data) {
				assert.equal(data.id, 4, 'Got data with proper id using method');
				done();
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	QUnit.test('static fixtures (using type signature)', function(assert) {
		var done = assert.async();
		fixture({type: 'get', url: 'type/{id}'}, __dirname+'/fixtures/type.{id}.json');
		$.ajax({
			url: 'type/4',
			dataType: 'json'
		})
			.then(function (data) {
				assert.equal(data.id, 4, 'Got data with proper id using type');
				done();
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	QUnit.test('templated static fixtures', function(assert) {
		var done = assert.async();
		fixture('GET some/{id}', __dirname+'/fixtures/stuff.{id}.json');
		$.ajax({
			url: 'some/3',
			dataType: 'json'
		})
			.then(function (data) {
				assert.equal(data.id, 3, 'Got data with proper id');
				done();
			}, errorCallback);
	});
}

QUnit.test('dynamic fixtures', function(assert) {
	var done = assert.async();
	fixture.delay = 10;
	fixture('something', function () {
		return [{
			sweet: 'ness'
		}];
	});
	$.ajax({
		url: 'something',
		dataType: 'json'
	})
		.done(function (data) {
			assert.equal(data[0].sweet, 'ness', 'can.get works');
			done();
		});
});

QUnit.test('dynamic fixtures return promises', function(assert) {
	var done = assert.async();
	fixture.delay = 10;
	fixture('something', function () {
		return Promise.resolve([{
			sweet: 'ness'
		}]);
	});

	$.ajax({
		url: 'something',
		dataType: 'json'
	}).then(function (data) {
		assert.equal(data[0].sweet, 'ness', 'can.get works');
		done();
	});
});

if (__dirname !== '/') {
	QUnit.test('fixture function', function(assert) {
		assert.expect(3);
		var done = assert.async();
		var url = __dirname+'/fixtures/foo.json';
		fixture(url, __dirname+'/fixtures/foobar.json');
		$.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (data) {
				assert.equal(data.sweet, 'ner', 'url passed works');
				fixture(url, __dirname+'/fixtures/test.json');
				$.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (data) {
						assert.equal(data.sweet, 'ness', 'replaced');
						fixture(url, null);
						$.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (data) {
								assert.equal(data.a, 'b', 'removed');
								done();
							});
					});
			});
	});
}

QUnit.test('fixture.store fixtures', function(assert) {
	var done = assert.async();

	var SearchText = matches.makeComparatorType(function(searchTextValue, dataSearchTextValue, data, path){
		var regex = new RegExp('^' + searchTextValue);
		return regex.test(data.name);
	});


	var algebra = new set.Algebra({
		schema: function(schema) {

			schema.keys.searchText = SearchText;
		}
	},
		set.props.offsetLimit("offset","limit"),
		set.props.sort("order"));


	var store = fixture.store(1000, function (i) {
		return {
			id: i,
			name: 'thing ' + i
		};
	}, algebra);
	fixture('things', store.getListData);

	$.ajax({
		url: 'things',
		dataType: 'json',
		data: {
			offset: 100,
			limit: 200,
			order: 'name ASC',
			searchText: 'thing 2'
		},
		success: function (things) {
			assert.equal(things.data[0].name, 'thing 29', 'first item is correct');
			assert.equal(things.data.length, 11, 'there are 11 items');
			done();
		}
	});
});

QUnit.test('fixture.store fixtures should have unique IDs', function(assert) {
	var done = assert.async();
	var store = fixture.store(100, function (i) {
		return {name: 'Test ' + i};
	});
	fixture('things', store.getListData);

	$.ajax({
		url: 'things',
		dataType: 'json',
		data: {
			page: {start: 0, end: 199},
			order: 'name ASC'
		},
		success: function (result) {
			var seenIds = [];
			var things = result.data;
			for (var thingKey in things) {
				var thing = things[thingKey];
				assert.ok(seenIds.indexOf(thing.id) === -1);
				seenIds.push(thing.id);
			}
			done();
		}
	});
});

QUnit.test('fixture.store should assign unique IDs when fixtures provide IDs', function(assert) {
	/* NOTE: We are testing whether the unique ID we are assigning to a new
	         item will account for IDs which the user has provided.
	*/

	/* NOTE: These integers are used because IDs are created sequentially from 0.
	         Here, 0 1 and 2 must be skipped because they exist already.
	         If the implementation is changed this test will need updated.
	*/
	var store = fixture.store([
		{id: 0, name: 'Object 0'},
		{id: 1, name: 'Object 1'},
		{id: 2, name: 'Object 2'}
	]);

	fixture('POST /models', store.createData);

	function then (ajax, callback) {
		ajax.then(callback, function (error) {
			assert.ok(false, 'ajax failure: ' + error);
			done();
		});
	}

	var request = $.ajax({
		url: '/models',
		dataType: 'json',
		type: 'post',
		data: {
			name: 'My test object'
		}
	});

	var done = assert.async();
	then(request, function (response) {
		assert.notEqual(response.id, 0);
		assert.notEqual(response.id, 1);
		assert.notEqual(response.id, 2);

		/* NOTE: This check will fail if the underlying implementation changes.
		         This 3 is tightly coupled to the implementation.
		         If this is the only breaking assertion, update the provided IDs to
		         properly test the edge-case and update these assertions.
		         This check only serves to notify you to update the checks.
		*/
		assert.equal(response.id, 3);

		done();
	});
});

QUnit.test('simulating an error', function(assert) {

	fixture('/foo', function (request, response) {
		return response(401, {type: "unauthorized"});
	});
	var done = assert.async();
	$.ajax({
		url: '/foo',
		dataType: 'json'
	})
		.done(function () {
			assert.ok(false, 'success called');
			done();
		})
		.fail(function (original, type) {
			assert.ok(true, 'error called');
			assert.deepEqual(JSON.parse(original.responseText), {type: "unauthorized"}, 'Original text passed');
			done();
		});
});

QUnit.test('rand', function(assert) {
	var rand = fixture.rand;
	var num = rand(3);
	assert.equal(typeof num, 'number');
	var matched = {};
	// this could ocassionally fail.
	for(var i = 0; i < 100; i++) {
		num = rand(3);
		matched[num] = true;
	}
	for(i = 0; i <= 3; i++) {
		assert.ok(matched[i], "has "+i);
	}

	matched = {};
	var result,
		choices = ["a","b","c"];

	// makes sure we have the right length arrays and
	// every item can be first
	for(i = 0; i < 100; i++) {
		result = rand(choices);
		matched[result.length] = true;
		matched[result[0]] = true;
	}

	for(i = 1; i <= 3; i++) {
		assert.ok(matched[i], "has "+i);
		delete matched[i];
	}

	choices.forEach(function(choice){
		assert.ok(matched[choice], "has "+choice);
		delete matched[choice];
	});

	assert.ok(canReflect.size(matched) === 0, "nothing else unexpected");
});

QUnit.test('dataFromUrl', function(assert) {
	var data = dataFromUrl('/thingers/{id}', '/thingers/5');
	assert.equal(data.id, 5, 'gets data');
	data = dataFromUrl('/thingers/5?hi.there', '/thingers/5?hi.there');
	assert.deepEqual(data, {}, 'gets data');
});

QUnit.test('core.dataFromUrl with double character value', function(assert) {
	var data = dataFromUrl('/days/{id}/time_slots.json', '/days/17/time_slots.json');
	assert.equal(data.id, 17, 'gets data');
});



QUnit.test('fixture function gets id', function(assert) {
	fixture('/thingers/{id}', function (settings) {
		return {
			id: settings.data.id,
			name: 'justin'
		};
	});
	var done = assert.async();
	$.ajax({
		url: '/thingers/5',
		dataType: 'json',
		data: {
			id: 5
		}
	})
		.done(function (data) {
			assert.ok(data.id);
			done();
		});
});

if (__dirname !== '/') {
	QUnit.test('replacing and removing a fixture', function(assert) {
		var url = __dirname+'/fixtures/remove.json';
		fixture('GET ' + url, function () {
			return {
				weird: 'ness!'
			};
		});
		var done = assert.async();
		$.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (json) {
				assert.equal(json.weird, 'ness!', 'fixture set right');
				fixture('GET ' + url, function () {
					return {
						weird: 'ness?'
					};
				});
				$.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (json) {
						assert.equal(json.weird, 'ness?', 'fixture set right');
						fixture('GET ' + url, null);
						$.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (json) {
								assert.equal(json.weird, 'ness', 'fixture set right');
								done();
							});
					});
			});
	});
}

QUnit.test('fixture.store with can.Model', function(assert) {
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	})/*,
		Model = can.Model.extend({
			findAll: 'GET /models',
			findOne: 'GET /models/{id}',
			create: 'POST /models',
			update: 'PUT /models/{id}',
			destroy: 'DELETE /models/{id}'
		}, {})*/;

	fixture('GET /models', store.getListData);
	fixture('GET /models/{id}', store.getData);
	fixture('POST /models', store.createData);
	fixture('PUT /models/{id}', store.updateData);
	fixture('DELETE /models/{id}', store.destroyData);

	var done = assert.async();
	function errorAndStart(e){
		assert.ok(false, "borked"+e);
		done();
	}


	var check100Updated = function(){
		return $.ajax({
			url: "/models/100",
			dataType: 'json'
		}).then(function(model){
			assert.equal(model.name, 'Updated test object', 'Successfully updated object');
		});
	};


	$.ajax({
		url: "/models",
		dataType: 'json'
	}).then(function (modelsData) {
		var models = modelsData.data;

		assert.equal(models.length, 100, 'Got 100 models for findAll with no parameters');
		assert.equal(models[95].name, 'Object 95', 'All models generated properly');
		return $.ajax({
				url: "/models/51",
				dataType: 'json'
			})
			.then(function (data) {
				assert.equal(data.id, 51, 'Got correct object id');
				assert.equal('Object 51', data.name, 'Object name generated correctly');
				return $.ajax({
						url: "/models",
						dataType: 'json',
						type: 'post',
						data: {
							name: 'My test object'
						}
					})
					.then(function (newmodel) {
						assert.equal(newmodel.id, 100, 'Id got incremented');
						// Tests creating, deleting, updating
						return $.ajax({
								url: "/models/100",
								dataType: 'json'
							})
							.then(function (model) {
								assert.equal(model.id, 100, 'Loaded new object');
								return $.ajax({
										url: "/models/100",
										dataType: 'json',
										type: 'put',
										data: {
											name: 'Updated test object'
										}
									})
									.then(function (model) {

										return check100Updated().then(function(){

											return $.ajax({
													url: "/models/100",
													dataType: 'json',
													type: 'delete'
												})
												.then(function (deleted) {
													done();
												},errorAndStart);

										}, errorAndStart);

									},errorAndStart);
							},errorAndStart);
					},errorAndStart);
			},errorAndStart);
	}, errorAndStart);
});

QUnit.test('GET fixture.store returns 404 on findOne with bad id (#803)', function(assert) {
	var store = fixture.store(2, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	fixture('GET /models/{id}', store.getData);
	var done = assert.async();

	$.ajax({url: "/models/3", dataType: "json"}).then(function(){},function (data) {
		assert.equal(data.status, 404, 'status');
		assert.equal(data.statusText, 'error', 'statusText');
		assert.equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
		done();
	});
});

// problem here is that memory cache is cool with these changes.  We need to do something different
// if instance isn't there.
QUnit.test('fixture.store returns 404 on update with a bad id (#803)', function(assert) {
	var store = fixture.store(5, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	var done = assert.async();
	fixture('POST /models/{id}', store.updateData);

	$.ajax({url: "/models/6", dataType: "json", data: {'jedan': 'dva'}, type: 'POST'})
		.then(function(){
			assert.ok(false, "success");
			done();
		},function (data) {
			assert.equal(data.status, 404, 'status');
			assert.equal(data.statusText, 'error', 'statusText');
			assert.equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
			done();
		});
});

QUnit.test('fixture.store returns 404 on destroy with a bad id (#803)', function(assert) {
	var store = fixture.store(2, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	var done = assert.async();

	fixture('DELETE /models/{id}', store.destroyData);

	$.ajax({url: "/models/6", dataType: "json", type: 'DELETE'})
		.then(function(){},function (data) {
			assert.equal(data.status, 404, 'status');
			assert.equal(data.statusText, 'error', 'statusText');
			assert.equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
			done();
		});
});

QUnit.test('fixture.store can use id of different type (#742)', function(assert) {

	var MustBeNumber = matches.makeComparatorType(function(queryVal, propVal){
		return parseInt(queryVal,10) === propVal;
	});

	var query = new QueryLogic({
		keys: {
			parentId: MustBeNumber
		}
	});

	var store = fixture.store(100, function (i) {
			return {
				id: i,
				parentId: i * 2,
				name: 'Object ' + i
			};
		}, query);
	fixture('GET /models', store.getListData);
	var done = assert.async();
	$.ajax({url: "/models", dataType: "json", data: { filter: {parentId: '4'} } })
		.then(function (models) {
			assert.equal(models.data.length, 1, 'Got one model');
			assert.deepEqual(models.data[0], { id: 2, parentId: 4, name: 'Object 2' });
			done();
		});
});

QUnit.test('fixture("METHOD /path", store) should use the right method', function(assert) {
	/*
		Examples:
			fixture("GET /path", store) => fixture("GET /path", store.getData)
			fixture("POST /path", store) => fixture("GET /path", store.createData)
	*/

	// NOTE: this is a copy-paste of the test case
	//       "fixture.store can use id of different type (#742)"
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});
	fixture('GET /models', store); // <- CHANGE
	var done = assert.async();
	$.ajax({url: "/models", dataType: "json"})
		.then(function (models) {
			assert.equal(models.data.length, 100, 'Gotta catch up all!');
			done();
		});
});

//!steal-remove-start
QUnit.test('fixture("METHOD /path", store) should warn when correcting to the right method', function (assert) {
	assert.expect(1);
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});
	var oldWarn = canDev.warn;
	canDev.warn = function (message) {
		assert.ok(typeof message === 'string');
	};
	fixture('GET /models', store); // <- CHANGE
	canDev.warn = oldWarn;
});
//!steal-remove-end

QUnit.test('fixture with response callback', function(assert) {
	assert.expect(4);
	fixture.delay = 10;
	fixture('responseCb', function (orig, response) {
		response({
			sweet: 'ness'
		});
	});
	fixture('responseErrorCb', function (orig, response) {
		response(404, 'This is an error from callback');
	});
	var done = assert.async();
	$.ajax({
		url: 'responseCb',
		dataType: 'json'
	})
		.done(function (data) {
			assert.equal(data.sweet, 'ness', 'can.get works');
			//done();
		});
	//var done = assert.async();
	$.ajax({
		url: 'responseErrorCb',
		dataType: 'json'
	})
		.fail(function (orig, error, text) {
			assert.equal(error, 'error', 'Got error status');
			assert.equal(orig.responseText, 'This is an error from callback', 'Got error text');
			//done();
		});
	//var done = assert.async();
	fixture('cbWithTimeout', function (orig, response) {
		setTimeout(function () {
			response([{
				epic: 'ness'
			}]);
		}, 10);
	});
	$.ajax({
		url: 'cbWithTimeout',
		dataType: 'json'
	})
		.done(function (data) {
			assert.equal(data[0].epic, 'ness', 'Got responsen with timeout');
			done();
		});
});

QUnit.test('store create works with an empty array of items', function(assert) {
	var store = fixture.store(0, function () {
		return {};
	});
	var done = assert.async();
	store.createData({
		data: {}
	}, function (responseData, responseHeaders) {
		assert.equal(responseData.id, 1, 'the first id is 1');
		done();
	});
});

QUnit.test('store creates sequential ids', function(assert) {
	var store = fixture.store(0, function () {
		return {};
	});
	var done = assert.async();

	store.createData({
		data: {}
	}, function (responseData, responseHeaders) {
		assert.equal(responseData.id, 1, 'the first id is 1');
		createSecond();
	})

	function createSecond(){
		store.createData({
			data: {}
		}, function (responseData, responseHeaders) {
			assert.equal(responseData.id, 2, 'the second id is 2');
			destroyFirst();
		});
	}
	function destroyFirst(){
		store.destroyData({
			data: {
				id: 1
			}
		}, createThird);
	}

	function createThird(){
		store.createData({
			data: {}
		}, function (responseData, responseHeaders) {
			assert.equal(responseData.id, 3, 'the third id is 3');
			done();
		});
	}





});

QUnit.test('fixture updates request.data with id', function(assert) {
	assert.expect(1);
	var done = assert.async();


	fixture('foo/{id}', function(request) {
		assert.equal(request.data.id, 5);
		done();
	});

	$.ajax({
		url: 'foo/5'
	});
});

QUnit.test("create a store with array and comparison object",function(assert) {

	var SoftEq = matches.makeComparatorType(function(a, b){
		/* jshint eqeqeq:false */
		return a == b;
	});


	var query = new QueryLogic({
		keys: {
			year: SoftEq,
			modelId: SoftEq
		}
	});

	var store = fixture.store([
		{id: 1, modelId: 1, year: 2013, name: "2013 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2012/07/01-2013-ford-mustang-gt-review-585x388.jpg"},
		{id: 2, modelId: 1, year: 2014, name: "2014 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2013/03/2014-roush-mustang.jpg"},
		{id: 2, modelId: 2, year: 2013, name: "2013 Focus", thumb: "http://images.newcars.com/images/car-pictures/original/2013-Ford-Focus-Sedan-S-4dr-Sedan-Exterior.png"},
		{id: 2, modelId: 2, year: 2014, name: "2014 Focus", thumb: "http://ipinvite.iperceptions.com/Invitations/survey705/images_V2/top4.jpg"},
		{id: 2, modelId: 3, year: 2013, name: "2013 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/04-2013-nissan-altima-1333416664.jpg"},
		{id: 2, modelId: 3, year: 2014, name: "2014 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2013, name: "2013 Leaf", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2014, name: "2014 Leaf", thumb: "http://images.thecarconnection.com/med/2013-nissan-leaf_100414473_m.jpg"}
	],query);


	fixture('GET /presetStore', store.getListData);
	var done = assert.async();
	$.ajax({ url: "/presetStore", method: "get", data: {filter: {year: 2013, modelId:1} }, dataType: "json" }).then(function(response){

		assert.equal(response.data[0].id, 1, "got the first item");
		assert.equal(response.data.length, 1, "only got one item");
		done();
	});

});

QUnit.test("posting an empty data object", function(assert) {
	var done = assert.async();

	fixture("/data", function(req, res) {
		if (req.data == null) {
			throw new Error("req.data should be an empty object");
		} else {
			return {};
		}
	});

	var def = $.ajax({
		method: "post",
		url: "/data",
		dataType: "json",
		data: {}
	});

	def.then(function() {
		assert.ok(true, "works!");
		done();
	}, function(e) {
		assert.notOk(e, "should not fail");
	});
});

QUnit.test("store with objects allows .create, .update and .destroy (#1471)", function(assert) {
	assert.expect(4);
	var store = fixture.store([
		{id: 1, modelId: 1, year: 2013, name: "2013 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2012/07/01-2013-ford-mustang-gt-review-585x388.jpg"},
		{id: 2, modelId: 1, year: 2014, name: "2014 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2013/03/2014-roush-mustang.jpg"},
		{id: 3, modelId: 2, year: 2013, name: "2013 Focus", thumb: "http://images.newcars.com/images/car-pictures/original/2013-Ford-Focus-Sedan-S-4dr-Sedan-Exterior.png"},
		{id: 4, modelId: 2, year: 2014, name: "2014 Focus", thumb: "http://ipinvite.iperceptions.com/Invitations/survey705/images_V2/top4.jpg"},
		{id: 5, modelId: 3, year: 2013, name: "2013 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/04-2013-nissan-altima-1333416664.jpg"},
		{id: 6, modelId: 3, year: 2014, name: "2014 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 7, modelId: 4, year: 2013, name: "2013 Leaf", thumb: "http://www.blogcdn.com/www.autoblog.com/media/201204/01-2013-nissan-altima-ny.jpg"},
		{id: 8, modelId: 4, year: 2014, name: "2014 Leaf", thumb: "http://images.thecarconnection.com/med/2013-nissan-leaf_100414473_m.jpg"}
	]);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{id}', store.updateData);
	fixture('DELETE /cars/{id}', store.destroyData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	var done = assert.async();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		assert.equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1].id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		assert.equal(carsData.data.length, 7, 'One car less');
		assert.equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved.id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		assert.equal(cars.data.length, 8, 'New car created');
		done();
	});
});


QUnit.test("filtering works", function(assert) {
	var next;
	var store = fixture.store(
		[	{ state : 'CA', name : 'Casadina' },
			{ state : 'NT', name : 'Alberny' }], new QueryLogic({
				identity: ["state"]
			}));

	fixture({
		'GET /api/cities' : store.getListData,
	});
	var done = assert.async();
	$.getJSON('/api/cities?filter[state]=CA').then(function(data){
		assert.deepEqual(data, {
			data: [{
				state : 'CA',
				name : 'Casadina'
			}],
			count: 1
		});
		done();
	}, function(e){
		assert.ok(false, ""+e);
		done();
	});
});

QUnit.test("filtering works with nested props", function(assert) {
	var done = assert.async();
	var store = fixture.store([{
		id : 1,
		name : 'Cheese City',
		slug : 'cheese-city',
		address : {
			city : 'Casadina',
			state : 'CA'
		}
	}, {
		id : 2,
		name : 'Crab Barn',
		slug : 'crab-barn',
		address : {
			city : 'Alberny',
			state : 'NT'
		}
	}]);

	fixture({
		'GET /restaurants' : store.getListData
	});
	$.getJSON('/api/restaurants?filter[address][city]=Alberny').then(function(responseData){

		assert.deepEqual(responseData, {
			count: 1,
			data: [{
				id : 2,
				name : 'Crab Barn',
				slug : 'crab-barn',
				address : {
					city : 'Alberny',
					state : 'NT'
				}
			}]
		});
		done();

	}, function(e){
		assert.ok(false);
		done();
	});
});

QUnit.test("filtering works with nested.props", function(assert) {
	var done = assert.async();

	var store =fixture.store([{
		id : 1,
		name : 'Cheese City',
		slug : 'cheese-city',
		address : {
			city : 'Casadina',
			state : 'CA'
		}
	}, {
		id : 2,
		name : 'Crab Barn',
		slug : 'crab-barn',
		address : {
			city : 'Alberny',
			state : 'NT'
		}
	}]);
	store.connection.getListData({filter: {"address.city": "Alberny"}})
		.then(function(responseData){
			assert.deepEqual(responseData, {
				count: 1,
				data: [{
					id : 2,
					name : 'Crab Barn',
					slug : 'crab-barn',
					address : {
						city : 'Alberny',
						state : 'NT'
					}
				}]
			});
			done();
		});


});


QUnit.test("onreadystatechange, event is passed", function(assert) {
	fixture("GET something", function(){
		return {};
	});

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "something");
	xhr.onreadystatechange = function(ev){
		assert.ok(ev.target != null, "the event object passed to onreadystatechange");
		done();
	};
	xhr.send();
	var done = assert.async();
});

if (__dirname !== '/') {
	QUnit.test("doesn't break onreadystatechange (#3)", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				assert.ok(true, "we made a successful request");
				ready();
			}
		};

        xhr.open('GET', url);
        xhr.send();
    });
}

QUnit.module("XHR Shim");

QUnit.test("Supports onload", function(assert) {
	var xhr = new XMLHttpRequest();
	assert.ok(("onload" in xhr), "shim passes onload detection");
});

if (__dirname !== '/') {
	QUnit.test("supports addEventListener on XHR shim", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function(){
			assert.ok(true, "our shim supports addEventListener");
			ready();
		});

        xhr.open('GET', url);
        xhr.send();
    });
}

if (__dirname !== '/') {
	QUnit.test("supports removeEventListener on XHR shim", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        var xhr = new XMLHttpRequest();

        var onload = function(){
			assert.ok(false, "this should not be called");
		};

        xhr.addEventListener('load', onload);
        xhr.removeEventListener("load", onload);

        xhr.onload = function(){
			setTimeout(function(){
				assert.ok(true, 'didn\'t call the event listener');
				ready();
			});
		};

        xhr.open('GET', url);
        xhr.send();
    });
}

QUnit.test("supports setDisableHeaderCheck", function(assert) {
	var xhr = new XMLHttpRequest();

	try {
		xhr.setDisableHeaderCheck(true);
		assert.ok(true, "did not throw");
	} catch(e) {
		assert.ok(false, "do not support setDisableHeaderCheck");
	}
});

if (__dirname !== '/') {
	QUnit.test("supports setRequestHeader", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        var xhr = new XMLHttpRequest();

        xhr.setRequestHeader("foo", "bar");

        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				assert.equal(xhr._requestHeaders.foo, "bar", "header was set");
				ready();
			}
		};

        xhr.open("GET", url);
        xhr.send();
    });
}

if (__dirname !== '/') {
	QUnit.test("supports getResponseHeader", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				var header = xhr.getResponseHeader("Content-Type");
				assert.ok(header.indexOf("application/json") >= 0, "got correct header back");
				ready();
			}
		};

        xhr.open("GET", url);
        xhr.send();
    });
}

QUnit.test("supports getAllResponseHeaders", function(assert) {
    var ready = assert.async();
    fixture("GET something", function(req,res){
		res(200, {
			message: 'this is the body'
		}, {
			foo: 'bar'
		});
	});

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){
		if(xhr.readyState === 4) {
			var headers = xhr.getAllResponseHeaders();
			var parsed = parseHeaders(headers);
			assert.ok(typeof headers === "string", "got headers back");
			assert.ok(parsed.foo === "bar", "got proper values");
			ready();
		}
	};

    xhr.open("GET", "something");
    xhr.send();
});

QUnit.test("pass data to response handler (#13)", function(assert) {
    var ready = assert.async();
    fixture("GET something", function(req,res){
		res(403, {
		    message: 'No bad guys'
		});
	});

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "something");
    xhr.onreadystatechange = function(ev){
		assert.deepEqual(JSON.parse(this.responseText),{
		    message: 'No bad guys'
		}, "correct response");
		assert.equal(this.status, 403, "correct status");
		ready();
	};
    xhr.send();
});

QUnit.test("pass return value for fixture", function(assert) {
    var ready = assert.async();

    fixture("GET something", {foo:"bar"});

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "something");
    xhr.onreadystatechange = function(ev){
		assert.deepEqual(JSON.parse(this.responseText),{foo:"bar"}, "correct response");
		assert.equal(this.status, 200, "correct status");
		ready();
	};
    xhr.send();
});

if (__dirname !== '/') {
	QUnit.test("pass headers in fallthrough", function(assert) {
        var ready = assert.async();
        var url = __dirname+'/fixtures/foobar.json';
        var xhr = new XMLHttpRequest();
        assert.expect(2);

        xhr.open("GET", url);
        xhr.setRequestHeader("foo", "bar");
        xhr.onreadystatechange = function(ev){
			var originalXhr = ev.target;
			if(originalXhr.readyState === 1) {
				originalXhr.setRequestHeader = function(key, val) {
					assert.equal(key, "foo");
					assert.equal(val, "bar");
				};
			}
			if(originalXhr.readyState === 4) {
				ready();
			}
		};
        xhr.send();
    });
}

QUnit.test("first set.Algebra CRUD works (#12)", function(assert) {
	assert.expect(5);

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	var done = assert.async();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		assert.equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		assert.equal(carsData.data.length, 7, 'One car less');
		assert.equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima",
			type: "new"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		assert.equal(cars.data.length, 8, 'New car created');
		return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

	}).then(function(car){
		assert.equal(car.name, "2013 Altima", "get a single car works");
		done();
	});
});

QUnit.test("set.Algebra CRUD works (#12)", function(assert) {
	assert.expect(5);
	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	var done = assert.async();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		assert.equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		assert.equal(carsData.data.length, 7, 'One car less');
		assert.equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima",
			type: "new"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		assert.equal(cars.data.length, 8, 'New car created');
		return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

	}).then(function(car){
		assert.equal(car.name, "2013 Altima", "get a single car works");
		done();
	});
});

QUnit.test("set.Algebra clauses work", function(assert) {
    var ready = assert.async();

    var NumberValue = matches.makeComparatorType(function(a,b){
		if(a === b) {
			return true;
		}
		if(a && b) {
			return +a === +b;
		}
		return false;
	});

    var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end"),
		{
			schema: function(schema){
				schema.keys.year = NumberValue;
			}
		}
	);

    var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

    fixture('GET /cars', store.getListData);

    $.ajax({ url: "/cars?where[year]=2013", dataType: "json" }).then(function(carsData) {
		assert.equal(carsData.data.length, 4, 'Where clause works with numbers');

		return $.ajax({ url: "/cars?where[year]=2013&orderBy=name", dataType: "json" });

	}).then(function(carsData){
		var names = carsData.data.map(function(c){ return c.name; });
		assert.deepEqual(names, ["2013 Altima","2013 Focus","2013 Leaf","2013 Mustang"],"sort works");

		return $.ajax({ url: "/cars?where[year]=2013&orderBy=name&start=1&end=2", dataType: "json" });
	}).then(function(carsData){
		var names = carsData.data.map(function(c){ return c.name; });
		assert.deepEqual(names, ["2013 Focus","2013 Leaf"], "pagination works");
		ready();
	});
});

QUnit.test("storeConnection reset", function(assert) {

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};
	$.ajax({ url: "/cars/1", method: "DELETE", dataType: "json" }).then(function(){
		store.reset();
		return findAll();
	}).then(function(carsData){
		assert.equal(carsData.data.length, 2, 'Got all cars');
		done();
	});

	var done = assert.async();

});

function makeAlgebraTest(fixtureUrl){
	return function(assert) {
		assert.expect(5);
		var algebra = new set.Algebra(
			new set.Translate("where","where"),
			set.props.id("_id"),
			set.props.sort('orderBy'),
			set.props.enum("type", ["used","new","certified"]),
			set.props.rangeInclusive("start","end")
		);

		var store = fixture.store([
			{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
			{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
			{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
			{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
			{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
			{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
			{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
			{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
		], algebra);

		fixture(fixtureUrl, store);

		var findAll = function(){
			return $.ajax({ url: "/cars", dataType: "json" });
		};

		var done = assert.async();

		findAll().then(function(carsData) {
			assert.equal(carsData.data.length, 8, 'Got all cars');
			return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
		}).then(function() {
			return findAll();
		}).then(function(carsData) {
			assert.equal(carsData.data.length, 7, 'One car less');
			assert.equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
		}).then(function() {

			return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
				modelId: 3,
				year: 2015,
				name: "2015 Altima",
				type: "new"
			} });
		}).then(function(saved) {

			return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
				modelId: 3,
				year: 2015,
				name: '2015 Nissan Altima'
			} });
		}).then(function(updated) {
			return findAll();
		}).then(function (cars) {
			assert.equal(cars.data.length, 8, 'New car created');
			return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

		}).then(function(car){
			assert.equal(car.name, "2013 Altima", "get a single car works");
			done();
		});
	};
}

QUnit.test("set.Algebra CRUD works with easy hookup (#12)", makeAlgebraTest('/cars/{_id}'));
QUnit.test("set.Algebra CRUD works with easy hookup and list-style url (#52)", makeAlgebraTest('/cars'));


QUnit.test("store.getList and store.get", function(assert) {

	var algebra = new set.Algebra(
		set.props.id("_id")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

	assert.equal( store.getList({year: 2013}).data.length, 4, "filtered");

	assert.deepEqual(store.get({_id: 5}).name, "2013 Altima", "get");

});

QUnit.test("supports addEventListener on shim using fixture", function(assert) {
    var ready = assert.async();
    fixture("/addEventListener", function(){
		return {};
	});
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function(){
		assert.ok(true, "our shim supports addEventListener");
		ready();
	});

    xhr.open('GET', "/addEventListener");
    xhr.send();
});

if (__dirname !== '/') {
	QUnit.test("supports sync on XHR shim (#23)", function(assert) {
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function(){
			assert.ok(true, "our shim supports addEventListener");
		});

		xhr.open('GET', url, false);
		xhr.send();
	});
}

QUnit.test("supports sync fixtures (#23)", function(assert) {
	fixture("/sync", function(){
		return {};
	});
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		assert.ok(true, "our shim supports sync");
	});

	xhr.open('GET', "/sync", false);
	xhr.send();
});

if (__dirname !== '/') {
	QUnit.test("supports sync redirect fixtures (#23)", function(assert) {
		fixture("/sync_redirect", __dirname+'/fixtures/test.json');

		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function(){
			assert.ok(true, "our shim supports sync redirect");
		});

		xhr.open('GET', "/sync_redirect", false);
		xhr.send();
	});
}

if (__dirname !== '/') {
	QUnit.test("slow mode works (#26)", function(assert) {
        var ready = assert.async();
        var url = __dirname + '/fixtures/test.json';
        fixture({url: url}, 1000);

        var xhr = new XMLHttpRequest();

        var startTime = new Date();

        xhr.addEventListener('load', function(){
			var delay = new Date() - startTime;
			assert.ok(delay >= 900, delay + "ms >= 900ms");
			fixture({url: url}, null);
			ready();
		});

        xhr.open('GET', url);
        xhr.send();
    });
}

QUnit.test('onload should be triggered for HTTP error responses (#36)', function(assert) {
    var done = assert.async();
    fixture('/onload', function(req, res) {
		res(400);
	});

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
		assert.ok(true, 'onload should be invoked');
		fixture('/onload', null);
		done();
	});

    xhr.addEventListener('error', function() {
		assert.ok(false, 'onerror should not be invoked');
		fixture('/onload', null);
		done();
	});

    xhr.open('GET', '/onload');
    xhr.send();
});

QUnit.test('responseText & responseXML should not be set for arraybuffer types (#38)', function(assert) {
    var done = assert.async();

    fixture('/onload', '/test/fixtures/foo.json');

    var oldError = window.onerror;

    window.onerror = function (msg, url, line) {
	    assert.ok(false, 'There should not be an error');
	    done();
	};

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
		fixture('/onload', null);
		window.onerror = oldError;
		assert.ok(true, 'Got here without an error');
		done();
	});

    xhr.responseType = 'arraybuffer';
    xhr.open('GET', '/onload');
    xhr.send();
});

QUnit.test('fixture with timeout does not run if $.ajax timeout less than delay', function(assert) {
    var done = assert.async();
    var delay = fixture.delay;
    fixture.delay = 1000;
    fixture('/onload', function() {
		fixture('/onload', null);
		assert.ok(false, 'timed out xhr did not abort');
		done();
	});

    $.ajax({
		url: '/onload',
		timeout: 50,
		error: function(xhr) {
			fixture('/onload', null);
			assert.ok(true, 'Got to the error handler');
			assert.equal(xhr.statusText, "timeout");
			assert.equal(xhr.status, "0");
			done();
		}
	});

    fixture.delay = delay;
});

QUnit.test("response headers are set", function(assert) {
    var ready = assert.async();
    fixture("GET /todos", function(request, response){
		response(200, "{}", { foo: "bar"});
	});

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function(){
		var headers = parseHeaders(xhr.getAllResponseHeaders());

		assert.ok(headers.foo === "bar", "header was set");
		ready();
	});

    xhr.open('GET', "/todos");
    xhr.send();
});

QUnit.test("match values in get data", function(assert) {
    var ready = assert.async();
    fixture({
		method: "GET",
		url: "/data-value",
		data: {name: "justin"}
	}, function(request, response){
		assert.ok(true, "got it");
		return {};
	});

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function(){
		ready();
	});

    xhr.open('GET', "/data-value?name=justin&age=22");
    xhr.send();
});

QUnit.test("universal match (#2000)", function(assert) {
    var ready = assert.async();
    fixture({},function(){
		assert.ok(true, "got hit");
		return {};
	});
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function(){
		ready();
		fixture.fixtures.splice(0, fixture.fixtures.length);
	});

    xhr.open('GET', "/something-totally-unexpected-62");
    xhr.send();
});


QUnit.test("set.Algebra stores provide a count (#58)", function(assert) {

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

	fixture('/cars/{_id}', store);

	var done = assert.async();

	$.ajax({ url: "/cars", dataType: "json", data: {start: 2, end: 3} }).then(function(carsData) {
		assert.equal(carsData.data.length, 2, 'Got 2 cars');
		assert.equal(carsData.count, 8, "got the count");
		done();
	}, function(){
		assert.ok(false, "borked");
		done();
	});
});

QUnit.test('should allow Arrays as data type (#133)', function(assert) {
    var ready = assert.async();
    fixture('/array-data', function(req, res) {
		assert.ok(req.data instanceof Array, 'data returned should be instance of Array');
		return {};
	});

    var data = [];
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
		fixture('/array-data', null);
		assert.ok(true, 'should not throw when sending Array');
		ready();
	});
    xhr.open('GET', '/array-data');
    xhr.send(data);
});

QUnit.test('should allow FormData as data type (#133)', function(assert) {
    var ready = assert.async();
    fixture('/upload', function(req, res) {
		assert.ok(req.data instanceof FormData, 'data returned should be instance of formdata');
		res(400);
	});

    var data = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
		fixture('/upload', null);
		assert.ok(true, 'should not throw when sending FormData');
		ready();
	});
    xhr.open('POST', '/upload', true);
    xhr.send(data);
});

QUnit.test('fixture returns the old fixture callback when fixtures are removed (#34)', function(assert) {
	var funcA = function(){
		return "foo";
	};
	fixture("/services/thing", funcA);

	// in a test, remove default fixture and provide your own
	var oldFixtures = fixture("/services/thing", null);
	assert.deepEqual(oldFixtures, [{fixture: funcA, url: '/services/thing'}]);
});

QUnit.test("Using with nested types", function(assert){
	var done = assert.async();

	var Pet = DefineMap.extend("Pet", {
		name: "string"
	});
	var Person = DefineMap.extend("Person", {
		id: { type: "number", identity: true },
		name: "string",
		pet: Pet
	});

	var store = fixture.store([{
		id: 1,
		name: "Dorothy",
		pet: {
			name: "Max"
		}
	}], new QueryLogic(Person));

	fixture('/api/persons/{id}', store);

	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', function() {
		var data = JSON.parse(this.responseText);
		var xhr2 = new XMLHttpRequest();

		xhr2.addEventListener('load', function() {
			var data = JSON.parse(this.responseText);
			assert.equal(data.pet.name, "Max", "Still have the Pet type");
			done();
		});
		xhr2.open('PUT', '/api/persons/1', true);
		xhr2.send(data);

	});
	xhr.open('GET', '/api/persons/1', true);
	xhr.send();
});

if ("onabort" in XMLHttpRequest._XHR.prototype) {
	QUnit.test('fixture with timeout aborts if xhr timeout less than delay', function(assert) {
        var done = assert.async();
        fixture('/onload', 1000);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/onload');
        xhr.send();

        setTimeout(function() {
			xhr.abort();
		}, 50);


        xhr.addEventListener('abort', function() {
			fixture('/onload', null);
			assert.ok(true, 'Got to the error handler');
			assert.equal(xhr.statusText, '');
			assert.equal(xhr.status, 0);
			done();
		});

        xhr.addEventListener('load', function() {
			fixture('/onload', null);
			assert.ok(false, 'timed out xhr did not abort');
			done();
		});
    });

	QUnit.test('dynamic fixture with timeout does not run if xhr timeout less than delay', function(assert) {
        var done = assert.async();
        var delay = fixture.delay;
        fixture.delay = 1000;
        fixture('/onload', function() {
			fixture('/onload', null);
			assert.ok(false, 'timed out xhr did not abort');
			done();
		});

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/onload');
        setTimeout(function() {
			xhr.abort();
		}, 50);
        xhr.send();

        xhr.addEventListener('abort', function() {
			fixture('/onload', null);
			assert.ok(true, 'Got to the error handler');
			assert.equal(xhr.statusText, '');
			assert.equal(xhr.status, 0);
			done();
		});

        fixture.delay = delay;
    });

	QUnit.test("abort() sets readyState correctly", function(assert) {
		var done = assert.async();

		fixture('/foo', function() {
			return {};
		});

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/foo');

		xhr.addEventListener('abort', function() {
			fixture('/foo', null);
			assert.ok(true, 'Got to the error handler');
			assert.equal(xhr.status, 0);
			assert.equal(xhr.statusText, '');

			setTimeout(function(){
				assert.equal(xhr.readyState, 0);
				done();
			}, 50);
		});

		xhr.send();
		xhr.abort();
	});

	QUnit.test("abort() of already completed fixture", function(assert) {
		var done = assert.async();

		fixture('/foo', function() {
			return {};
		});

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/foo');

		xhr.addEventListener('load', function() {
			fixture('/foo', null);
			assert.equal(xhr.readyState, 4);
			xhr.abort();
			done();
		});

		xhr.send();
	});

	QUnit.test('should be able to call getResponseHeader onload', function(assert) {
        var ready = assert.async();
        fixture('/onload', function(req, res) {
			res(400);
		});

        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function() {
			fixture('/onload', null);
			xhr.getResponseHeader('Set-Cookie');
			assert.ok(true, 'should not throw when calling getResponseHeader');
			ready();
		});

        xhr.open('GET', '/onload');
        xhr.send();
    });

	testHelpers.dev.devOnlyTest("window.fixture warns when called", function (assert) {
		var teardown = testHelpers.dev.willWarn(/You are using the global fixture\. Make sure you import can-fixture\./, function(message, matched) {
			if(matched) {
				assert.ok(true, "received warning");
			}
		});

		window.fixture("GET /api/products", function(){
			return {};
		});

		teardown();
	});

	testHelpers.dev.devOnlyTest("Works with steal-clone", function (assert) {
		steal.loader.import("steal-clone", { name: "can-fixture" })
		.then(function(clone) {
			clone({})["import"]("can-fixture").then(function(fixture){
				fixture('/onload', function(req, res) {
					res(400);
				});

				var xhr = new XMLHttpRequest();
				xhr.addEventListener('load', function() {
					fixture('/onload', null);
					assert.ok(true, "Got to the load event without throwing");
					done();
				});
				xhr.open('GET', '/onload');
				xhr.send();
			});
		});

		var done = assert.async();
	});
} // END onabort check
