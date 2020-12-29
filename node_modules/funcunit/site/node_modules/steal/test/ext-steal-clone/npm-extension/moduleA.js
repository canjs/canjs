import moduleB from 'steal/test/ext-steal-clone/npm-extension/moduleB';

export let getName = function() {
  return `moduleA ${moduleB()}`;
}
