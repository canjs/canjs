import { getName as moduleBGetName } from 'ext-steal-clone/prior-import/moduleB';

export let getName = function() {
  return `moduleA ${moduleBGetName()}`;
}
