// Core tests
require('../component/component_test');
require('../compute/compute_test');
require('can-connect/test/test');
require('../construct/construct_test');
require('can-construct-super/test/can-construct-super_test');
require('can-define/test/test');
// require('../route/route_test');
// require('../route/pushstate/pushstate_test');
require('can-set/test/test');
require('../view/stache/stache_test');
require('can-stache-converters/test/test');


// Infrastructure tests
require('../event/event_test');
if (!System.isEnv('production')) {
	System.import('can-observation/can-observation_test');
}
require('../util/util_test');
if (!System.isEnv('production')) {
	System.import('can-view-callbacks/test/callbacks-test');
}
require('../view/import/import_test');
require('../view/live/live_test');
require('can-view-model/test/test');
require('../view/node_lists/node_lists_test');
require('../view/parser/parser_test');
require('../view/scope/scope_test');
require('../view/autorender/autorender_test');
if (!System.isEnv('production')) {
	System.import('can-simple-map/can-simple-map_test');
}
require('can-view-target/test/test');
require('can-simple-dom/test/test');
if (!System.isEnv('production')) {
	System.import('can-cid/test/test');
}
if (!System.isEnv('production')) {
	System.import('can-types/test/test');
}



// Legacy tests
require('../control/control_test');
require('../list/list_test');
require('../map/map_test');
require('can-map-define/can-map-define_test');
require('can-view-href/test/test');
require('can-map-backup/can-map-backup_test');
require('can-validate-legacy/can-validate-test');
require('../view/ejs/ejs_test');

// Ecosystem tests
require('can-fixture/test/fixture_test');
require('can-connect-signalr/test');
// require('can-jquery/test/test');
// require('can-vdom/test/test');
// require('can-zone/test/test');

if(typeof Proxy === 'function') {
	require('can-observe/test');
}


// Integration tests
require('../docs/can-guides/experiment/todomvc/test');
require('./integration/all/test');
