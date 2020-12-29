var g = require("./global");

module.exports = {
	amd: require("./amd"),
	cjs: require("./cjs"),
	"global-js": g.js,
	"global-css": g.css,
	standalone: require("./standalone"),
	"bundled-es": require("./bundled-es")
};
