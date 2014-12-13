steal("can/view/stache", "can/view/scope", function(stache, Scope){

	var escMap = {
		'\n': "\\n",
		'\r': "\\r",
		'\u2028': "\\u2028",
		'\u2029': "\\u2029"
	};

	var esc = function (string) {
		return ('' + string)
			.replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
				if ("'\"\\".indexOf(character) >= 0) {
					return "\\" + character;
				} else {
					return escMap[character];
				}
			});
	};

	/**
	 * Finds multiple patterns of dependencies and turns them into static
	 * dependencies of the .stache module. All syntaxes are converted to a
	 * single `{{@import name parentName=parentName
	 * parentAddress=parentAddress isPartial=isPartial}}` syntax that will
	 * by dynamically handled by the `@import` helper.
	 *
	 * Returns an object with an array of static dependencies in `deps` and
	 * the new, transformed source in `source`.
	 */
	function scanDependencies(string) {
		// TODO - it would be nice to have a real parser preprocess the
		// template as proper html and extracts these (and the {{@import
		// ...}} tags) more correctly than this regex mess does. For now,
		// though, hack it!
		var re = new RegExp("(?:"+([
			// * {{>(this right here)}}
			/{{>\s*([^{}]+)\s*}}/.source,
			// * {{@import "(this right here)"}}
			/{{\s*@import\s+["']([^{}]+)['"]\s*}}/.source,
			// * <link rel="import" href="(this one)">
			/<\s*link\s*rel=['"]?import['"]?\s*href=['"]?([^'">]+)['"]?\s*\/?\s*>/.source,
			// * <link href="(this one)" rel=import>
			/<\s*link\s*href=['"]?([^"'>]+)['"]?\s*rel=['"]?import['"]?\s*\/?\s*>/.source
		].join("|")) + ")", "g");
		var deps = [],
			nthDep = 2,
			str = string.replace(re, function(match) {
				var name;
				for (var i = 1; i < arguments.length; i++) {
					name = arguments[i];
					if (name) { break; }
				}
				if (name) {
					deps.push(name.trim());
					return '{{___local_import___ "'+(nthDep++)+
						'" isPartial="'+(~match.indexOf("{{>") ? "true" : "")+
						'"}}';
				} else {
					return match;
				}
			});
		return {deps: deps, source: str};
	}

	function loader(stache, Scope) {
		var tpl = stache("TEMPLATE_GOES_HERE");
		var deps = arguments;
		return function(data, helpers) {
			var help = helpers instanceof Scope ?
					helpers :
					new Scope(help||{});
			return tpl(data, help.add({
				___local_import___: function(nth, options) {
					var mod = deps[+nth];
					if (mod && mod.isPartial) {
						return mod(options.scope, helpers);
					} else {
						return "";
					}
				}
			}));
		};
	}

	function translate(load) {
		var depsScanned = scanDependencies(load.source, load.name, load.address);
		var deps = [
			"can/view/stache/stache",
			"can/view/scope/scope"
		].concat(depsScanned.deps);
		return "define("+JSON.stringify(deps)+","+
			((""+loader).replace("TEMPLATE_GOES_HERE", esc(depsScanned.source)))+
			");";
	}

	return {
		translate: translate
	};

});
