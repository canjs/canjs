var dotdotSlashX3 = require("~/some/deep/#{../../../some/deep/folder/which}");
var dotdotSlashX3AndExport = require("~/some/deep/#{../../../some/deep/folder/which.foo}");

QUnit.test("works with relative condition module reference", function(assert) {
	assert.equal(dotdotSlashX3, "bar", "should load '~/some/deep/foo'");
	assert.equal(dotdotSlashX3AndExport, "bar", "should load '~/some/deep/foo'");
});
