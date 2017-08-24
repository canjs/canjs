// Core tests
require('../component/component_test');
require('../compute/compute_test');
require('../construct/construct_test');
require('can-construct-super/test/can-construct-super_test');
require('can-define/test/test');
// require('../route/route_test');
// require('../route/pushstate/pushstate_test');
require('can-set/test/test');
require('can-stache-bindings/test/bindings-test');
require('can-stache-converters/test/test');


// Infrastructure tests
require('can-deparam/can-deparam-test');
require('can-param/can-param-test');
require('../event/event_test');
require('../util/util_test');
require('../view/import/import_test');
require('../view/live/live_test');
require('can-view-model/test/test');
require('../view/node_lists/node_lists_test');
require('../view/parser/parser_test');
require('../view/scope/scope_test');
require('../view/autorender/autorender_test');
require('can-view-target/test/test');
require('can-simple-dom/test/test');
require('can-simple-observable/can-simple-observable-test');
require('can-symbol/can-symbol-test');
require('can-reflect/can-reflect-test');
require('can-reflect-promise/test/can-reflect-promise_test');
require('can-ajax/can-ajax-test');
require('can-globals/can-globals-test');
require('can-define-lazy-value/define-lazy-value-test');


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
require('can-connect-cloneable/test/test');
require('can-kefir/can-kefir-test');
require('can-stream/can-stream_test');
require('can-stream-kefir/can-stream-kefir_test');
require('can-ndjson-stream/can-ndjson-stream-test');
require('can-connect-ndjson/test/can-connect-ndjson-test');
if(typeof Proxy === "function"){
	require('can-observe/test');
}
require('can-define-stream/can-define-stream_test');
require('can-define-stream-kefir/can-define-stream-kefir_test');

require('react-view-model/test/test#?can/test/browser-supports-react');
require('can-react-component/test/test#?can/test/browser-supports-react');
// require('can-jquery/test/test');
// require('can-vdom/test/test');
// require('can-zone/test/test');


// Integration tests
require('../docs/can-guides/experiment/todomvc/test');
require('./integration/all/test');
