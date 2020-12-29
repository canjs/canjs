var stealClone = require('steal-clone');
var loader = require('@loader');
loader.config({
  foo: 'bar',
  bar: function() {}
});

var clone = stealClone({
  'ext-steal-clone/basics/moduleB': {
    getName: function() {
      return 'mockModuleB';
    }
  }
});

if (typeof window !== "undefined" && window.QUnit) {
	QUnit.equal(typeof clone.import, 'function', 'steal-clone should return an import function');
	QUnit.equal(clone.foo, 'bar', 'clone should contain config properties that are not functions');
	QUnit.ok(!clone.bar, 'clone should not contain config properties that are functions');
} else {
  console.log('clone.import:', clone.import);
  console.log('clone.foo:', clone.foo);
  console.log('clone.bar:', clone.bar);
}

clone.import('ext-steal-clone/basics/moduleA')
  .then(function(moduleA) {
    if (typeof window !== "undefined" && window.QUnit) {
      QUnit.equal(moduleA.getName(), 'moduleA mockModuleB', 'import should use injected dependency');

    	QUnit.start();
    	removeMyself();
    } else {
          console.log('moduleA.getName():', moduleA.getName());
    }
  });
