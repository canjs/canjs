import { getName as moduleBGetName } from 'ext-steal-clone/multiple-overrides/moduleB';
import { getName as moduleCGetName } from 'ext-steal-clone/multiple-overrides/moduleC';

export let getName = function() {
  return `moduleA ${moduleBGetName()} ${moduleCGetName()}`;
}
