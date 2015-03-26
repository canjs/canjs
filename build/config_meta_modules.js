var mods = require('../builder.json').modules;
var pkg = require("../package.json");

var npmPrefix = pkg.name + "@" + pkg.version + "#";

var modules = [];

for(var moduleName in mods) {
	var mod = mods[moduleName];
	mod.moduleName = moduleName//.replace("can/","");
	modules.push(mod);
}

module.exports = modules;
