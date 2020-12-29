const QUnit = require("steal-qunit");
const mixinInitializeBindings = require("./mixin-initialize-bindings");

QUnit.module("can-stache-element - mixin-initialize-bindings");

QUnit.test("disconnect calls super disconnect", function(assert) {
	assert.expect(1);

	class Obj {
		disconnect() {
			assert.ok(true, "disconnect called");
		}
	}

	const InitializeBindingObj = mixinInitializeBindings(Obj);

	const obj = new InitializeBindingObj();
	obj.disconnect();
});

QUnit.test("initialize calls super initialize", function(assert) {
	assert.expect(1);
	
	const props = { name: "Matt" };
	
	class Obj {
		initialize(_props) {
			assert.equal(_props, props, "initialize called");
		}
	}

	const InitializeBindingObj = mixinInitializeBindings(Obj);

	const obj = new InitializeBindingObj();
	obj.initialize(props);
});
