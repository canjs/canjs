"use strict";

exports.moduleNameFromSpecifier = function(node, identifier) {
	let identifiers = node.load.metadata.deps;
	let moduleNames = node.load.metadata.dependencies;

	//let identifiers = node.load.metadata.deps;
	let idx = identifiers.indexOf(identifier);
	return moduleNames[idx];
};

exports.moduleSpecifierFromName = function(node, name){
	let specifiers = node.load.metadata.deps;
	let moduleNames = node.load.metadata.dependencies;

	let idx = moduleNames.indexOf(name);
	return specifiers[idx];
};
