var QUnit = require('steal-qunit');
var plugin = require ('../can-connect-ndjson');

var ReadableStream = window.ReadableStream;
var connect = require("can-connect");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var helpers = require("./helpers");

// Skip all tests in browsers that do not support ReadableStream
// https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
var isReadStreamSupported = true;
try {
  new ReadableStream();
} catch(err) {
  isReadStreamSupported = false;
}

var conditionalTest = isReadStreamSupported ? QUnit.test : QUnit.skip;
var conditionalAsyncTest = isReadStreamSupported ? QUnit.asyncTest : QUnit.skip;

QUnit.module('can-connect-ndjson', {
	beforeEach: function() {
		this.releaseFetch = helpers.trapFetch();
	},
	afterEach: function() {
		this.releaseFetch();
	}
});

if (isReadStreamSupported) {
	QUnit.test('Reading a multiline NDJSON', function(assert) {
		var done = assert.async();
		var Todo = DefineMap.extend("Todo",{
			id: "number",
			name: "string"
		});
		Todo.List = DefineList.extend({
			"#": Todo
		});
	
		Todo.connection = connect([
			require("can-connect/data/url/url"),
			require("can-connect/constructor/constructor"),
			require("can-connect/constructor/store/store"),
			require("can-connect/can/map/map"),
			require("can-connect-ndjson")
		],{
			Map: Todo,
			List: Todo.List,
			url: "foo/bar",
			ndjson: "foo/bar"
		});
		Todo.getList({}).then(function (oblist) {
			assert.ok(oblist, "Observable list created.");
			assert.ok(oblist.isStreaming, "Status is streaming");
			var idata = ['{"a":1,"b":2}\n','{"c":3,"d":4}\n\n{"e','":[5]}'];
			var answers = [{a:1,b:2},{c:3,d:4},{e:[5]}];
			var timeout = 0;
			var onAdd = function(event, added) {
				clearTimeout(timeout);
				assert.equal(added.length, 1, "Added exactly 1 object");
				assert.deepEqual(added[0].get(), answers.shift(), "Gave correct answer");
				var next = idata.shift();
				if (next) {
					assert.ok(oblist.isStreaming, "Status is streaming");
					fetch_push(next);
					if (idata.length == 0){
						fetch_close();
					}
					timeout = setTimeout(function() {
						assert.notOk(true, "Processing exceeds 1s");
					}, 1000);
				} else {
					assert.notOk(oblist.streamError, "No error should occur");
					assert.ok(true, "Reached end of testing");
					setTimeout(function() {
						assert.notOk(oblist.isStreaming, "Status is not streaming");
						done();
					}, 500);
				}
			};
			var onRemove = function() {
				assert.notOk(true, "Items are being removed!");
			};
			oblist.on("add", onAdd);
			oblist.on("remove", onRemove);
			fetch_push(idata.shift());
			timeout = setTimeout(function() {
				assert.notOk(true, "Processing exceeds 1s");
			}, 1000);
		});
	});
}
