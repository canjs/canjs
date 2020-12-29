var steal = require("@steal");
var QUnit = require("steal-qunit");

var SimpleMap = require("can-simple-map");
var canViewModel = require("can-view-model");
var canReflectDeps = require("can-reflect-dependencies");
var canReflect = require("can-reflect");

var stache = require("can-stache");
var stacheBindings = require("can-stache-bindings");

stache.addBindings(stacheBindings);

var browserSupportsAutomaticallyNamedConstructors = (function() {
	var C = function C() {};
	var c = new C();
	return c.constructor.name === "C";
}());

QUnit.module("can-stache-bindings bindings dependencies", {
	beforeEach: function() {
		this.fixture = document.getElementById("qunit-fixture");
	},
	afterEach: function() {
		document.getElementById("qunit-fixture").innerHTML = "";
	}
});

var devOnlyTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

// input <-> attribute observation -> scopeKeyData
// parent: scope, child: viewModelOrAttribute
devOnlyTest("parent to child dependencies", function(assert) {
	var template = stache('<input value:from="age">');

	var map = new SimpleMap();
	var frag = template(map);

	var ta = this.fixture;
	ta.appendChild(frag);

	var input = ta.getElementsByTagName("input")[0];
	var inputDeps = canReflectDeps.getDependencyDataOf(input, "value")
		.whatChangesMe;

	assert.ok(
		inputDeps.mutate.valueDependencies.size,
		"the input should have mutation dependencies"
	);

	// tests: input <-> attribute observation
	var attributeObservation = canReflect.toArray(inputDeps.mutate.valueDependencies)[0];
	var attributeObservationDeps = canReflectDeps.getDependencyDataOf(
		attributeObservation
	).whatChangesMe;

	assert.ok(
		attributeObservationDeps.derive.keyDependencies.get(input).has("value"),
		"the input's 'value' attribute should be a dependency of the attribute observation"
	);
	assert.ok(
		attributeObservationDeps.mutate.valueDependencies.size,
		"the attribute observation should have mutation dependencies"
	);

	// tests: scopeKeyData <- attribute internal observation
	var scopeKeyData = canReflect.toArray(
		attributeObservationDeps.mutate.valueDependencies
	)[0];
	var scopeKeyDataDeps = canReflectDeps.getDependencyDataOf(scopeKeyData)
		.whatChangesMe;

	assert.ok(
		!scopeKeyDataDeps.mutate,
		"the attribute observation should NOT be a dependency of scopeKeyData"
	);
});

devOnlyTest("parent to child - map", function(assert) {
	var template = stache('<input value:from="age">');

	var map = new SimpleMap({ age: 10 });
	var frag = template(map);

	var ta = this.fixture;
	ta.appendChild(frag);

	var ageDeps = canReflectDeps.getDependencyDataOf(map, "age").whatChangesMe;
	assert.ok(
		ageDeps.mutate.valueDependencies.size,
		"map.age should have mutation dependencies"
	);

	var scopeKeyData = canReflect.toArray(ageDeps.mutate.valueDependencies)[0];
	var scopeKeyDataDeps = canReflectDeps.getDependencyDataOf(scopeKeyData)
		.whatIChange;

	assert.ok(
		scopeKeyDataDeps.mutate.valueDependencies.size,
		"the scopeKeyData should have [whatIChange] mutation dependencies"
	);

	var attributeObservable = canReflect.toArray(
		scopeKeyDataDeps.mutate.valueDependencies
	)[0];

	if (browserSupportsAutomaticallyNamedConstructors) {
		assert.equal(
			attributeObservable.constructor.name,
			"AttributeObservable",
			"scopeKeyData affects the AttributeObservable instance"
		);
	}
});

// input <-> attribute observation
// parent: scope, child: viewModelOrAttribute
devOnlyTest("child to parent dependencies", function(assert) {
	var template = stache('<input value:to="age">');

	var scope = new SimpleMap({ age: 10 });
	var frag = template(scope);

	var ta = this.fixture;
	ta.appendChild(frag);

	var input = ta.getElementsByTagName("input")[0];
	var inputDeps = canReflectDeps.getDependencyDataOf(input, "value")
		.whatChangesMe;

	assert.ok(
		inputDeps.mutate.valueDependencies.size,
		"the input should have mutation dependencies"
	);

	// tests: input <-> attribute observation
	var attributeObservation = canReflect.toArray(inputDeps.mutate.valueDependencies)[0];
	var attributeObservationDeps = canReflectDeps.getDependencyDataOf(
		attributeObservation
	);

	assert.ok(
		attributeObservationDeps.whatChangesMe.derive.keyDependencies
			.get(input)
			.has("value"),
		"the input's 'value' attribute should be a dependency of the attribute observation"
	);
	assert.ok(
		attributeObservationDeps.whatIChange.mutate.valueDependencies.size,
		"The attribute observable changes ScopeObservable"
	);

	// attribute observation -> ScopeObservable
	var scopeObservable = canReflect.toArray(
		attributeObservationDeps.whatIChange.mutate.valueDependencies
	)[0];

	var scopeObservableDeps = canReflectDeps.getDependencyDataOf(scopeObservable)
		.whatIChange.mutate;

	// ScopeObservable -> scope["age"]
	assert.ok(
		scopeObservableDeps.keyDependencies.get(scope).has("age"),
		"The scope observable changes the scope's 'age' property"
	);
});

// input <-> attribute observation <-> scopeKeyData
devOnlyTest("attribute cross binding dependencies", function(assert) {
	var template = stache('<input value:bind="age">');

	var scope = new SimpleMap({ age: 8 });
	var frag = template(scope);

	var ta = this.fixture;
	ta.appendChild(frag);

	var input = ta.getElementsByTagName("input")[0];
	var inputDeps = canReflectDeps.getDependencyDataOf(input, "value")
		.whatChangesMe;

	assert.ok(
		inputDeps.mutate.valueDependencies.size,
		"the input should have mutation dependencies"
	);

	// tests: input <-> attribute observation
	var attributeObservation = canReflect.toArray(inputDeps.mutate.valueDependencies)[0];
	var attributeObservationDeps = canReflectDeps.getDependencyDataOf(
		attributeObservation
	).whatChangesMe;

	assert.ok(
		attributeObservationDeps.derive.keyDependencies.get(input).has("value"),
		"the input's 'value' attribute should be a dependency of the attribute observation"
	);
	assert.ok(
		attributeObservationDeps.mutate.valueDependencies.size,
		"the attribute observation should have mutation dependencies"
	);

	// tests: scopeKeyData <-> attribute internal observation
	var scopeKeyData = canReflect.toArray(
		attributeObservationDeps.mutate.valueDependencies
	)[0];
	var scopeKeyDataDeps = canReflectDeps.getDependencyDataOf(scopeKeyData)
		.whatChangesMe;

	assert.ok(
		scopeKeyDataDeps.mutate.valueDependencies.has(attributeObservation),
		"the attribute observation should be a dependency of scopeKeyData"
	);
});

devOnlyTest("view model parent to child binding", function(assert) {
	var template = stache('<div id="comp" vm:viewModelProp:from="scopeProp"></div>');
	var map = new SimpleMap({scopeProp: "Venus"});

	var ta = this.fixture;
	ta.appendChild(template(map));

	var vm = canViewModel(ta.getElementsByTagName("div")[0]);

	var vmDeps = canReflectDeps.getDependencyDataOf(vm, "viewModelProp")
		.whatChangesMe;

	// Check something mutates the VM prop
	assert.ok(
		vmDeps.mutate.valueDependencies.size,
		"The viewmodel property should have value dependencies"
	);

	// get the settable observable that change vmProp
	// viewModel.viewModelProp <- SettableObservable <- ScopeKeyData <- observation <- scopeProp
	var settableObservable = canReflect.toArray(vmDeps.mutate.valueDependencies)[0];
	// What changes that settable observabe
	var settableObservableDeps = canReflectDeps.getDependencyDataOf(
		settableObservable
	).whatChangesMe;

	// The settable observable is changed by something
	assert.ok(
		settableObservableDeps.mutate.valueDependencies.size,
		"The settable observable should have value dependencies"
	);

	// SettableObservable <- ScopeKeyData
	var scopeKeyData = canReflect.toArray(settableObservableDeps.mutate.valueDependencies)[0];
	var scopeKeyDataObservationDeps = canReflectDeps.getDependencyDataOf(scopeKeyData.observation)
		.whatChangesMe;
	var scopeKeyDataDeps = canReflectDeps.getDependencyDataOf(scopeKeyData)
		.whatChangesMe;

	assert.ok(
		scopeKeyDataObservationDeps.derive.keyDependencies.get(map).has("scopeProp"),
		"The ScopeKeyData's internal observation is bound to map.scopeProp"
	);

	assert.ok(
		scopeKeyDataDeps.derive.valueDependencies.has(scopeKeyData.observation),
		"The ScopeKeyData is bound to its internal observation"
	);
});

devOnlyTest("view model child to parent binding", function(assert) {
	var template = stache('<div id="comp" vm:viewModelProp:to="scopeProp"></div>');
	var map = new SimpleMap({scopeProp: "Venus"});

	var ta = this.fixture;
	ta.appendChild(template(map));

	var vm = canViewModel(ta.getElementsByTagName("div")[0]);
	var vmDeps = canReflectDeps.getDependencyDataOf(vm, "viewModelProp")
		.whatChangesMe;

	assert.ok(
		vmDeps.mutate.valueDependencies.size,
		"The viewmodel property should have value dependencies"
	);

	// viewModel.viewModelProp <-> SettableObservable
	var settableObservable = canReflect.toArray(vmDeps.mutate.valueDependencies)[0];
	var settableObservableDeps = canReflectDeps.getDependencyDataOf(
		settableObservable
	).whatIChange;

	assert.ok(
		settableObservableDeps.mutate.valueDependencies.size,
		"The settable observable should have value dependencies"
	);

	// SettableObservable -> ObservableFromScope
	var scopeObs = canReflect.toArray(settableObservableDeps.mutate.valueDependencies)[0];
	var scopeObsDeps = canReflectDeps.getDependencyDataOf(scopeObs).whatIChange;

	assert.ok(
		scopeObsDeps.mutate.keyDependencies.get(map).has("scopeProp"),
		"The ObservableFromScope is bound to map.scopeProp"
	);
});
