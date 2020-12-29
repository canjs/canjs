define(["module", "exports"], function(module, exports) {
	exports.extensionBuilder = "steal-conditional/slim";

	function addConditionals(loader) {
		var conditionalRegEx = /#\{[^\}]+\}|#\?.+$/;

		var isNode = typeof process === "object" &&
			{}.toString.call(process) === "[object process]";

		if (loader._extensions) {
			loader._extensions.push(addConditionals);
		}

		loader._conditionalModuleDeps = {};
		loader.set("@@conditional-helpers", loader.newModule({
			isConditionalModuleName: function(moduleName){
				return conditionalRegEx.test(moduleName);
			}
		}));

		var normalize = loader.normalize;

		function readMemberExpression(p, value) {
			var pParts = p.split(".");
			while (pParts.length) {
				value = value[pParts.shift()];
			}
			return value;
		}

		function includeInBuild(loader, name) {
			var load = loader.getModuleLoad(name);
			load.metadata.includeInBuild = true;
		}

		function markForMetadata(loader, parentName, name) {
			let deps = loader._conditionalModuleDeps[parentName];
			if(!deps) {
				deps = loader._conditionalModuleDeps[parentName] = [];
			}
			pushIfUnique(deps, name);
		}

		// get some node modules through @node-require which is a noop in the browser
		function getGlob() {
			if (isNode) {
				return loader.import("@node-require", { name: module.id })
					.then(function(nodeRequire) {
						return nodeRequire("glob");
					});
			}

			return Promise.resolve();
		}

		function pushIfUnique(array, item) {
			return array.indexOf(item) === -1 ? array.push(item) : array.length;
		}

		/**
		 * Returns the bundle module name for a string substitution
		 * @param {string} nameWithConditional The module identifier including the condition
		 * @param {string} variation A match of the glob pattern
		 * @return {string} The bundle module name
		 */
		function getModuleName(nameWithConditional, variation) {
			var modName;
			var conditionIndex = nameWithConditional.search(conditionalRegEx);

			// look for any "/" after the condition
			var lastSlashIndex = nameWithConditional.indexOf("/",
				nameWithConditional.indexOf("}"));

			// substitution of a folder name
			if (lastSlashIndex !== -1) {
				modName = nameWithConditional.substr(0, conditionIndex) + variation;
			}
			else {
				modName = nameWithConditional.replace(conditionalRegEx, variation);
			}

			return modName;
		}

		loader.normalize = function(name, parentName, parentAddress, pluginNormalize) {
			var loader = this;

			var conditionalMatch = name.match(conditionalRegEx);
			if (conditionalMatch) {
				var substitution = conditionalMatch[0][1] !== "?";

				var conditionModule = substitution ?
					conditionalMatch[0].substr(2, conditionalMatch[0].length - 3) :
					conditionalMatch[0].substr(2);

				var conditionExport = "default";
				var conditionExportParts = conditionModule
					.match(/^(?:\.\/|\.\.\/)+/); // split './' or '../' in relative names

				var conditionExportIndex = conditionModule.indexOf(".",
					conditionExportParts && conditionExportParts[0].length); // only look for export

				if (conditionExportIndex !== -1) {
					conditionExport = conditionModule.substr(conditionExportIndex + 1);
					conditionModule = conditionModule.substr(0, conditionExportIndex);
				}

				var booleanNegation = !substitution && conditionModule[0] === "~";
				if (booleanNegation) {
					conditionModule = conditionModule.substr(1);
				}

				var handleConditionalBuild = function() {};

				/**
				 * Adds bundles needed to load conditional modules in production
				 *
				 * Conditional modules are loaded dynamically, these modules are
				 * not part of the dependency graph and steal-tools has to create
				 * individual bundles for each of them.
				 *
				 * ** The boolean syntax **
				 *
				 * After removing the condition from the module identifier, the
				 * result is the identifier of the module that could be loaded
				 * during runtime, e.g:
				 *
				 * With an indentifier like: `es5-shim#?conditions.needs-es5shim`,
				 * removing everything after the condition gives us back `es5-shim`
				 * which is then configured to be made its own bundle by steal-tools.
				 *
				 * ** The substitution syntax **
				 *
				 * This one is more involved, since there is no way statically to
				 * figure out all of the possible string substitution value. The
				 * following algorithm is used to detect them:
				 *
				 * 1) The condition is replaced by a placeholder in the module
				 *    identifier; e.g: `jquery/#{browser.grade}` is turned into
				 *    `jquery/__PLACEHOLDER__`.
				 *
				 * 2) The result of step 1 is normalised
				 *
				 * 3) The placeholder is replaced by `*` which results in a module
				 *    name that looks like: `app@0.0.1#jquery/*`
				 *
				 * 4) The module name from step 3 is run through `locate` which
				 *    returns the address where the variations are located.
				 *
				 * 5) The address is then turned into a glob pattern and used to
				 *    match the files that could be loaded
				 *
				 * 6) The process is then reverted; the modules addresses are turned
				 *    into module names which will be set to `loader.bundle` so
				 *    bundles are created for each of them.
				 */
				//!steal-remove-start
				handleConditionalBuild = function() {
					var nameWithConditional = name;
						var PLACEHOLDER = "__PLACEHOLDER__";
						var normalizedConditionModule;

					// remove the conditional and the trailing slash
					var nameSansConditional = nameWithConditional
						.replace(conditionalRegEx, PLACEHOLDER)
						.replace(/\/+$/, "");

					var normalizeConditionModule = loader.normalize(
						conditionModule,
						parentName,
						parentAddress,
						pluginNormalize
					);

					var normalizeNameSansConditional = loader.normalize(
						nameSansConditional,
						parentName,
						parentAddress,
						pluginNormalize
					);

					var setLoaderConfig = Promise
						.all([
							normalizeNameSansConditional,
							normalizeConditionModule
						])
						// normalize the identifiers that make the condition
						// on their own then re-build the condition
						.then(function(names) {
							var res;
							var id = names[0];
							var cond = names[1];
							normalizedConditionModule = cond;

							if (conditionExportIndex !== -1) {
								cond = cond + "." + conditionExport;
							}

							if (substitution) {
								res = id.replace(PLACEHOLDER, "#{" + cond + "}");
							} else {
								var prefix = booleanNegation ? "#?~" : "#?";
								res = id.replace(PLACEHOLDER, prefix + cond);
							}

							return [res, names[1]];
						})
						.then(function(names) {
							if (loader.normalizeMap) {
								loader.normalizeMap[nameWithConditional] = names[0];
							}
							if (loader.slimConfig) {
								pushIfUnique(loader.slimConfig.extensions, module.id);
								pushIfUnique(loader.slimConfig.identifiersToResolve, names[0]);
								pushIfUnique(loader.slimConfig.toMap, names[1]);
							}
						});

					// make sure loader.bundle is an array
					loader.bundle =
						typeof loader.bundle === "undefined" ? [] : loader.bundle;

					if (substitution) {
						var glob = null;

						setLoaderConfig = setLoaderConfig
							.then(function() {
								return getGlob();
							})
							.then(function(nodeGlob) {
								// in the browser we don't load the node modules
								if (!nodeGlob) {
									throw new Error("glob module not loaded");
								}

								// make glob available down the pipeline
								glob = nodeGlob;

								// call the full normalize in case the condition
								// module is using the tilde lookup scheme or the
								// package name
								return normalizeNameSansConditional;
							})
							.then(function(normalized) {
								return loader.locate({
									metadata: {},
									name: normalized.replace(PLACEHOLDER, "*")
								});
							})
							.then(function(address) {
								var path = address.replace("file:", "");
								var cwd = path.substr(0, path.indexOf("*"));
								var pattern = path.substring(path.indexOf("*"));

								return new Promise(function(resolve, reject) {
									var options = {
										cwd: cwd,
										dot: true,
										nobrace: true,
										noglobstar: true,
										noext: true,
										nodir: true
									};

									glob(pattern, options, function(err, files) {
										if (err) { reject(err); }
										resolve(files);
									});
								});
							})
							.then(function(variations) {
								var promises = [];

								/*
								 * With an conditional import like this:
								 *
								 * import 'locate/#{lang}';
								 *
								 * and an app tree that looks like the one below:
								 *
								 * locale
								 * ├── ar.js
								 * ├── en.js
								 * ├── es.js
								 * ├── hi.js
								 * └── zh.js
								 *
								 * `variations` will be an array of the files
								 * relative to the `locale` folder, e.g:
								 *
								 * `['ar.js', 'en.js', 'es.js', 'hi.js', 'zh.js']`
								 *
								 * we iterate over the array, remove the extension,
								 * then take the original module name with the
								 * substitution syntax and replace it with the
								 * variation name, after this we get the following
								 * modules names:
								 *
								 * `['locale/ar', 'local/en', ..., 'locale/zh']`
								 *
								 * We run each of those module names through the
								 * `normalize` hook to handle any relative paths,
								 * and finally we add them to `loader.bundle` (if
								 * not added already) to make sure we get bundles
								 * for each variation when the app is built.
								 */
								for (var i = 0; i < variations.length; i += 1) {
									var variation = variations[i];

									// remove the extension
									variation = variation.substr(0, variation.lastIndexOf("."));
									var modName = getModuleName(nameWithConditional, variation);

									var promise = loader.normalize.call(loader, modName,
										parentName, parentAddress, pluginNormalize);

									promises.push(promise.then(function(normalized) {
										var isBundle = loader.bundle.indexOf(normalized) !== -1;

										if (!isBundle) {
											loader.bundle.push(normalized);
										}
									}));
								}

								return Promise.all(promises);
							});
					}
					// boolean conditional syntax
					else {
						loader.bundle.push(name.replace(conditionalRegEx, ""));
					}

					name = "@empty";
					return setLoaderConfig.then(function() {
						return Promise.resolve(normalize.call(
							loader,
							name,
							parentName,
							parentAddress,
							pluginNormalize
						)).then(function(normalizedName) {
							markForMetadata(loader, normalizedName, normalizedConditionModule);
							return normalizedName;
						});
					});
				};
				//!steal-remove-end

				var handleConditionalEval = function(m, conditionModule) {
					var conditionValue = (typeof m === "object") ?
						readMemberExpression(conditionExport, m) : m;

					if (substitution) {
						if (typeof conditionValue !== "string") {
							throw new TypeError(
								"The condition value for " +
									conditionalMatch[0] +
									" doesn't resolve to a string."
							);
						}

						name = name.replace(conditionalRegEx, conditionValue);
					}
					else {
						if (typeof conditionValue !== "boolean") {
							throw new TypeError(
								"The condition value for " +
									conditionalMatch[0] +
									" isn't resolving to a boolean."
							);
						}
						if (booleanNegation) {
							conditionValue = !conditionValue;
						}
						if (!conditionValue) {
							name = "@empty";
						} else {
							name = name.replace(conditionalRegEx, "");
						}
					}

					if (name === "@empty") {
						return normalize.call(loader, name, parentName, parentAddress, pluginNormalize);
					} else {
						// call the full normalize in case the module name
						// is an npm package (that needs to be normalized)
						return loader.normalize.call(loader, name, parentName, parentAddress, pluginNormalize)
						.then(function(normalizedName) {
							markForMetadata(loader, normalizedName, conditionModule);
							return normalizedName;
						});
					}
				};

				var isBuild = (loader.env || "").indexOf("build") === 0;
				var pluginLoader = isBuild ? loader : (loader.pluginLoader || loader);

				return pluginLoader["import"](conditionModule, { name: parentName, address: parentAddress })
					.then(function(m) {
						return pluginLoader
							.normalize(conditionModule, parentName, parentAddress, pluginNormalize)
							.then(function(fullName) {
								includeInBuild(pluginLoader, fullName);
								return { m: m, fullName: fullName };
							});
					})
					.then(function(res) {
						return isBuild ?
							handleConditionalBuild(res.fullName) :
							handleConditionalEval(res.m, res.fullName);
					});
			}

			return Promise.resolve(normalize.call(loader, name, parentName, parentAddress, pluginNormalize));
		};

		var locate = loader.locate;

		loader.locate = function(load) {
			if(loader._conditionalModuleDeps[load.name]) {
				load.metadata.conditionDependencies = loader._conditionalModuleDeps[load.name];
			}

			return locate.apply(this, arguments);
		};
	}

	if (typeof System !== "undefined") {
		addConditionals(System);
	}
});
