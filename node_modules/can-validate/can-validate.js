"use strict";
var canReflect = require('can-reflect');

var validate = {};

var helpers = {
	'object': function (normalizedErrors) {
		var errors = normalizedErrors.length > 0 ? {}: undefined;

		canReflect.eachIndex(normalizedErrors, function (error) {
			canReflect.eachIndex(error.related, function (related) {
				if (!errors[related]) {
					errors[related] = [];
				}
				errors[related].push(error.message);
			});
		});
		return errors;
	},
	'flat': function (normalizedErrors) {
		var errors = normalizedErrors.length > 0 ? []: undefined;
		canReflect.eachIndex(normalizedErrors, function (error) {
			errors.push(error.message);
		});
		return errors;
	},
	'errors': function (normalizedErrors) {
		return normalizedErrors.length > 0 ? normalizedErrors: undefined;
	},
	'errors-object': function (normalizedErrors) {
		var errors = normalizedErrors.length > 0 ? {}: undefined;
		canReflect.eachIndex(normalizedErrors, function (error) {
			canReflect.eachIndex(error.related, function (related) {
				if (!errors[related]) {
					errors[related] = [];
				}
				errors[related].push(error);
			});
		});
		return errors;
	}
};

var parseErrorItem = function (rawErrors) {
	var errors = [];
	if (typeof rawErrors === 'string') {
		errors.push({message: rawErrors, related: ['*']});
	}
	if (typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
		// Although related can be a string, internally, it is easier if it is
		// always an array
		if (rawErrors.related) {
			if (!Array.isArray(rawErrors.related)) {
				rawErrors.related = [rawErrors.related];
			}
		} else {
			rawErrors.related = '*';
		}
		errors.push(rawErrors);
	}
	if (Array.isArray(rawErrors)) {
		canReflect.eachIndex(rawErrors, function (error) {
			[].push.apply(errors, parseErrorItem(error));
		});
	}
	return errors;
};

// Takes errors and normalizes them
var normalizeErrors = function (rawErrors) {
	var normalizedErrors = [];
  if (
    typeof rawErrors === 'string' ||
    (typeof rawErrors === 'object' && !Array.isArray(rawErrors))
  ) {
		// Only one error set, which we can assume was for a single property
		rawErrors = [rawErrors];
	}

  if (rawErrors != null) {
    canReflect.eachIndex(rawErrors, function (error) {
      [].push.apply(normalizedErrors, parseErrorItem(error));
    });
  }

	return normalizedErrors;
};

validate.formatErrors = function (errors, format) {
	var normalized = normalizeErrors(errors);
	if (format) {
		if (helpers[format]) {
			return helpers[format](normalized);
		} else {
			return normalized;
		}
	} else {
		return normalized;
	}
};

module.exports = validate;
