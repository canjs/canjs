var stealClone = require('steal-clone');
var loader = require('@loader');

// test when parent of injected module has been imported prior to cloning
var origModuleA = require('ext-steal-clone/fetch-cache/moduleA');

var clone = stealClone({
  'ext-steal-clone/fetch-cache/moduleB': {
    getName: function() {
      return 'mockModuleB';
    }
  }
});

clone.normalize('ext-steal-clone/fetch-cache/moduleA')
.then(function(normalizedName) {
	clone._traceData.loads[normalizedName].source =
	"import { getName as moduleBGetName } from 'ext-steal-clone/fetch-cache/moduleB';" +
	"export let getName = function() {" +
		"return `foo ${moduleBGetName()}`;" +
	"}";

	clone.import(normalizedName)
	.then(function(moduleA) {
		if (typeof window !== "undefined" && window.QUnit) {
			QUnit.equal(moduleA.getName(), 'foo mockModuleB', 'import should use source from cache');
			QUnit.equal(origModuleA.getName(), 'moduleA moduleB', 'prior import should use original dependency');

			QUnit.start();
			removeMyself();
		} else {
			console.log('moduleA.getName():', moduleA.getName());
			console.log('origModuleA.getName():', origModuleA.getName());
		}
	});
});

