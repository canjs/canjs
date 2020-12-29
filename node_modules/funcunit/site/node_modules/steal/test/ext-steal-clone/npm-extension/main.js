var stealClone = require('steal-clone');

stealClone({
  'steal/test/ext-steal-clone/npm-extension/moduleB': {
    default: function() {
      return 'mockModuleB';
    }
  }
})
.import('steal/test/ext-steal-clone/npm-extension/moduleA')
.then(function(moduleA) {
  if (typeof window !== "undefined" && window.QUnit) {
    QUnit.equal(moduleA.getName(), 'moduleA mockModuleB', 'import should use injected dependency');

    QUnit.start();
    removeMyself();
  } else {
    console.log('moduleA.getName():', moduleA.getName());
  }
});
