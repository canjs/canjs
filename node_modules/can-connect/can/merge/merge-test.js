var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var set = require('can-set-legacy');

var connect = require('../../can-connect');
var canMap = require('../map/map');
var constructorBehavior = require('../../constructor/constructor');
var constructorStore = require('../../constructor/store/store');
var canMapMerge = require('../merge/merge');

var QUnit = require('steal-qunit');

QUnit.test("basics", function(assert) {
	// must have queryLogic connection and use #

	var Author = DefineMap.extend("Author",{
		id: {type: 'number', identity: true},
		name: 'string'
	});
	Author.queryLogic = new set.Algebra( set.props.id('id') );

	var OSProject = DefineMap.extend("OSProject",{
		id: {type: 'number', identity: true},
		title: 'string'
	});
	OSProject.List = DefineList.extend("OSProjectList",{ '#' : OSProject });
	OSProject.queryLogic = new set.Algebra( set.props.id('id') );

	var ContributionMonth = DefineMap.extend("ContributionMonth",{
		id: {type: 'string', identity: true},
		author: Author,
		osProjects: OSProject.List
	});
	ContributionMonth.List = DefineList.extend("ContributionMonthList",{ '#' : ContributionMonth });

	var dataBehavior = {
		createData: function(){
			return Promise.resolve({
				id: "abc",
				author: {id: 1, name: "Justin"},
				osProjects: [{id: 200, name: "canjs"}, {id: 201, name: "donejs"}]
			});
		},
		updateData: function(){
			return Promise.resolve({
				id: "abc",
				author: {id: 1, name: "justin meyer"},
				osProjects: [{id: 201, name: "DoneJS"}, {id: 202, name: "StealJS"}, {id: 200, name: "CanJS"}]
			});
		}
	};

	ContributionMonth.connection = connect([dataBehavior, constructorBehavior, constructorStore, canMap, canMapMerge], {
		Map: ContributionMonth,
		List: ContributionMonth.List
	});

	var cm = new ContributionMonth({
		author: {id: 1, name: "Justin"},
		osProjects: [{id: 200, name: "CanJS"}, {id: 201, name: "DoneJS"}]
	});

	var canjs = cm.osProjects[0];
	var donejs = cm.osProjects[1];

	var done = assert.async();
	var promise = cm.save().then(function(cm){
		assert.deepEqual(cm.id, "abc", "updated id");
		assert.deepEqual(
			cm.osProjects.get(), [{id: 200, name: "canjs"}, {id: 201, name: "donejs"}], "updated by save");


		cm.author.name = "Justin Meyer";
		var canJSProject = cm.osProjects.shift();
		assert.equal(canjs, canJSProject, "same canjs project in memory");

		cm.osProjects.push({id: 202, name: "stealjs"}, canJSProject);
		return cm.save();
	});

	promise.then(function(cm){
		assert.equal(cm.osProjects[0], donejs, "same donejs" );
		assert.equal(cm.osProjects[2], canjs, "still canjs" );

		assert.deepEqual(cm.get(), {
			id: "abc",
			author: {id: 1, name: "justin meyer"},
			osProjects: [{id: 201, name: "DoneJS"}, {id: 202, name: "StealJS"}, {id: 200, name: "CanJS"}]
		}, "values look right");

		done();
	})
	.catch(function(err){
		setTimeout(function(){
			throw err;
		},1);
		done();
	});

});
