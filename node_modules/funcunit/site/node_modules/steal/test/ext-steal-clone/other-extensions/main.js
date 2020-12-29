var clone = require('steal-clone');

function css() {
	return clone({})
		.import('ext-steal-clone/other-extensions/foo.css!')
		.then(function(css) {
			if (typeof window !== "undefined" && window.QUnit) {
				QUnit.ok(css.source, 'css should be loaded correctly');
			} else {
				console.log(css.source);
			}
		});
}

function less() {
	return clone({})
		.import('ext-steal-clone/other-extensions/foo.less!')
		.then(function(less) {
			if (typeof window !== "undefined" && window.QUnit) {
				QUnit.ok(less.source, 'less should be loaded correctly');
			} else {
				console.log(less.source);
			}
		});
}

css()
	.then(less)
	.then(function() {
		if (typeof window !== "undefined" && window.QUnit) {
			QUnit.start();
			removeMyself();
		}
	});
