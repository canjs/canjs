var stealClone = require('steal-clone');

return stealClone({
  './moduleB': {
    getName: function() {
      return 'mockModuleB';
    }
  }
})
.import('ext-steal-clone/relative-override/moduleA')
.then(function(moduleA) {
  if (typeof window !== "undefined" && window.QUnit) {
    QUnit.equal(moduleA.getName(), 'moduleA mockModuleB', 'import should use injected dependency');

    QUnit.start();
    removeMyself();
  } else {
    console.log('moduleA.getName():', moduleA.getName());
  }
});
