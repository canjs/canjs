'use strict';

function flatten(arrays) {
	return arrays.reduce(function(ret, val) {
		return ret.concat(val);
	}, []);
}

// return a function that validates it's argument has all the properties in the interfacePropArrays
function makeInterfaceValidator(interfacePropArrays) {
	var props = flatten(interfacePropArrays);

	return function(base) {
			var missingProps = props.reduce(function(missing, prop) {
				return prop in base ? missing : missing.concat(prop);
			}, []);

		return missingProps.length ? {message:"missing expected properties", related: missingProps} : undefined;
	};
}

module.exports = makeInterfaceValidator;
