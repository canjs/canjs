var FuncUnit = require("funcunit/browser/core");

module.exports = function() {
	FuncUnit.timeout = 4900;

	return {
		pauseTest: function(){},
		resumeTest: function(){},
		assertOK: function(assertion) {
			expect(assertion).toBeTruthy();
		},
		equiv: function(expected, actual) {
			return expected == actual;
		}
	};
};
