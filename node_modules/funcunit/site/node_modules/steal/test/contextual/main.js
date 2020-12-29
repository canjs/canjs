function basic() {
	System.setContextual('foo', function(parentName) {
		return {
			'default': function() {
				return parentName + ' bar';
			},
			__useDefault: true
		}
	});

	return System.import('contextual/moduleA')
	.then(function(moduleA) {
		if (typeof window !== "undefined" && window.QUnit) {
			QUnit.equal(moduleA.default(), 'contextual/moduleA bar');
		} else {
			console.log(moduleA.default());
		}
	});
}

function definer() {
	System.setContextual('foo', 'contextual/foo');

	return System.import('contextual/moduleB')
	.then(function(moduleA) {
		if (typeof window !== "undefined" && window.QUnit) {
			QUnit.equal(moduleA.default(), 'contextual/moduleB baz');
		} else {
			console.log(moduleA.default());
		}
	});
}

basic()
.then(definer)
.then(function() {
	if (typeof window !== "undefined" && window.QUnit) {
		QUnit.start();
		removeMyself();
	}
});
