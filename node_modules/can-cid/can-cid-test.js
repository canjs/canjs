var QUnit = require('steal-qunit');
var cid = require('can-cid');
var namespace = require('can-namespace');
var clone = require('steal-clone');

QUnit.module("can-cid");

QUnit.test("assigns incremental ids", function(assert) {
	var i;
	var objects = [{}, {}, {}, {}, {}];
	var ref = parseInt(cid({}), 10) + 1;

	for(i = 0; i < objects.length; i++){
		assert.equal(i+ref, cid(objects[i]), "cid function returns the id");
	}

	for(i = 0; i < objects.length; i++){
		assert.equal(i+ref, objects[i]._cid, "cid function assigns the ids");
	}
});

QUnit.test("assigns id based on name", function(assert) {
	var reference = {};
	var named = {};
	var id_num = parseInt(cid(reference), 10) + 1;

	cid(named, "name");
	assert.equal(named._cid, "name" + id_num);
});

QUnit.test("sets can-namespace.cid", function(assert) {
	assert.equal(namespace.cid, cid);
});

QUnit.test('should throw if can-namespace.cid is already defined', function(assert) {
	var done = assert.async();
	clone({
		'can-namespace': {
			default: {
				cid: {}
			},
			__useDefault: true
		}
	})
	.import('./can-cid')
	.then(function() {
		assert.ok(false, 'should throw');
		done();
	})
	.catch(function(err) {
		var errMsg = err && err.message || err;
		//Added test for 'bold' due to failed test in Windows 7 IE 9. Error comes from
		//babel-code-frame where the property 'bold' is undefined. If support for IE 9
		//is removed from can-cid remove the test for 'bold'. 
		assert.ok(errMsg.indexOf('can-cid') >= 0 || errMsg.indexOf('bold') >= 0, 'should throw an error about can-cid');
		done();
	});
});

if(typeof document !== "undefined") {
	QUnit.test("works on DOM nodes", function(assert) {
		var el = document.createElement("div");

		var id = cid(el);
		assert.ok(id > 0 , "got an id");
		var id2 = cid(el);
		assert.equal(id, id2 , "got the same id");

		assert.equal(el[cid.domExpando], id, "expando property set");
	});
}
