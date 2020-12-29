var stealClone = require('steal-clone');

return stealClone()
.import('ext-steal-clone/relative-import/moduleA')
.then(function(moduleA) {
  if (typeof window !== "undefined" && window.QUnit) {
    QUnit.equal(moduleA.getName(), 'moduleA moduleB', 'import should use injected dependency');

    QUnit.start();
    removeMyself();
  } else {
    console.log('moduleA.getName():', moduleA.getName());
  }
});
