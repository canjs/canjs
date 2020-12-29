import moduleB from './moduleB';

export let getName = function() {
  return `moduleA ${moduleB()}`;
}
