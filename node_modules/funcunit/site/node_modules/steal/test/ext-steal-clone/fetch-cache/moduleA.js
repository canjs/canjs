import { getName as moduleBGetName } from 'ext-steal-clone/fetch-cache/moduleB';

export let getName = function() {
  return `moduleA ${moduleBGetName()}`;
}
