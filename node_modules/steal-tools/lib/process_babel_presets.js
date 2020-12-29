var _ = require("lodash");
var path = require("path");
var babel = require("babel-standalone");

/**
 * A Babel preset as defined in `babelOptions.presets`
 * @typedef {string|Function|Object|<string, Object>[]|<Function, Object>[], <Object, Object>} BabelPreset
 */

/**
 * The options needed to load presets not built in babel-standalone
 * @typedef {Object} LoadCustomPluginsOptions
 * @property {string} baseURL The loader baseURL value
 * @property {string} loaderEnv The loader env value
 * @property {Object} babelOptions The babel configuration options
 */

/**
 * Returns a list of babel presets to be used by transpile
 * @param {LoadCustomPresetsOptions} opts The options object
 * @return {BabelPreset[]} The list of presets to be used by transpile
 */
module.exports = function(opts) {
	var processed = [];
	var babelOptions = opts.babelOptions || {};
	var babelEnvConfig = babelOptions.env || {};

	var babelEnv = process.env.BABEL_ENV ||
		process.env.NODE_ENV ||
		opts.loaderEnv;

	// process presets in babelOptions.presets
	processed = processed.concat(processPresets(opts.baseURL, babelOptions.presets));

	// process environment dependant presets
	_.keys(babelEnvConfig).forEach(function(envName) {
		// do not process presets if the current environment does not match
		// the environment in which the presets are set to be used
		if (envName === babelEnv) {
			var presets = babelEnvConfig[envName].presets || [];
			processed = processed.concat(processPresets(opts.baseURL, presets));
		}
	});

	return processed;
};

/**
 * Collect built in preset names and non builtin presets functions/objects
 * @param {string} baseURL The loader baseURL value
 * @param {BabelPreset[]} presets An array of babel presets
 * @return {BabelPreset[]} An array of babel presets with non-builtins replaced
 *                         by their respective functions/objects
 */
function processPresets(baseURL, presets) {
	var normalized = [];

	// path.resolve does not work correctly if baseURL starts with "file:"
	baseURL = baseURL.replace("file:", "");
	presets = presets || [];

	presets.forEach(function(preset) {
		var name = getPresetName(preset);

		if (!includesPresetName(preset) || isBuiltinPreset(name)) {
			normalized.push(preset);
		}
		else if (!isBuiltinPreset(name)) {
			var npmPresetNameOrPath = getNpmPresetNameOrPath(baseURL, name);

			// load the preset!
			var presetDefinition = require(npmPresetNameOrPath);

			if (_.isString(preset)) {
				normalized.push(presetDefinition);
			}
			else if (_.isArray(preset)) {
				// [ presetDefinition, presetOptions ]
				normalized.push([presetDefinition, preset[1]]);
			}
		}
	});

	return normalized;
}

/**
 * Gets the babel preset name
 * @param {BabelPreset} preset A babel preset
 * @return {?string} The preset name
 */
function getPresetName(preset) {
	if (includesPresetName(preset)) {
		return _.isString(preset) ? preset : _.head(preset);
	}
	else {
		return null;
	}
}

/**
 * Whether the babel preset name was provided
 * @param {BabelPreset} preset
 * @return {boolean}
 */
function includesPresetName(preset) {
	return _.isString(preset) ||
		_.isArray(preset) && _.isString(_.head(preset));
}

function getNpmPresetNameOrPath(baseURL, name) {
	var isPath = /\//;
	var isNpmPresetName = /^(?:babel-preset-)/;

	if (isPath.test(name)) {
		return path.resolve(baseURL, name);
	}
	else if (!isNpmPresetName.test(name)) {
		return "babel-preset-" + name;
	}

	return name;
}

/**
 * Whether the preset is built in babel-standalone
 *
 * @param {string} name A preset path
 * @return {boolean} `true` if preset is builtin, `false` otherwise
 *
 * Babel presets can be set using the following variations:
 *
 * 1) the npm preset name, which by convention starts with `babel-preset-`
 * 2) A shorthand name, which is the npm name without the prefix
 * 3) A path to where the preset is defined
 *
 * babel-standalone registers the builtin presets using the shorthand version.
 */
function isBuiltinPreset(name) {
	var isNpmPresetName = /^(?:babel-preset-)/;
	var availablePresets = babel.availablePresets || {};

	var shorthand = isNpmPresetName.test(name) ?
		name.replace("babel-preset-", "") :
		name;

	return !!availablePresets[shorthand];
}
