var testee = require("testee");

testee.test(['test.html'], [{
	"os": "windows",
	"os_version": "10",
	"browser": "chrome",
	"browser_version": "latest"
},]).then(function() {
	process.exitCode = 0;
}, function() {
	process.exitCode = 1;
});
