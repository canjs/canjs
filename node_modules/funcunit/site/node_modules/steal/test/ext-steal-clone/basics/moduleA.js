import { getName as moduleBGetName } from 'ext-steal-clone/basics/moduleB';

export let getName = function() {
  return `moduleA ${moduleBGetName()}`;
}
