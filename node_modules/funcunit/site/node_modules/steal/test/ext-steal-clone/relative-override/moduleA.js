import { getName as moduleBGetName } from './moduleB';

export let getName = function() {
  return `moduleA ${moduleBGetName()}`;
}
