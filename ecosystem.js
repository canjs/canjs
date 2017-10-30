var can = require("can-util/namespace");

require("can-construct-super");
require("can-connect-feathers");
require("can-connect-signalr");
require("can-connect-cloneable");
require("can-connect-ndjson");
require("can-define-stream");
require("can-define-stream-kefir");
require("can-define-validate-validatejs");
require("can-fixture");
require("can-fixture-socket");
require("can-jquery");
require("can-kefir");
require("can-ndjson-stream");
if(typeof Proxy === "function"){
	require("can-observe");
}
require("can-stache-converters");
require("can-validate");
require("can-validate-validatejs");
require("can-view-import");
require("can-react-component");
require("can-stream");
require("can-stream-kefir");
require("can-zone");
require("react-view-model");

if(typeof customElements !== "undefined") {
	require("can-element");
}

module.exports = can;
