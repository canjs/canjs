module.exports = function(stealRequire) {
	var conditionalRegEx = /#\{[^\}]+\}|#\?.+$/;

	var superResolve = stealRequire.resolve;
	stealRequire.resolve = function(id, config) {
		return isConditional(id)
			? resolveFinalModuleId(id, config)
			: superResolve(id, config);
	};

	function resolveFinalModuleId(id, config) {
		return new Promise(function(resolve, reject) {
			var finalModuleId = getFinalModuleId(id, config);

			if (finalModuleId === "@empty") {
				resolve("@empty");
			} else {
				var slimModuleId = config.map[getFinalModuleId(id, config)];

				if (typeof slimModuleId === "undefined") {
					reject(new Error("Cannot find module: " + finalModuleId));
				}

				return stealRequire
					.dynamic(slimModuleId)
					.then(function() {
						resolve(slimModuleId);
					})
					.catch(reject);
			}
		});
	}

	function isConditional(identifier) {
		return Boolean(getConditionParts(identifier).length);
	}

	function getConditionParts(identifier) {
		return identifier.match(conditionalRegEx);
	}

	function readMemberExpression(p, value) {
		var parts = p.split(".");
		while (parts.length) {
			value = value[parts.shift()];
		}
		return value;
	}

	function getFinalModuleId(condition, config) {
		var moduleId = condition;

		var conditionalMatch =
			typeof moduleId === "string" ? getConditionParts(moduleId) : null;

		if (conditionalMatch) {
			var substitution = conditionalMatch[0][1] !== "?";

			var conditionModule = substitution
				? conditionalMatch[0].substr(2, conditionalMatch[0].length - 3)
				: conditionalMatch[0].substr(2);

			var conditionExport = "default";

			/**
             * Get the index where the member expression is located (if any)
             *
             * The conditionModule can look like any of the examples below:
             *
             *    ./foo/bar.needsPolyfill
             *    ../foo/bar.needsPolyfill
             *    bar.needsPolyfill
             *
             * 1) split './' or '../' in relative names
             * 2) get the index of the member expression "." from the last index
             *    of the relative paths if any.
             */
			var conditionExportParts = conditionModule.match(/^(?:\.\/|\.\.\/)+/);

			var conditionExportIndex = conditionModule.indexOf(
				".",
				conditionExportParts && conditionExportParts[0].length
			);

			if (conditionExportIndex !== -1) {
				conditionExport = conditionModule.substr(conditionExportIndex + 1);
				conditionModule = conditionModule.substr(0, conditionExportIndex);
			}

			var booleanNegation = !substitution && conditionModule[0] === "~";
			if (booleanNegation) {
				conditionModule = conditionModule.substr(1);
			}

			// need to turn conditionModule into a numeric id somehow.
			var actualConditionModule = stealRequire(config.map[conditionModule]);

			var conditionValue =
				typeof actualConditionModule === "object"
					? readMemberExpression(conditionExport, actualConditionModule)
					: actualConditionModule;

			if (substitution) {
				moduleId = moduleId.replace(conditionalRegEx, conditionValue);
			} else {
				if (booleanNegation) {
					conditionValue = !conditionValue;
				}
				moduleId = conditionValue
					? moduleId.replace(conditionalRegEx, "")
					: "@empty";
			}
		}

		return moduleId;
	}
};
