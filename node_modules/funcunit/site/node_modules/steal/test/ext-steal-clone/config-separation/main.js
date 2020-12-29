var moduleA = require('./moduleA');
var stealClone = require('steal-clone');

var clone = stealClone({});

function excludeRegistry() {
  var deletedModule = 'ext-steal-clone/config-separation/moduleB';

  clone.delete(deletedModule);

  if (typeof window !== "undefined" && window.QUnit) {
    QUnit.ok(!clone.has(deletedModule), 'should delete module from clone');
    QUnit.ok(System.has(deletedModule), 'should not delete module from System');
  } else {
    console.log(' clone.has(' + deletedModule + '):', clone.has(deletedModule));
    console.log('System.has(' + deletedModule + '):', System.has(deletedModule));
  }

  return Promise.resolve();
}

function excludeExtensions() {
  function cloneExtension() {}
  clone._extensions.push(cloneExtension);

  if (typeof window !== "undefined" && window.QUnit) {
    QUnit.ok(clone._extensions.indexOf(cloneExtension) >= 0, 'clone should include new extensions');
    QUnit.ok(System._extensions.indexOf(cloneExtension) < 0, 'System should not include new extensions');
  } else {
    console.log('index of cloneExtension in clone:', clone._extensions.indexOf(cloneExtension));
    console.log('index of cloneExtension in System:', System._extensions.indexOf(cloneExtension));
  }

  return Promise.resolve();
}

excludeRegistry()
  .then(excludeExtensions)
  .then(function() {
    if (typeof window !== "undefined" && window.QUnit) {
      QUnit.start();
      removeMyself();
    }
  });
