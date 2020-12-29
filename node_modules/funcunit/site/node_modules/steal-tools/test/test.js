var isIOjs = process.version.substr(0, 3) !== "v0.";

// Unit tests
require("./clean_address_test");
require("../lib/bundle/bundle_test");
require("./cli/cmd_build_test");
require("./cli/cmd_build_int_test");
require("./cli/cmd_transform_test");
require("./cli/make_system_test");
require("./cli/cmd_export_test");
require("./cli/make_outputs_test");
require("./cli/cmd_live_test");
require("./get_es_module_imports_test");

// Integration tests
require("./test_cli");
require("./grunt_tasks/steal_build");

// Node 0.10 doesn't support Symbols so the live-reload tests will
// not pass on it.
if(typeof Symbol !== "undefined") {
	require("./test_live");
}

require("./bundle_name_test");
require("./dependencygraph_test");
require("./bundle_test");
require("./order_test");

// mock-fs doesn't work in iojs 3.0 right now so skipping until that is fixed.
if(!isIOjs) {
	require("./recycle_test");
}

require("./multibuild_test");
require("./transform_test");
require("./export_test");
require("./export_global_js_test");
require("./export_global_css_test");
require("./export_standalone_test");
require("./continuous_test");
require("./concat_test");
require("./graph_stream_test");
require("./transpile_test");
require("./write_stream_test");
require("./build_conditionals_test");
