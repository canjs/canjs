import QUnit from 'steal-qunit';
import plugin from './can-stache-helpers';

QUnit.module('can-stache-helpers');

QUnit.test('Initialized the plugin', function(){
  QUnit.equal(typeof plugin, 'function');
  QUnit.equal(plugin(), 'This is the can-stache-helpers plugin');
});
