var ObserveObject = require("../object/object");

var classSupport = (function() {
	try {
		eval('"use strict"; class A{};');
		return true;
	} catch (e) {
		return false;
	}

})();

function testDecoratorGetter(decoratorName, decorator, propName, getter, tester) {
	if(classSupport) {
		QUnit.test(decoratorName + " getter decorator with class Object prototype", function(assert) {
			var ran = false;

			class TesterType extends ObserveObject {
				get [propName]() {
					ran = true;
					return getter.apply(this, arguments);
				}
			}
			decorator(TesterType.prototype, propName, Object.getOwnPropertyDescriptor(TesterType.prototype, propName));

			tester.call(assert, TesterType);
			assert.equal(ran, true, "getter ran");
		});
	}

	QUnit.test(decoratorName + " getter decorator with Object.extend prototype", function(assert) {
		var ran = false;

		var TesterType = ObserveObject.extend("TesterType", {}, {
			get [propName]() {
				ran = true;
				return getter.apply(this, arguments);
			}
		});
		decorator(TesterType.prototype, propName, Object.getOwnPropertyDescriptor(TesterType.prototype, propName));

		tester.call(assert, TesterType);
		assert.equal(ran, true, "getter ran");
	});
}

function testDecoratorMethod(decoratorName, decorator, propName, method, tester) {
	if(classSupport) {
		QUnit.test(decoratorName + " method decorator with class Object prototype", function(assert) {
			var ran = false;

			class TesterType extends ObserveObject {
				[propName](resolve) {
					ran = true;
					return method.apply(this, arguments);
				}
			}
			decorator(TesterType.prototype, propName, Object.getOwnPropertyDescriptor(TesterType.prototype, propName));

			tester.call(assert, TesterType);
			assert.equal(ran, true, "method ran");
		});
	}

	QUnit.test(decoratorName + " method decorator with Object.extend prototype", function(assert) {
		var ran = false;

		var TesterType = ObserveObject.extend("TesterType", {}, {
			[propName](resolve) {
				ran = true;
				return method.apply(this, arguments);
			},
		});
		decorator(TesterType.prototype, propName, Object.getOwnPropertyDescriptor(TesterType.prototype, propName));

		tester.call(assert, TesterType);
		assert.equal(ran, true, "method ran");
	});
}

function testDecorator(decoratorName, decorator, propName, method, tester) {
	testDecoratorGetter.apply(null, arguments);
	testDecoratorMethod.apply(null, arguments);
}

module.exports = {
	testDecoratorGetter,
	testDecoratorMethod,
	testDecorator,
};
