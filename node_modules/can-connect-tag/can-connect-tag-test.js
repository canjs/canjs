var QUnit = require("steal-qunit");

var CanMap = require("can-map");
var CanList = require("can-list");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var SimpleObservable = require("can-simple-observable");

var $ = require("jquery");
var superMap = require("can-connect/can/super-map/");
var tag = require("./can-connect-tag");
var fixture = require("can-fixture");
var canSet = require("can-set-legacy");
var QueryLogic = require("can-query-logic");
var stache = require("can-stache");
var stacheBindings = require("can-stache-bindings");

stache.addBindings(stacheBindings);

require("can-stache-bindings");

var domEvents = require('can-dom-events');
var insertedEvent = require('can-dom-mutate/dom-events').inserted;


var findAllTemplate = stache("<person-model getList='type=type'>"+
	"{{#if isPending}}<span class='pending' on:inserted='../pending()'></span>{{/if}}"+
	"{{#if isResolved}}<span class='resolved' on:inserted='../resolved(scope.context, scope.element)'>{{#each value}}<span>{{id}}</span>{{/each}}</span>{{/if}}"+
"</person-model>");

var findOneTemplate = stache("<person-model get='{id=personId}'>"+
	"{{#if isPending}}<span class='pending' on:inserted='../pending()'></span>{{/if}}"+
	"{{#if isResolved}}<span class='resolved' on:inserted='../resolved(scope.context, scope.element)' pid='{{value.id}}'>{{value.type}}</span>{{/if}}"+
"</person-model>");


QUnit.module("can-connect/can/tag", {
	beforeEach: function() {
		this.undo = domEvents.addEvent(insertedEvent);
	},
	afterEach: function() {
		this.undo();
	}
});

QUnit.test("getList", function(assert) {


	var Person = DefineMap.extend({seal: true}, {});
	Person.List = DefineList.extend({"#": Person},{});

	var options = {
		url: "/api/people",
		Map: Person,
		List: Person.List,
		name: "person",
		queryLogic: new canSet.Algebra()
	};
	var connection = superMap(options);
	options.cacheConnection.clear();

	tag("person-model",connection);

	fixture({
		"GET /api/people": function(request){
			if(request.data.type === "first") {
				return {data: [{id: 1, type: "first"},{id: 2, type: "first"}]};
			} else {
				return {data: [{id: 3, type: "second"},{id: 4, type: "second"}]};
			}

		}
	});
	var type = new SimpleObservable("first");
	var done = assert.async();

	var resolvedCalls = 0;

	var frag = findAllTemplate({
		pending: function(){
			assert.ok(true, "called pending");
		},
		resolved: function(context, el){
			resolvedCalls++;
			assert.ok(true, "called resolved");
			if(resolvedCalls === 1) {
				assert.ok(true, "called resolved");
				assert.equal(el.childNodes[1].innerHTML, "1", "added id");
				setTimeout(function(){
					type.set("second");
				},1);
			} else {
				assert.ok(true, "called resolved");
				assert.equal(el.childNodes[1].innerHTML, "3", "added id");
				$("#qunit-fixture").empty();
				done();
			}

		},
		type: type
	});
	$("<div>").appendTo("#qunit-fixture").append(frag);
});


QUnit.test("get", function(assert) {


	var Person = CanMap.extend({});
	Person.List = CanList.extend({Map: Person},{});

	var options = {
			url: "/api/people",
			Map: Person,
			List: Person.List,
			name: "person",
			queryLogic: new QueryLogic({
				identity: ["id"]
			})
	};
	var connection = superMap(options);
	options.cacheConnection.clear();

	tag("person-model",connection);

	fixture({
		"GET /api/people/{id}": function(request){
			if(request.data.id === "1") {
				return {id: 1, type: "first"};
			} else {
				return {id: 2, type: "second"};
			}

		}
	});
	var personId = new SimpleObservable(1);
	var done = assert.async();

	var resolvedCalls = 0;

	var frag = findOneTemplate({
		pending: function(){
			assert.ok(true, "called pending");
		},
		resolved: function(context, el){
			resolvedCalls++;
			assert.ok(true, "called resolved");
			if(resolvedCalls === 1) {
				assert.ok(true, "called resolved");
				assert.equal(el.innerHTML, "first", "added id");
				setTimeout(function(){
					personId.set(2);
				},1);
			} else {
				assert.ok(true, "called resolved");
				assert.equal(el.innerHTML, "second", "added id");
				$("#qunit-fixture").empty();
				done();
			}

		},
		personId: personId,
		rejected: function(){
			assert.ok(false,"rejected");
			done();
		}
	});
	$("<div>").appendTo("#qunit-fixture").append(frag);
});

if(System.env !== 'canjs-test') {
	// Brittle in IE
	QUnit.test("get fullCache", function(assert){
		var done = assert.async();
		var resolvedCalls = 0;

		var Person = CanMap.extend({});
		Person.List = CanList.extend({Map: Person},{});

		var options = {
				url: "/api/people",
				Map: Person,
				List: Person.List,
				name: "person",
				queryLogic: new QueryLogic({
					identity: ["id"]
				})
		};
		var connection = superMap(options);
		connection.cacheConnection.clear();

		tag("person-model",connection);

		fixture({
			"GET /api/people/{id}": function(request){

				if(request.data.id === "1") {
					assert.ok(resolvedCalls >= 1, "got data we already resolved from cache");
					return {id: 1, type: "first"};
				} else {
					assert.ok(resolvedCalls >= 2, "got data we already resolved from cache");
					setTimeout(function(){
						done();
					}, 100);
					return {id: 2, type: "second"};
				}

			},
			"GET /api/people": function(){
				return {data: [{id: 1, type: "first"},{id: 2, type: "second"}]};
			}
		});

		connection.getList({}).then(function(){

			var personId = new SimpleObservable(1);


			var frag = findOneTemplate({
				pending: function(){
					assert.ok(true, "called pending");
				},
				resolved: function(context, el){
					resolvedCalls++;
					assert.ok(true, "called resolved");
					if(resolvedCalls === 1) {

						assert.equal(el.innerHTML, "first", "first id");
						setTimeout(function(){
							personId.set(2);

							setTimeout(function(){
								assert.equal($("person-model .resolved").text(), "second", "updated id");
								$("#qunit-fixture").empty();
							},20);

						},1);
					} else {
						assert.ok(true,"not called immediately, because .then cant be with Promises");
					}

				},
				personId: personId,
				rejected: function(){
					assert.ok(false,"rejected");
					done();
				}
			});

			$("<div>").appendTo("#qunit-fixture").append(frag);
		});
	});
}
