// Core tests
require('../component/component_test');
require('../compute/compute_test');
require('can-connect/test/test');
require('../construct/construct_test');
require('can-define/test/test');
// require('../route/route_test');
// require('../route/pushstate/pushstate_test');
require('can-set/test/test');
require('../view/stache/stache_test');


// Infrastructure tests
require('../event/event_test');
require('can-observation/can-observation_test');
require('../util/util_test');
require('can-view-callbacks/test/callbacks-test');
require('../view/import/import_test');
require('../view/live/live_test');
require('can-view-model/test/test');
require('../view/node_lists/node_lists_test');
require('../view/parser/parser_test');
require('../view/scope/scope_test');
require('../view/autorender/autorender_test');
require('can-simple-map/can-simple-map_test');
require('can-view-target/test/test');
require('can-stache-converters/test/test');
// require('can-simple-dom/test/test');


// Legacy tests
require('../control/control_test');
require('../list/list_test');
require('../map/map_test');
require('can-map-define/can-map-define_test');
require('can-view-href/test/test');
require('can-map-backup/can-map-backup_test');
require('../view/ejs/ejs_test');


// Integration tests
require('../docs/can-guides/experiment/todomvc/test');
require('./integration/all/test');
