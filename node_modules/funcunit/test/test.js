var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

require("test/funcunit/actions_test");
require("test/funcunit/funcunit_test");
require("test/funcunit/iframe_test");
require("test/funcunit/find_closest_test");
require("test/funcunit/open_test");
require("test/funcunit/syn_test");
require("test/funcunit/confirm_test");
require("test/jquery/conflict_test");
