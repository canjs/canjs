var pluginify = require('steal').build.pluginify;
var fs = require('fs');
var path = require('path');

var modules = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/../builder.json'))).modules;
var testsToPluginify = [];

for(var k in modules){
	if(modules.hasOwnProperty(k)){
		testsToPluginify.push(k + "/" + k.split('/').pop() + '_test.js');
	}
}

console.log(testsToPluginify)

pluginify(testsToPluginify, {
	ignore: ['can/test/pluginify.js', /^((?!test\.js).)*$/],
	steal: {
		root: path.normalize(__dirname + "/../.."),
		map: {
			'*': {
				'jquery/jquery.js' : 'lib/jquery/jquery.js',
			}
		},
		shim: {
			'jquery': {
				'exports': 'jQuery'
			}
		}
	},
	shim: {
		'jquery/jquery.js': 'jQuery'
	}
}, function(error, content) {
	fs.exists('pluginified', function(exists) {
		if(!exists) {
			fs.mkdir('pluginified');
		};

		fs.writeFile(__dirname + '/pluginified/pluginified.js', content);
	});
});
