load("can/build/underscore.js");
var _ = this._;

load("steal/rhino/rhino.js");
steal("can/test/configuration.js", 'steal/build/pluginify', "steal/generate/ejs.js", 'can/build/settings.js',
function (testConfig, pluginify, EJS, libs) {
	// Use with ./js can/build/dist.js <outputfolder> <version> <library1> <library2>
	var version = _args[1] || 'edge';
	var libraries = _args[2] ? _args.slice(2) : _.keys(libs);
	var outFolder = (_args[0] || 'can/dist/') + version + '/';
	var testFolder = outFolder + '/test/';
	var render = function (from, to, data) {
		var text = readFile(from);

		var res = new EJS({
			text : text,
			name : from
		}).render(data);
		steal.File(to).save(res);
	}

	console.log(libraries);
	steal.File(outFolder).mkdirs();
	steal.File(testFolder).mkdirs();

	_.each(libraries, function (lib) {
		var options = libs[lib],
			outFile = outFolder + "/can." + lib + "-" + version + ".js",
			testFile = testFolder + lib + '.html',
			defaults = {
				out : outFile,
				onefunc : true,
				compress : false,
				skipAll : true
			};

		console.log('Building ' + lib + ' ' + version + ' to ' + outFile);
		steal.build.pluginify("can/build/make/" + lib + ".js", _.extend(defaults, options));

		console.log('Creating distributable test HTML file ' + testFile);
		render('can/build/templates/test.html.ejs', testFile, {
			name : testConfig[lib].name,
			dist : testConfig[lib].dist,
			version : version,
			type : lib
		});
		new steal.File('can/build/templates/qunit.js').copyTo(testFolder + '/qunit.js');
		new steal.File('can/build/templates/index.html').copyTo(testFolder + '/index.html');
	});
});
