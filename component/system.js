define(["@loader", "can/view/stache/mustache_core", "can/view/parser/parser"], function(loader, mustacheCore, parser){

	var interop = function(mod){
		if(mod && mod["default"]) return mod["default"];
	};

	function parse(source){
		var template = mustacheCore.cleanLineEndings(source),
			tags = {
				"can-component": true,
				"style": true,
				"template": true,
				"view-model": true,
				"events": true,
				"helpers": true,
				"can-import": true
			},
			areIn = {},
			texts = {
				style: "",
				"view-model": "",
				events: "",
				helpers: ""
			},
			types = {},
			attrs = {},
			values = {},
			imports = [],
			ases = {},
			currentTag = "",
			currentAttr = "",
			tagName = "",
			keepToken = function(){
				// We only want to keep the template's tokens.
				return !!areIn.template;
			};

		var intermediate = parser(template, {
			start: function(tagName){
				// Mark when we are inside one of the tags.
				if(tags[tagName]) {
					currentTag = tagName;
					areIn[tagName] = true;
				}
				return keepToken();
			},
			attrStart: function(attrName){
				currentAttr = attrName;
				return keepToken();
			},
			attrEnd: function(attrName){
				currentAttr = "";
				return keepToken();
			},
			attrValue: function(value){
				if(areIn["can-component"] && currentAttr === "tag") {
					tagName = value;
				}
				if(areIn["can-import"] && currentAttr === "from") {
					imports.push(value);
				}
				if(currentAttr === "type" && tags[currentTag]) {
					types[currentTag] = (value+"").replace("text/", "");
				}
				attrs[currentAttr] = value;
				return keepToken();
			},
			end: function(tagName){
				if(tagName === "can-import") {
					if(attrs.as) {
						ases[attrs.as] = attrs.from;
					}

					attrs.as = false;
					attrs.from = false;
				}
				return keepToken();
			},
			close: function(tagName){
				if(tagName === "can-import") {
					imports.pop();
				}
				if(tags[tagName]) {
					areIn[tagName] = false;
				}
				return keepToken();
			},
			special: keepToken,
			chars: function(char){
				if(texts[currentTag] != null) {
					texts[currentTag] += char;
				}
				return keepToken();
			},
			done: function(){}
		}, true);

		// Remove the leading template noise.
		var idx = 0, cur = intermediate[0];
		while(cur.tokenType !== "end" || (cur.args ? cur.args[0] !== "template" : true)) {
			intermediate.shift();
			cur = intermediate[0];
		}
		// Remove the template end
		intermediate.shift();

		return {
			intermediate: intermediate,
			imports: imports,
			tagName: tagName,
			texts: texts,
			types: types
		};
	}

	function namer(loadName){
		var baseName = loadName.substr(0, loadName.indexOf("!"));

		return function(part, plugin){
			return baseName + "/" + part + (plugin ? ("." + plugin) : "");
		};
	}

	function addresser(loadAddress, name, plugin){
		return function(part){
			var base = loadAddress + "/" + part;
			return base + "." + (plugin || "js");
		};
	}

	function templateDefine(intermediateAndImports){
		var intermediate = intermediateAndImports.intermediate;
		var imports = intermediateAndImports.imports;
		imports.unshift("can/component/component");
		imports.unshift("can/view/stache/stache");

		return "def" + "ine(" + JSON.stringify(imports) + ", function(stache){\n" +
			"\treturn stache(" + JSON.stringify(intermediate) + ");\n" +
			"});";
	}

	function translate(load){
		var result = parse(load.source),
			tagName = result.tagName,
			texts = result.texts,
			types = result.types,
			deps = ["can/component/component"],
			ases = ["Component"],
			stylePromise;

		loader = loader.localLoader || loader;

		var name = namer(load.name);
		var address = addresser(load.address);

		// Define the styles
		stylePromise = Promise.resolve();
		if(texts.style) {
			var styleText = tagName + " {\n" + texts.style + "}\n";
			var styleName = name("style", types.style);
			var styleLoad = {};

			var normalizePromise = loader.normalize(styleName + "!");
			var locatePromise = normalizePromise.then(function(name){
				styleLoad = { name: name, metadata: {} };
				return loader.locate(styleLoad);
			});
			stylePromise = locatePromise.then(function(){
				loader.define(styleName, styleText, {
					metadata: styleLoad.metadata,
					address: address("style", types.style)
				});
			});
		}

		// Define the template
		if(result.intermediate.length) {
			var templateName = name("template");
			deps.push(templateName);
			ases.push("template");
			loader.define(templateName, templateDefine(result), {
				address: address("stache")
			});
		}

		// Define the viewModel
		if(texts["view-model"]) {
			var viewModelName = name("view-model");
			deps.push(viewModelName);
			ases.push("viewModel");
			loader.define(viewModelName, texts["view-model"], {
				address: address("view-model")
			});
		}

		// Define events
		if(texts.events) {
			var eventsName = name("events");
			deps.push(eventsName);
			ases.push("events");
			loader.define(eventsName, texts.events, {
				address: address("events")
			});
		}

		// Define helpers
		if(texts.helpers) {
			var helpersName = name("helpers");
			deps.push(helpersName);
			ases.push("helpers");
			loader.define(helpersName, texts.helpers, {
				address: address("helpers")
			});
		}

		return stylePromise.then(function(){
			return "def" + "ine(" + JSON.stringify(deps) + ", function(" +
				ases.join(", ") + "){\n" +
				"\tvar __interop = function(m){if(m && m['default']) {return m['default'];}else if(m) return m;};\n\n" +
				"\tvar viewModel = __interop(typeof viewModel !== 'undefined' ? viewModel : undefined);\n" +
				"\tvar ComponentConstructor = Component.extend({\n" +
				"\t\ttag: '" + tagName + "',\n" +
				"\t\ttemplate: __interop(typeof template !== 'undefined' ? template : undefined),\n" +
				"\t\tviewModel: viewModel,\n" +
				"\t\tevents: __interop(typeof events !== 'undefined' ? events : undefined),\n" +
				"\t\thelpers: __interop(typeof helpers !== 'undefined' ? helpers : undefined)\n" +
				"\t});\n\n" +
				"\treturn {\n" +
				"\t\tComponent: ComponentConstructor,\n" +
				"\t\tviewModel: viewModel\n" +
				"\t};\n" +
				"});";
		});

	}

	return {
		translate: translate
	};

});
