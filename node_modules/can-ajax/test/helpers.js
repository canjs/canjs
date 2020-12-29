'use strict';
var getGlobal = require('can-globals/global/global');

function isProduction () {
	var root = getGlobal();

	if (root.System) {
		return root.System.env.indexOf('production') !== -1;
	}

	if (root.process) {
		var nodeEnv = root.process.env.NODE_ENV;
		return nodeEnv === 'production' || nodeEnv === 'window-production';
	}

	return false;
}

function isServer () {
	var root = getGlobal();
	var testType = root.process && root.process.env.TEST;
	return testType === 'qunit';
}

module.exports = {
	isProduction: isProduction,
	isServer: isServer
};
