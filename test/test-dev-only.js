// These are tests that should not be run in production-mode because
// they use steal-clone, which does not currently work in production

// Core tests
require('can-connect/test/test');
require('can-stache/test/stache-test');
require("can-debug/can-debug-test");

// Infrastructure tests
require('can-attribute-encoder/can-attribute-encoder-test');
require('can-observation/can-observation_test');
require('can-view-callbacks/test/callbacks-test');
require('can-simple-map/can-simple-map_test');
require('can-cid/tests');
