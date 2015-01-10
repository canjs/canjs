var mods = require('../builder.json').modules;

var modules = [];

for(var moduleName in mods) {
	var mod = mods[moduleName];
	mod.moduleName = moduleName;
	modules.push(mod);
}

module.exports = modules;

