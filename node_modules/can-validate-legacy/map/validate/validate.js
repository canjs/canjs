"use strict";
var assign = require("can-assign");

var Map = require("can-map");
var canReflect = require("can-reflect");
var validate = require("can-validate-legacy");
var compute = require("can-compute");

var deepAssign = function() {
	var objects = [].slice.call(arguments);
	var out = {};

	for (var i=0; i<objects.length; i++) {
		assign(out, objects[i]);
	}

	return out;
};

var isEmptyObject = function(value) {
	return canReflect.size(value) === 0;
};

var proto = Map.prototype;
var oldSet = proto.__set;
var ErrorsObj;
var defaultValidationOpts;
var config = {
	errorKeyName: "errors",
	validateOptionCacheKey: "validateOptions"
};

var resolveComputes = function (itemObj, opts) {
	var processedObj = {};

	// Loop through each validation option
	canReflect.eachKey(opts, function (item, key) {
		var actualOpts = item;
		if (typeof item === "function") {
			// create compute and add it to computes array
			actualOpts = item(itemObj.value);
		}
		// build the map for the final validations object
		processedObj[key] = actualOpts;
	});
	return processedObj;
};

// Gets properties from the map"s define property.
var getPropDefineBehavior = function (behavior, attr, define) {
	var prop;
	var defaultProp;

	if (define) {
		prop = define[attr];
		defaultProp = define["*"];

		if (prop && prop[behavior] !== undefined) {
			return prop[behavior];
		} else {
			if (defaultProp && defaultProp[behavior] !== undefined) {
				return defaultProp[behavior];
			}
		}
	}
};

// Default Map for errors object. Useful to add instance helpers
ErrorsObj = Map.extend({}, {
	hasErrors: function () {
		return !isEmptyObject(this.attr());
	}
});

// Default validation options to extend passed options from
defaultValidationOpts = {
	mustValidate: false,
	validateOnInit: false
};

var getValidateFromCache = function () {
	var validateCacheKey = "__" + config.validateOptionCacheKey;

	// Create cache object in map instance, if it doesn't exist
	if (!this[validateCacheKey]) {
		this[validateCacheKey] = {};
	}

	return this[validateCacheKey];
};

var initProperty = function (key, value) {
	var validateOpts;
	var mapValidateCache;
	var propIniting;

	// Creat shortcut to cache
	mapValidateCache = getValidateFromCache.call(this);

	// If validate options don't exist in cache for current prop, create them
	if (mapValidateCache[key] && !isEmptyObject(mapValidateCache[key])) {
		validateOpts = mapValidateCache[key];
		propIniting = false;
	} else {
		// Copy current prop"s validation properties to cache
		validateOpts = assign({}, getPropDefineBehavior("validate", key, this.define));
		// Need to build computes in the next step
		propIniting = true;
	}

	// Do validate if prop has any validate options
	if (typeof validateOpts !== "undefined") {
		//create validation computes only when initing the map
		if (propIniting) {
			validateOpts = deepAssign(
				defaultValidationOpts,
				validateOpts,
				// Find any functions, converts them to computes and returns
				// nice object for shim to use
				this._processValidateOpts({key: key, value: value}, validateOpts)
			);
			mapValidateCache[key] = validateOpts;
		}
		return true;
	}
	return false;
};

// add method to prototype that validates entire map
var oldSetup = proto.setup;
var oldInit = proto.init;
proto.setup = function () {
	this._initValidate = true;
	oldSetup.apply(this, arguments);
};
proto.init = function () {
	this._initValidation();
	this._initValidate = false;

	if (oldInit) {
		oldInit.apply(this, arguments);
	}
};
assign(Map.prototype, {
	_initValidation: function () {
		var self = this;
		var validateCache = getValidateFromCache.call(this);
		canReflect.eachKey(this.define, function (props, key) {
			if (props.validate && !validateCache[key]) {
				initProperty.call(self, key, self[key]);
			}
		});
	},

	/**
	* @function validate Validate
	* @deprecated {1.0} `validate` is deprecated and will be removed in version 1.0.
	* Use `_validate` instead.
	*
	* @description Runs validation on the entire map instance. Actual behavior of
	* "validate all" is defined by the registered shim.
	*/
	validate: function () {
		return this._validate();
	},

	/**
	* @function _validate _Validate
	* @hide
	* @description Runs validation on the entire map instance. Actual behavior of
	* "validate all" is defined by the registered shim (`validate`).
	*/
	_validate: function () {
		var validateOpts = getValidateFromCache.call(this);
		var processedOpts = {};
		var self = this;

		// Loop through validate options
		canReflect.eachKey(this.define, function (value, key) {
			if (value.validate) {
				processedOpts[key] = resolveComputes({key: key, value: self.attr(key)}, validateOpts[key]);
			}
		});
		var errors = validate.validate(this.serialize(), processedOpts);

		// Process errors if we got them
		// TODO: This creates a new instance every time.
		this.attr("errors", new ErrorsObj(errors));

		return isEmptyObject(errors);
	},
	/**
	* @function _validateOne Validate One
	* @hide
	* @description Main method used by `Map.define` setter when a property changes.
	*  Runs validation on a property. Actual behavior of "validate one" is defined
	*  by the registered shim (`once`).
	*
	*  It also handles setting the errors property on the map instance and then
	* manages the errors for the current property within the errors object.
	*
	* @param {object} item A key/value object
	* @param {object} opts Object that contains validation config.
	* @return {boolean} True if method found that the property can be saved; if
	*  validation fails and the property must validate (`mustValidate` property),
	*  this will be `false`.
	*/
	_validateOne: function (item, opts) {
		var errors;
		var allowSet = true;

		// run validation
		errors = validate.once(item.value, assign({}, opts), item.key);

		// Process errors if we got them
		if (errors && errors.length > 0) {
			// Create errors property if doesn't exist
			if (!this.attr("errors")) {
				this.attr("errors", new ErrorsObj({}));
			}

			// Apply error response to observable
			this.attr("errors").attr(item.key, errors);

			// Don't set value if `mustValidate` is true
			if (opts.mustValidate === true) {
				allowSet = false;
			}
		} else {
			// clear errors for this property if they exist
			if (this.attr("errors") && this.attr("errors").attr(item.key)) {
				this.attr("errors").removeAttr(item.key);
			}
		}

		return allowSet;
	},

	/**
	* @function _processValidateOpts Process Validate Opts
	* @hide
	* @description Allows the ability to pass computes in validation properties,
	* this allows for things like making a property required based on the value on
	* another property.
	*
	* Processes validation options, creates computes from functions and adds
	* listeners to computes.
	* @param {object} itemObj Property to validate
	* @param {object} opts Map of validation options
	*/
	_processValidateOpts: function (itemObj, opts) {
		var processedObj = {};
		var computes = [];
		var self = this;

		// Loop through each validation option
		canReflect.eachKey(opts, function (item, key) {
			processedObj[key] = item;
			if (typeof item === "function") {
				// create compute and add it to computes array
				var newCompute = compute(item.bind(self));
				computes.push({key: key, compute: newCompute});
				processedObj[key] = newCompute;
			}
		});

		// Using the computes array, create necessary listeners
		// We do this afterwards instead of inline so we can have access
		// to the final set of validation options.
		canReflect.each(computes, function (item) {
			item.compute.bind("change", function () {
				itemObj.value = self.attr(itemObj.key);
				self._validateOne(itemObj, processedObj);
			});
		});

		return processedObj;
	}
});

// Override the prototype"s __set with a more validate-y one.
proto.__set = function (prop, value, current, success, error) {
	// allowSet is changed only if validation options exist and validation returns errors
	var allowSet = true;
	var checkValidate = initProperty.call(this, prop, value);
	var validateOpts = getValidateFromCache.call(this)[prop];
	var mapIniting = this._initValidate;

	if (checkValidate !== false) {
		validateOpts = resolveComputes({key: prop, value: value}, validateOpts);
		// If validate opts are set and not initing, validate properties
		// If validate opts are set and initing, validate properties only if validateOnInit is true
		if ((validateOpts && !mapIniting) || (validateOpts && mapIniting && validateOpts.validateOnInit)) {
			// Validate item
			allowSet = this._validateOne({key: prop, value: value}, validateOpts);
		}
	}

	// Call old __set, in most cases, this will be the define plugin"s set.
	if (allowSet) {
		oldSet.call(this, prop, value, current, success, error);
	}
};
