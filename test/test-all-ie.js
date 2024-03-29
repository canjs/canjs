// test.js
require('can-component/test/test-without-proxy');
require('can-define/test/test');
// require('can-route/test/test'); in dev-only
// require('can-route-pushstate/can-route-pushstate_test'); in dev-only
// require('can-stache/test/stache-test'); in dev-only
// require('can-stache-bindings/test/tests');
require('can-query-logic/can-query-logic-test');
require('can-value/test/test');
// can-connect
// can-stache-route-helpers


// Infrastructure tests
require('can-ajax/can-ajax-test');
require('can-assign/can-assign-test');
require('can-bind/test/test');
require('can-construct/can-construct_test');
require('can-construct-super/test/can-construct-super_test');
require('can-control/can-control_test');
require('can-define-lazy-value/define-lazy-value-test');
require('can-deparam/can-deparam-test');
require('can-dom-events/can-dom-events-test');
require('can-dom-mutate/test');
require('can-event-dom-enter/can-event-dom-enter-test');
require('can-event-dom-radiochange/can-event-dom-radiochange-test');
require('can-event-queue/can-event-queue-test');
require('can-globals/can-globals-test');
require('can-key/can-key-test');
require('can-key-tree/can-key-tree-test');
// require('can-observation/can-observation_test'); in dev-only
require('can-param/can-param-test');
require('can-parse-uri/can-parse-uri-test');
require('can-queues/can-queues-test');
require('can-reflect/can-reflect-test');
require('can-reflect-dependencies/test');
require('can-reflect-promise/test/can-reflect-promise_test');
require('can-simple-dom/test/test');
// require('can-simple-map/can-simple-map_test'); in dev-only
require('can-simple-observable/can-simple-observable-test');
require('can-stache-key/can-stache-key-test');
require('can-symbol/can-symbol-test');
require('can-validate-interface/test');
// require('can-view-callbacks/test/callbacks-test'); in dev-only
require('can-view-live/test/test');
require('can-view-model/test/test');
require('can-view-parser/test/can-view-parser-test');
require('can-view-scope/test/scope-test');
require('can-view-target/test/test');
require('can-stache-converters/test/test');


// Legacy tests
require('can-compute/can-compute_test');
require('can-define-realtime-rest-model/can-define-realtime-rest-model-test');
require('can-define-rest-model/test');
require('can-list/can-list_test');
require('can-map/can-map_test');
require('can-map-define/can-map-define_test');
//require('can-view-href/test/test');
//require('can-map-backup/can-map-backup_test');
//require('can-validate-legacy/can-validate-test');


// Ecosystem tests
require('can-fixture/test/fixture_test');
// require('can-fixture-socket/test/test'); // depends on feathers-hooks which does not support IE11
//require('can-connect-signalr/test');
//require('can-connect-cloneable/test/test');
require('can-kefir/can-kefir-test');
require('can-stream/can-stream_test');
require('can-stream-kefir/can-stream-kefir_test');
require('can-ndjson-stream/can-ndjson-stream-test');
// require('can-vdom/test/test'); uses mocha
//require('can-connect-ndjson/test/can-connect-ndjson-test');
//if(typeof Proxy === "function"){
//	require('can-observe/test/test');
//}
require('can-define-backup/can-define-backup_test-no-weakmap');
require('can-define-stream/can-define-stream_test');
require('can-define-stream-kefir/can-define-stream-kefir_test');
require('can-validate/test');
require('can-validate-validatejs/test');
// require('can-jquery/test/test');
// require('can-vdom/test/test');
require('can-view-autorender/test/test');

// test-dev-only.js
// These are tests that should not be run in production-mode because
// they use steal-clone, which does not currently work in production

// Core tests
require('can-connect/test/test-without-proxy');
require("can-debug/can-debug-test");
require('can-route/test/test-without-proxy');
require('can-route-pushstate/test/test-ie');
require('can-stache/test/stache-test');

// Infrastructure tests
require('can-attribute-encoder/can-attribute-encoder-test');
require('can-observation/can-observation_test');
require('can-view-callbacks/test/callbacks-test');
require('can-simple-map/can-simple-map_test');

//require('can-cid/tests'); // ideally not imported by 4.0
//require('can-types/test/test'); // should not be imported by 4.0
