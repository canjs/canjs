var through = require("through2");
var checkAtSteal = require("../slim/checks/steal");

module.exports = function() {
	return through.obj(function(data, enc, done) {
		try {
			checkSupport(data);
			done(null, data);
		} catch (err) {
			done(err);
		}
	});
};

function checkSupport(data) {
	checkAtSteal(data.loader.configMain || "package.json!npm", data.graph);
}
